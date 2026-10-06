import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  neuralBg,
  neuralBgRaised,
  neuralBorderSoft,
  neuralText,
  neuralTextMuted,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import { isRealSpeechToTextAvailable } from '../../services/voice/SpeechToTextService';
import NeuralBrain from '../../components/NeuralBrain/NeuralBrain';
import MessageBubble from '../../components/MessageBubble/MessageBubble';
import VoiceOrb from '../../components/VoiceOrb/VoiceOrb';
import {
  CONVERSATION_EMPTY_SUBTITLE,
  CONVERSATION_EMPTY_TITLE,
  NEURAL_OS_LABEL,
} from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.MAIN>;

const MainAssistantScreen: React.FC<Props> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const { session } = useAuth();
  const { state, messages, errorMessage, toggleConversation, stopConversation } = useAssistant();
  const listRef = useRef<FlatList>(null);
  // The list stays hidden until layout has gone quiet for a moment (no new
  // layout/content-size events for SETTLE_DELAY_MS), so the screen never
  // visibly scrolls in front of the user (WhatsApp-style "already at the
  // bottom" open) — it just fades in already positioned. Revealing on the
  // very first layout event was too early: item heights (text wrapping)
  // were still settling, so a further scroll adjustment happened visibly
  // right after the list became visible.
  const [isListVisible, setIsListVisible] = useState(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True while the user is at (or near) the bottom. Only then may a content
  // size change pull the list down. Otherwise scrolling up makes FlatList
  // render older rows, the size changes, and the list got yanked straight
  // back to the bottom — so older messages could not be read.
  const stickToBottomRef = useRef(true);
  const previousCountRef = useRef(0);

  useEffect(() => {
    if (messages.length === 0) {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      setIsListVisible(false);
    }
  }, [messages.length]);

  // A message just arrived (the user's own, or the AI's reply): follow it
  // even if they had scrolled up.
  useEffect(() => {
    const hasNewMessage = messages.length > previousCountRef.current;
    previousCountRef.current = messages.length;
    if (!hasNewMessage || !isListVisible) {
      return undefined;
    }
    stickToBottomRef.current = true;
    // The content-size event for the new row may already have fired before
    // the flag flipped, so follow it explicitly once the row is laid out.
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages.length, isListVisible]);

  const NEAR_BOTTOM_PX = 120;
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_PX;
  };

  const SETTLE_DELAY_MS = 150;

  // Fires on every layout/content-size event — first while still settling
  // (content height not final yet, item text still wrapping), and later
  // whenever a new message is appended.
  const positionListToEnd = () => {
    if (isListVisible) {
      if (stickToBottomRef.current) {
        listRef.current?.scrollToEnd({ animated: true });
      }
      return;
    }

    listRef.current?.scrollToEnd({ animated: false });

    // Still hidden: push the reveal back out. Only once layout has been
    // quiet for SETTLE_DELAY_MS do we do one final snap and reveal.
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
    revealTimeoutRef.current = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: false });
      setIsListVisible(true);
    }, SETTLE_DELAY_MS);
  };

  // Leaving this screen (e.g. to Profile) shouldn't leave the assistant
  // talking/listening in the background — stop it, and only allow it to
  // start again once the user is back here and taps the mic.
  useFocusEffect(
    React.useCallback(() => {
      return () => stopConversation();
    }, [stopConversation]),
  );

  const assistantName = session?.assistantConfiguration.assistantName ?? '';

  return (
    <View style={styles.container}>
      <NeuralBrain width={width} height={height} state={state} />

      <SafeAreaView style={BaseStyle.flex} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.logoChip}>
            <Icon name="creation" size={wp(5)} color="#C4B5FD" />
          </View>
          <View style={BaseStyle.flex}>
            <Text style={styles.brand}>{assistantName || 'AI.me'}</Text>
            <Text style={styles.brandSub}>{NEURAL_OS_LABEL}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="account-circle-outline" size={wp(7)} color={neuralText} />
          </TouchableOpacity>
        </View>

        <View style={styles.conversationArea}>
          {messages.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>{CONVERSATION_EMPTY_TITLE}</Text>
              <Text style={styles.emptySubtitle}>{CONVERSATION_EMPTY_SUBTITLE}</Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              style={!isListVisible && styles.hiddenList}
              onLayout={positionListToEnd}
              onContentSizeChange={positionListToEnd}
              onScroll={handleScroll}
              scrollEventThrottle={64}
            />
          )}
        </View>

        {!!errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.voiceArea}>
          <VoiceOrb state={state} onPress={toggleConversation} />
          {__DEV__ && (
            <Text style={styles.debugLabel}>
              Mic: {isRealSpeechToTextAvailable() ? 'real device module' : 'MOCK fallback (native module not found)'}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    backgroundColor: neuralBg,
  },
  header: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    paddingHorizontal: spacings.large,
    paddingVertical: spacings.normalx,
  },
  logoChip: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(10),
    height: wp(10),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: neuralBorderSoft,
    backgroundColor: neuralBgRaised,
    marginRight: spacings.normalx,
  },
  brand: {
    color: neuralText,
    ...fontStyle.fontSizeMedium1x,
    ...fontStyle.fontWeightBold,
  },
  brandSub: {
    color: neuralTextMuted,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 1,
  },
  conversationArea: {
    ...BaseStyle.flex,
    paddingHorizontal: spacings.large,
  },
  listContent: {
    paddingVertical: spacings.large,
  },
  hiddenList: {
    opacity: 0,
  },
  emptyWrap: {
    ...BaseStyle.flex,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacings.large,
  },
  emptyTitle: {
    color: neuralText,
    ...fontStyle.fontSizeMedium,
    ...fontStyle.fontWeightThin1x,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: neuralTextMuted,
    ...fontStyle.fontSizeNormal,
    textAlign: 'center',
    marginTop: spacings.xsmall,
    paddingHorizontal: spacings.xxLarge,
  },
  errorBanner: {
    marginHorizontal: spacings.large,
    marginBottom: spacings.normalx,
    backgroundColor: 'rgba(239,68,68,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 12,
    padding: spacings.normalx,
  },
  errorText: {
    color: '#fca5a5',
    ...fontStyle.fontSizeSmall2x,
    textAlign: 'center',
  },
  voiceArea: {
    ...BaseStyle.alignJustifyCenter,
    paddingVertical: spacings.large,
    width: wp(100),
  },
  debugLabel: {
    marginTop: spacings.normalx,
    color: neuralTextMuted,
    ...fontStyle.fontSizeSmall,
    textAlign: 'center',
  },
});

export default MainAssistantScreen;
