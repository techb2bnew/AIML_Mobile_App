export const ROUTES = {
  SPLASH: 'Splash',
  LOGIN: 'Login',
  MAIN: 'Main',
  PROFILE: 'Profile',
  PRIVACY_POLICY: 'PrivacyPolicy',
  TERMS_OF_SERVICE: 'TermsOfService',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export type RootStackParamList = {
  [ROUTES.SPLASH]: undefined;
  [ROUTES.LOGIN]: undefined;
  [ROUTES.MAIN]: undefined;
  [ROUTES.PROFILE]: undefined;
  [ROUTES.PRIVACY_POLICY]: undefined;
  [ROUTES.TERMS_OF_SERVICE]: undefined;
};
