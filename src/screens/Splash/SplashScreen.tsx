import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import { splashBgColor, splashText, whiteColor } from '../../constant/Color';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { APP_DISPLAY_NAME, SPLASH_TAGLINE } from '../../constants/text/en';
import Loader from '../../components/Loader/Loader';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.SPLASH>;

// Keeps the branding visible for at least this long, even once the session
// check resolves instantly, so the splash doesn't just flash on screen.
const MIN_SPLASH_DURATION_MS = 1800;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { session, isHydrating } = useAuth();

  useEffect(() => {
    if (isHydrating) {
      return undefined;
    }

    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: session ? ROUTES.MAIN : ROUTES.LOGIN }],
      });
    }, MIN_SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isHydrating, session, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>{APP_DISPLAY_NAME}</Text>
      <Text style={styles.tagline}>{SPLASH_TAGLINE}</Text>
      <View style={styles.loaderWrapper}>
        <Loader color={whiteColor} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    ...BaseStyle.alignJustifyCenter,
    backgroundColor: splashBgColor,
  },
  title: {
    color: whiteColor,
    ...fontStyle.fontSizeExtraLarge,
    ...fontStyle.fontWeightBold,
    letterSpacing: 2,
  },
  tagline: {
    color: splashText,
    ...fontStyle.fontSizeNormal1x,
    marginTop: spacings.small,
  },
  loaderWrapper: {
    marginTop: spacings.ExtraLarge,
  },
});

export default SplashScreen;
