import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import {
  neuralBlue,
  neuralCyan,
  neuralMagenta,
  neuralViolet,
  onAccent,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { AssistantState } from '../../types/conversation';

interface VoiceOrbProps {
  state: AssistantState;
  disabled?: boolean;
  onPress: () => void;
}

// The orb takes the same colour as the neural core behind it, so the two
// always read as one thing reacting to the same state.
const STATE_COLOR: Record<AssistantState, string> = {
  idle: neuralViolet,
  listening: neuralCyan,
  processing: neuralMagenta,
  speaking: neuralBlue,
  error: '#ef4444',
};

const ORB_SIZE = wp(19);

const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, disabled, onPress }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isAnimated = state === 'listening' || state === 'speaking' || state === 'processing';
    pulse.setValue(1);

    if (!isAnimated) {
      return undefined;
    }

    const duration = state === 'processing' ? 500 : 650;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.16,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [state, pulse]);

  const color = STATE_COLOR[state];

  return (
    <View style={BaseStyle.alignJustifyCenter}>
      <Animated.View
        style={[
          styles.ring,
          { borderColor: color, backgroundColor: `${color}22`, transform: [{ scale: pulse }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={disabled}
          onPress={onPress}
          style={[
            styles.orb,
            { backgroundColor: color, shadowColor: color },
            disabled && styles.orbDisabled,
          ]}
        >
          <Icon
            name={state === 'error' ? 'microphone-off' : 'microphone'}
            size={wp(8)}
            color={onAccent}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    ...BaseStyle.alignJustifyCenter,
    width: ORB_SIZE + 24,
    height: ORB_SIZE + 24,
    borderRadius: (ORB_SIZE + 24) / 2,
    borderWidth: 1.5,
  },
  orb: {
    ...BaseStyle.alignJustifyCenter,
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  orbDisabled: {
    opacity: 0.6,
  },
});

export default VoiceOrb;
