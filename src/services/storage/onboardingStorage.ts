import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@aime/onboardingSeen';

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    // If storage is unreadable, skip onboarding rather than trap the user in it.
    return true;
  }
};

export const markOnboardingSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Worst case the intro shows again next launch.
  }
};
