import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { authMutedColor, splashBgColor, whiteColor } from '../../constant/Color';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import { ApiError, login } from '../../services/api/authApi';
import Button from '../../components/Button/Button';
import TextInputField from '../../components/TextInputField/TextInputField';
import {
  APP_DISPLAY_NAME,
  EMAIL_LABEL,
  EMAIL_PLACEHOLDER,
  LOGGING_IN,
  LOGIN_BUTTON,
  LOGIN_ERROR_EMPTY,
  LOGIN_ERROR_INVALID,
  LOGIN_SUBTITLE,
  LOGIN_TITLE,
  PASSWORD_LABEL,
  PASSWORD_PLACEHOLDER,
} from '../../constants/text/en';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.LOGIN>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login: setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(LOGIN_ERROR_EMPTY);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const session = await login({ email, password });
      await setSession(session);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.MAIN }] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : LOGIN_ERROR_INVALID);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.brand}>{APP_DISPLAY_NAME}</Text>
        <Text style={styles.title}>{LOGIN_TITLE}</Text>
        <Text style={styles.subtitle}>{LOGIN_SUBTITLE}</Text>

        <View style={styles.form}>
          <TextInputField
            label={EMAIL_LABEL}
            placeholder={EMAIL_PLACEHOLDER}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInputField
            label={PASSWORD_LABEL}
            placeholder={PASSWORD_PLACEHOLDER}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={error ?? undefined}
          />

          <Button
            label={isSubmitting ? LOGGING_IN : LOGIN_BUTTON}
            onPress={handleLogin}
            loading={isSubmitting}
            style={styles.loginButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    backgroundColor: splashBgColor,
  },
  content: {
    ...BaseStyle.flex,
    justifyContent: 'center',
    paddingHorizontal: spacings.xLarge,
  },
  brand: {
    color: whiteColor,
    ...fontStyle.fontSizeLargeX,
    ...fontStyle.fontWeightBold,
    marginBottom: spacings.xxLarge,
  },
  title: {
    color: whiteColor,
    ...fontStyle.fontSizeLarge,
    ...fontStyle.fontWeightMedium,
  },
  subtitle: {
    color: authMutedColor,
    ...fontStyle.fontSizeNormal1x,
    marginTop: spacings.xsmall,
    marginBottom: spacings.xxLarge,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacings.normalx,
  },
});

export default LoginScreen;
