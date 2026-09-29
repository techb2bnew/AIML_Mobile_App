import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentColor,
  brandWashSoft,
  dangerColor,
  onAccent,
  textMuted,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { AssistantState } from '../../types/conversation';
import {
  STATE_ERROR,
  STATE_IDLE,
  STATE_LISTENING,
  STATE_PROCESSING,
  STATE_SPEAKING,
} from '../../constants/text/en';

interface VoiceOrbProps {
  state: AssistantState;
  disabled?: boolean;
  onPress: () => void;
}

const STATE_LABEL: Record<AssistantState, string> = {
  idle: STATE_IDLE,
  listening: STATE_LISTENING,
  processing: STATE_PROCESSING,
  speaking: STATE_SPEAKING,
  error: STATE_ERROR,
};

const ORB_SIZE = wp(22);

const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, disabled, onPress }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isAnimated = state === 'listening' || state === 'speaking' || state === 'processing';
    pulse.setValue(1);

    if (!isAnimated) {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: state === 'processing' ? 500 : 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: state === 'processing' ? 500 : 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [state, pulse]);

  const ringColor = state === 'error' ? dangerColor : accentColor;

  return (
    <View style={BaseStyle.alignJustifyCenter}>
      <Animated.View
        style={[
          styles.ring,
          { borderColor: ringColor, transform: [{ scale: pulse }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={disabled}
          onPress={onPress}
          style={[styles.orb, { backgroundColor: ringColor }, disabled && styles.orbDisabled]}
        >
          <Icon
            name={state === 'error' ? 'microphone-off' : 'microphone'}
            size={wp(9)}
            color={onAccent}
          />
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.stateLabel}>{STATE_LABEL[state]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    ...BaseStyle.alignJustifyCenter,
    width: ORB_SIZE + 24,
    height: ORB_SIZE + 24,
    borderRadius: (ORB_SIZE + 24) / 2,
    borderWidth: 2,
    backgroundColor: brandWashSoft,
  },
  orb: {
    ...BaseStyle.alignJustifyCenter,
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
  },
  orbDisabled: {
    opacity: 0.6,
  },
  stateLabel: {
    marginTop: spacings.normalx,
    color: textMuted,
    ...fontStyle.fontSizeNormal,
    ...fontStyle.fontWeightThin1x,
  },
});

export default VoiceOrb;
