import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_KEY = '@aime/assistantVoiceId';

// `undefined` = not read from storage yet, `null` = read, nothing chosen
// (use the built-in Rex/Aria default). Cached so every spoken reply doesn't
// hit AsyncStorage.
let cached: string | null | undefined;

export const getPreferredVoiceId = async (): Promise<string | null> => {
  if (cached !== undefined) {
    return cached;
  }
  try {
    cached = await AsyncStorage.getItem(VOICE_KEY);
  } catch {
    cached = null;
  }
  return cached;
};

export const setPreferredVoiceId = async (voiceId: string | null): Promise<void> => {
  cached = voiceId;
  if (voiceId) {
    await AsyncStorage.setItem(VOICE_KEY, voiceId);
  } else {
    await AsyncStorage.removeItem(VOICE_KEY);
  }
};
