import { PermissionsAndroid, Platform } from 'react-native';

// Isolates mic-permission handling behind one function. Android uses the
// built-in PermissionsAndroid API (no extra dependency). iOS has no
// equivalent built into RN core; until a real permission/voice library is
// added, iOS is treated as always-granted here so the rest of the voice
// flow can be exercised — swap this branch for a real check later.
export const requestMicPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};
