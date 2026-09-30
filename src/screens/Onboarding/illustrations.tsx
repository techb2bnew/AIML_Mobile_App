import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentColor,
  authInputBg,
  authMutedColor,
  brandWashFaint,
  brandWashMid,
  brandWashSoft,
  onAccent,
  whiteColor,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import {
  ONBOARDING_SAMPLE_ANSWER_LINES,
  ONBOARDING_SAMPLE_QUESTION,
  ONBOARDING_SAMPLE_VOICES,
} from '../../constants/text/en';

export type IllustrationKey = 'talk' | 'listen' | 'voice';

// A soft glow behind each illustration so the dark page has some depth.
const Glow: React.FC<{ size: number; color: string; style?: object }> = ({ size, color, style }) => (
  <View
    style={[
      { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      style,
    ]}
  />
);

// Equalizer bars: each one loops at its own pace so they never move in sync.
const BAR_DURATIONS = [520, 760, 620, 880, 560, 720, 600];
const WaveBars: React.FC<{ color?: string; height?: number }> = ({ color = accentColor, height = 44 }) => {
  const values = useRef(BAR_DURATIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = values.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: BAR_DURATIONS[i],
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: BAR_DURATIONS[i],
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [values]);

  return (
    <View style={[styles.waveRow, { height }]}>
      {values.map((value, i) => (
        <Animated.View
          key={BAR_DURATIONS[i]}
          style={[
            styles.waveBar,
            {
              height,
              backgroundColor: color,
              transform: [
                { scaleY: value.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const TalkIllustration: React.FC = () => (
  <View style={styles.stage}>
    <Glow size={wp(70)} color={brandWashFaint} />
    <Glow size={wp(50)} color={brandWashSoft} />

    <View style={[styles.bubble, styles.userBubble]}>
      <Text style={styles.userBubbleText}>{ONBOARDING_SAMPLE_QUESTION}</Text>
    </View>

    <View style={styles.orb}>
      <Icon name="microphone" size={wp(13)} color={onAccent} />
    </View>

    <View style={styles.waveWrap}>
      <WaveBars />
    </View>
  </View>
);

const ListenIllustration: React.FC = () => (
  <View style={styles.stage}>
    <Glow size={wp(70)} color={brandWashFaint} />

    <View style={[styles.bubble, styles.userBubble, styles.smallUserBubble]}>
      <Text style={styles.userBubbleText}>{ONBOARDING_SAMPLE_QUESTION}</Text>
    </View>

    <View style={styles.aiCard}>
      <View style={styles.aiHeader}>
        <View style={styles.aiAvatar}>
          <Icon name="robot-happy-outline" size={wp(5.5)} color={onAccent} />
        </View>
        <Text style={styles.aiName}>AIME</Text>
        <View style={styles.speakerBadge}>
          <Icon name="volume-high" size={wp(4.5)} color={accentColor} />
        </View>
      </View>
      {ONBOARDING_SAMPLE_ANSWER_LINES.map(line => (
        <Text key={line} style={styles.aiText}>
          {line}
        </Text>
      ))}
      <View style={styles.aiWave}>
        <WaveBars height={26} />
      </View>
    </View>
  </View>
);

const VoiceIllustration: React.FC = () => (
  <View style={styles.stage}>
    <Glow size={wp(70)} color={brandWashFaint} />
    <View style={styles.pickerCard}>
      {ONBOARDING_SAMPLE_VOICES.map((name, i) => {
        const isSelected = i === 1;
        return (
          <View key={name} style={[styles.pickerRow, isSelected && styles.pickerRowSelected]}>
            <View style={[styles.pickerIcon, isSelected && styles.pickerIconSelected]}>
              <Icon name="volume-high" size={wp(4.5)} color={isSelected ? onAccent : accentColor} />
            </View>
            <Text style={styles.pickerName}>{name}</Text>
            <Icon
              name={isSelected ? 'check-circle' : 'circle-outline'}
              size={wp(5.5)}
              color={isSelected ? accentColor : authMutedColor}
            />
          </View>
        );
      })}
    </View>
  </View>
);

export const ILLUSTRATIONS: Record<IllustrationKey, React.FC> = {
  talk: TalkIllustration,
  listen: ListenIllustration,
  voice: VoiceIllustration,
};

const STAGE_HEIGHT = wp(78);
const ORB_SIZE = wp(28);

const styles = StyleSheet.create({
  stage: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(86),
    height: STAGE_HEIGHT,
  },
  waveRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    justifyContent: 'center',
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  waveWrap: {
    position: 'absolute',
    bottom: wp(2),
  },
  orb: {
    ...BaseStyle.alignJustifyCenter,
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: accentColor,
    borderWidth: 5,
    borderColor: brandWashMid,
    shadowColor: accentColor,
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  bubble: {
    position: 'absolute',
    paddingHorizontal: spacings.normalx,
    paddingVertical: spacings.small,
    borderRadius: 18,
  },
  userBubble: {
    top: wp(4),
    right: 0,
    backgroundColor: accentColor,
    borderBottomRightRadius: 4,
  },
  smallUserBubble: {
    top: wp(2),
  },
  userBubbleText: {
    color: onAccent,
    ...fontStyle.fontSizeSmall2x,
    ...fontStyle.fontWeightMedium,
  },
  aiCard: {
    width: wp(72),
    marginTop: wp(10),
    padding: spacings.normalx,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    backgroundColor: whiteColor,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  aiHeader: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    marginBottom: spacings.small,
  },
  aiAvatar: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    backgroundColor: accentColor,
    marginRight: spacings.small,
  },
  aiName: {
    flex: 1,
    color: '#141924',
    ...fontStyle.fontSizeNormal1x,
    ...fontStyle.fontWeightMedium,
  },
  speakerBadge: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: brandWashSoft,
  },
  aiText: {
    color: '#3C4453',
    ...fontStyle.fontSizeNormal1x,
    lineHeight: 22,
  },
  aiWave: {
    marginTop: spacings.normalx,
    alignItems: 'flex-start',
  },
  pickerCard: {
    width: wp(72),
    padding: spacings.small,
    borderRadius: 24,
    backgroundColor: authInputBg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '-3deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  pickerRow: {
    ...BaseStyle.flexDirectionRow,
    ...BaseStyle.alignItemsCenter,
    padding: spacings.normalx,
    borderRadius: 16,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerRowSelected: {
    backgroundColor: brandWashSoft,
    borderColor: accentColor,
  },
  pickerIcon: {
    ...BaseStyle.alignJustifyCenter,
    width: wp(9),
    height: wp(9),
    borderRadius: wp(3),
    backgroundColor: brandWashSoft,
    marginRight: spacings.normalx,
  },
  pickerIconSelected: {
    backgroundColor: accentColor,
  },
  pickerName: {
    flex: 1,
    color: whiteColor,
    ...fontStyle.fontSizeNormal2x,
  },
});
