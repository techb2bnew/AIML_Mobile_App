import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  authBorderColor,
  authInputBg,
  authMutedColor,
  dangerColor,
  whiteColor,
} from '../../constant/Color';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '../../utils';

interface TextInputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  style,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = !!secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={BaseStyle.positionRelative}>
        <TextInput
          {...rest}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          placeholderTextColor={authMutedColor}
          onFocus={e => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            isPasswordField && styles.inputWithIcon,
            isFocused && styles.inputFocused,
            !!error && styles.inputError,
            style,
          ]}
        />
        {isPasswordField && (
          <TouchableOpacity
            style={styles.eyeButton}
            hitSlop={styles.eyeHitSlop}
            onPress={() => setIsPasswordVisible(prev => !prev)}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={wp(5.5)}
              color={authMutedColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacings.medium,
  },
  label: {
    color: authMutedColor,
    ...fontStyle.fontSizeSmall2x,
    ...fontStyle.fontWeightThin1x,
    marginBottom: spacings.xsmall,
  },
  input: {
    height: hp(5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authBorderColor,
    backgroundColor: authInputBg,
    paddingHorizontal: spacings.normalx,
    color: whiteColor,
    ...fontStyle.fontSizeNormal1x,
  },
  inputWithIcon: {
    paddingRight: wp(11),
  },
  inputFocused: {
    borderColor: whiteColor,
  },
  inputError: {
    borderColor: dangerColor,
  },
  eyeButton: {
    position: 'absolute',
    right: spacings.normalx,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeHitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  errorText: {
    color: dangerColor,
    ...fontStyle.fontSizeSmall1x,
    marginTop: spacings.xsmall,
  },
});

export default TextInputField;
