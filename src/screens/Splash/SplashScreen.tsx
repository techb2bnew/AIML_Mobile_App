import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaseStyle } from '../../constant/Style';
import { style as fontStyle, spacings } from '../../constant/Fonts';
import {
  accentColor,
  brandWashFaint,
  brandWashMid,
  brandWashSoft,
  onAccent,
  splashBgColor,
  splashText,
  whiteColor,
} from '../../constant/Color';
import { widthPercentageToDP as wp } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, RootStackParamList } from '../../navigation/routes';
import { APP_DISPLAY_NAME, SPLASH_TAGLINE } from '../../constants/text/en';
import { hasSeenOnboarding } from '../../services/storage/onboardingStorage';
import Loader from '../../components/Loader/Loader';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.SPLASH>;

// Keeps the branding visible for at least this long, even once the session
// check resolves instantly, so the splash doesn't just flash on screen.
const MIN_SPLASH_DURATION_MS = 1800;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { session, isHydrating } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] });
  const logoTranslate = fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  useEffect(() => {
    if (isHydrating) {
      return undefined;
    }

    // First-time visitors (no session, intro never seen) get the onboarding
    // slides before the login form.
    let isCancelled = false;
    const minimumDelay = new Promise<void>(resolve => setTimeout(resolve, MIN_SPLASH_DURATION_MS));
    Promise.all([hasSeenOnboarding(), minimumDelay]).then(([hasSeen]) => {
      if (isCancelled) {
        return;
      }
      const target = session ? ROUTES.MAIN : hasSeen ? ROUTES.LOGIN : ROUTES.ONBOARDING;
      navigation.reset({ index: 0, routes: [{ name: target }] });
    });

    return () => {
      isCancelled = true;
    };
  }, [isHydrating, session, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[styles.center, { opacity: fade, transform: [{ translateY: logoTranslate }] }]}
      >
        <View style={styles.logoArea}>
          <Animated.View
            style={[styles.pulseRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
          />
          <View style={styles.haloOuter}>
            <View style={styles.haloInner}>
              <View style={styles.logo}>
                <Icon name="microphone" size={wp(11)} color={onAccent} />
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.title}>{APP_DISPLAY_NAME}</Text>
        <Text style={styles.tagline}>{SPLASH_TAGLINE}</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fade }]}>
        <Loader color={whiteColor} />
      </Animated.View>
    </View>
  );
};

const LOGO_SIZE = wp(24);

const styles = StyleSheet.create({
  container: {
    ...BaseStyle.flex,
    ...BaseStyle.alignJustifyCenter,
    backgroundColor: splashBgColor,
  },
  center: {
    ...BaseStyle.alignJustifyCenter,
  },
  logoArea: {
    ...BaseStyle.alignJustifyCenter,
    marginBottom: spacings.xxLarge,
  },
  pulseRing: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 2,
    borderColor: accentColor,
  },
  haloOuter: {
    ...BaseStyle.alignJustifyCenter,
    padding: spacings.normalx,
    borderRadius: 999,
    backgroundColor: brandWashFaint,
  },
  haloInner: {
    ...BaseStyle.alignJustifyCenter,
    padding: spacings.normalx,
    borderRadius: 999,
    backgroundColor: brandWashSoft,
  },
  logo: {
    ...BaseStyle.alignJustifyCenter,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: accentColor,
    borderWidth: 4,
    borderColor: brandWashMid,
    shadowColor: accentColor,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    color: whiteColor,
    ...fontStyle.fontSizeExtraLarge,
    ...fontStyle.fontWeightBold,
    letterSpacing: 6,
  },
  tagline: {
    color: splashText,
    ...fontStyle.fontSizeNormal1x,
    marginTop: spacings.small,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: spacings.ExtraLarge,
  },
});

export default SplashScreen;
