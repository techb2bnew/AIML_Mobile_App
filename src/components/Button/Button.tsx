import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { accentColor, dangerColor, disabledBg, disabledText, onAccent } from '../../constant/Color';
import { heightPercentageToDP as hp } from '../../utils';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'danger';
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        variant === 'danger' ? styles.danger : styles.primary,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={onAccent} />
      ) : (
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    ...BaseStyle.alignJustifyCenter,
    height: hp(5),
    borderRadius: 12,
    paddingHorizontal: spacings.large,
  },
  primary: {
    backgroundColor: accentColor,
  },
  danger: {
    backgroundColor: dangerColor,
  },
  disabled: {
    backgroundColor: disabledBg,
  },
  label: {
    color: onAccent,
    ...fontStyle.fontSizeNormal2x,
    ...fontStyle.fontWeightMedium,
  },
  labelDisabled: {
    color: disabledText,
  },
});

export default Button;
