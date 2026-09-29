import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { appBg, dangerColor, dangerSoft, textFaint, textMuted } from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import { isRealSpeechToTextAvailable } from '../../services/voice/SpeechToTextService';
import Header from '../../components/Header/Header';
import MessageBubble from '../../components/MessageBubble/MessageBubble';
import VoiceOrb from '../../components/VoiceOrb/VoiceOrb';
import {
  ASSISTANT_HEADER_SUBTITLE,
  CONVERSATION_EMPTY_SUBTITLE,
  CONVERSATION_EMPTY_TITLE,
} from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.MAIN>;

const MainAssistantScreen: React.FC<Props> = ({ navigation }) => {
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

  useEffect(() => {
    if (messages.length === 0) {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      setIsListVisible(false);
    }
  }, [messages.length]);

  const SETTLE_DELAY_MS = 150;

  // Fires on every layout/content-size event — first while still settling
  // (content height not final yet, item text still wrapping), and later
  // whenever a new message is appended.
  const positionListToEnd = () => {
    listRef.current?.scrollToEnd({ animated: isListVisible });

    if (isListVisible) {
      return;
    }

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={assistantName}
        subtitle={ASSISTANT_HEADER_SUBTITLE}
        rightIconName="account-circle-outline"
        onRightPress={() => navigation.navigate(ROUTES.PROFILE)}
      />

      <View style={styles.body}>
        <View style={styles.conversationArea}>
          {messages.length === 0 ? (
            <View style={[BaseStyle.flex, BaseStyle.alignJustifyCenter]}>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    // Matches the Header's background so the status-bar area reads as one
    // continuous bar instead of a grey strip sitting above a white one.
    ...BaseStyle.surfaceGradientBg,
  },
  body: {
    ...BaseStyle.flex,
    backgroundColor: appBg,
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
  emptyTitle: {
    color: textMuted,
    ...fontStyle.fontSizeMedium,
    ...fontStyle.fontWeightThin1x,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: textFaint,
    ...fontStyle.fontSizeNormal1x,
    textAlign: 'center',
    marginTop: spacings.xsmall,
    paddingHorizontal: spacings.xxLarge,
  },
  errorBanner: {
    marginHorizontal: spacings.large,
    marginBottom: spacings.normalx,
    backgroundColor: dangerSoft,
    borderRadius: 10,
    padding: spacings.normalx,
  },
  errorText: {
    color: dangerColor,
    ...fontStyle.fontSizeSmall2x,
    textAlign: 'center',
  },
  voiceArea: {
    ...BaseStyle.alignJustifyCenter,
    paddingVertical: spacings.xLarge,
    width: wp(100),
  },
  debugLabel: {
    marginTop: spacings.normalx,
    color: textFaint,
    ...fontStyle.fontSizeSmall,
    textAlign: 'center',
  },
});

export default MainAssistantScreen;
