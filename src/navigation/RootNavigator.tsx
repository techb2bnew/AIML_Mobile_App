import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { appBg } from '../constant/Color';
import { ROUTES, RootStackParamList } from './routes';
import SplashScreen from '../screens/Splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import MainAssistantScreen from '../screens/Assistant/MainAssistantScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import VoiceSettingsScreen from '../screens/Profile/VoiceSettingsScreen';
import PrivacyPolicyScreen from '../screens/Legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/Legal/TermsOfServiceScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: appBg } }}>
    <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
    <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
    <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
    <Stack.Screen name={ROUTES.MAIN} component={MainAssistantScreen} />
    <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    <Stack.Screen name={ROUTES.VOICE_SETTINGS} component={VoiceSettingsScreen} />
    <Stack.Screen name={ROUTES.PRIVACY_POLICY} component={PrivacyPolicyScreen} />
    <Stack.Screen name={ROUTES.TERMS_OF_SERVICE} component={TermsOfServiceScreen} />
  </Stack.Navigator>
);

export default RootNavigator;
