import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tts from 'react-native-tts';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentColor,
  accentSoft,
  appBg,
  borderColor,
  cardBg,
  textDark,
  textFaint,
  textMuted,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import { getPreferredVoiceId, setPreferredVoiceId } from '../../services/voice/VoicePreference';
import {
  listSystemVoices,
  realTextToSpeechService,
  SystemVoice,
} from '../../services/voice/TextToSpeechService';
import {
  ASSISTANT_VOICE,
  VOICE_DEFAULT_LABEL,
  VOICE_NONE_FOUND,
  VOICE_PREVIEW_SAMPLE,
  VOICE_SETTINGS_HINT,
} from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.VOICE_SETTINGS>;

const VoiceSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { session } = useAuth();
  const [voices, setVoices] = useState<SystemVoice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listSystemVoices().catch(() => []), getPreferredVoiceId()])
      .then(([available, saved]) => {
        if (isMounted) {
          setVoices(available);
          setSelectedId(saved);
        }
      })
      .finally(() => isMounted && setIsLoading(false));

    return () => {
      isMounted = false;
      try {
        Tts.stop(false).catch(() => undefined);
      } catch {
        // Nothing playing.
      }
    };
  }, []);

  const choose = useCallback(
    (voiceId: string | null) => {
      setSelectedId(voiceId);
      setPreferredVoiceId(voiceId).catch(() => undefined);
      if (!session) {
        return;
      }
      try {
        Tts.stop(false).catch(() => undefined);
      } catch {
        // Nothing playing.
      }
      // The default entry previews with no override, so it uses Rex/Aria.
      realTextToSpeechService
        .speak(VOICE_PREVIEW_SAMPLE, session.aiVoice, voiceId ?? undefined)
        .catch(() => undefined);
    },
    [session],
  );

  const options: Array<{ id: string | null; label: string }> = [
    { id: null, label: `${VOICE_DEFAULT_LABEL} · ${session?.aiVoice.displayName ?? ''}` },
    ...voices,
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={ASSISTANT_VOICE} onBackPress={navigation.goBack} />

      {isLoading ? (
        <View style={[BaseStyle.flex, BaseStyle.alignJustifyCenter]}>
          <ActivityIndicator color={accentColor} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={options}
          keyExtractor={item => item.id ?? 'default'}
          ListHeaderComponent={<Text style={styles.hint}>{VOICE_SETTINGS_HINT}</Text>}
          ListFooterComponent={
            voices.length === 0 ? <Text style={styles.empty}>{VOICE_NONE_FOUND}</Text> : undefined
          }
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => choose(item.id)}
                style={[styles.row, isSelected && styles.rowSelected]}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  <Icon name="volume-high" size={wp(5)} color={accentColor} />
                </View>
                <Text style={styles.label}>{item.label}</Text>
                {isSelected ? (
                  <Icon name="check-circle" size={wp(6)} color={accentColor} />
                ) : (
                  <Icon name="circle-outline" size={wp(6)} color={textFaint} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    ...BaseStyle.surfaceGradientBg,
  },
  list: {
    ...BaseStyle.flex,
    backgroundColor: appBg,
  },
  listContent: {
    padding: spacings.large,
    paddingBottom: spacings.xxLarge,
  },
  hint: {
    color: textMuted,
    ...fontStyle.fontSizeSmall2x,
    marginBottom: spacings.large,
  },
  empty: {
    color: textMuted,
    ...fontStyle.fontSizeSmall2x,
    textAlign: 'center',
    marginTop: spacings.large,
  },
  row: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    backgroundColor: cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor,
    padding: spacings.normalx,
    marginBottom: spacings.small,
  },
  rowSelected: {
    borderColor: accentColor,
    backgroundColor: accentSoft,
  },
  iconWrap: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(9.5),
    height: wp(9.5),
    borderRadius: wp(3),
    backgroundColor: accentSoft,
    marginRight: spacings.normalx,
  },
  iconWrapSelected: {
    backgroundColor: cardBg,
  },
  label: {
    flex: 1,
    color: textDark,
    ...fontStyle.fontSizeNormal2x,
  },
});

export default VoiceSettingsScreen;
