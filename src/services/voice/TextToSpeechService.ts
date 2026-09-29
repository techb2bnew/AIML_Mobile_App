import { Platform } from 'react-native';
import Tts from 'react-native-tts';
import { AiVoiceConfig } from '../../types/user';

// Text-to-speech interface. `realTextToSpeechService` wraps react-native-tts;
// VoiceService only depends on this shape, so a different provider can be
// dropped in later without touching any caller.
export interface TextToSpeechService {
  speak: (text: string, voice: AiVoiceConfig) => Promise<void>;
}

// Safety net in case `tts-finish` never fires for some reason — sized
// generously above the mock duration formula so it never cuts real speech
// short, it just guarantees the promise always settles.
const MAX_SPEAK_TIMEOUT_MS = 15000;

let initPromise: Promise<void> | undefined;

// Runs once, lazily, before the first utterance:
// - iOS: audio is silent by default if the hardware mute switch is on
//   unless the app explicitly asks to ignore it.
// - Android: the TTS engine/voice data may not be installed yet on a fresh
//   emulator/device; without this, `speak()` can silently do nothing.
const ensureInitialized = (): Promise<void> => {
  if (!initPromise) {
    // Wrapped defensively end-to-end: an init hiccup (a native call that
    // throws synchronously instead of rejecting, an engine that isn't
    // installed, etc.) must never block an actual `speak()` attempt.
    initPromise = (async () => {
      try {
        if (Platform.OS === 'ios') {
          await Tts.setIgnoreSilentSwitch('ignore');
        } else {
          await Tts.getInitStatus();
        }
      } catch {
        if (Platform.OS === 'android') {
          try {
            await Tts.requestInstallEngine();
            await Tts.requestInstallData();
          } catch {
            // Nothing more we can do here — speak() will surface its own
            // error if the engine truly isn't usable.
          }
        }
      }
    })();
  }
  return initPromise;
};

export const realTextToSpeechService: TextToSpeechService = {
  speak: async (text, voice) => {
    await ensureInitialized();

    return new Promise(resolve => {
      let isSettled = false;

      // react-native-tts's own `removeEventListener` calls the legacy
      // `NativeEventEmitter#removeListener`, which no longer exists on this
      // RN version and throws. Using the subscription objects returned by
      // `addListener`/`addEventListener` directly avoids that path entirely.
      // (react-native-tts's types say `addEventListener` returns void, but
      // at runtime — since it just forwards to NativeEventEmitter#addListener
      // — it returns a subscription with `.remove()`.)
      type Subscription = { remove: () => void };
      const finishSubscription = Tts.addEventListener('tts-finish', onFinish) as unknown as Subscription;
      const cancelSubscription = Tts.addEventListener('tts-cancel', onFinish) as unknown as Subscription;

      const cleanup = () => {
        finishSubscription.remove();
        cancelSubscription.remove();
        clearTimeout(timeoutId);
      };

      function onFinish() {
        if (isSettled) {
          return;
        }
        isSettled = true;
        cleanup();
        resolve();
      }

      const timeoutId = setTimeout(onFinish, MAX_SPEAK_TIMEOUT_MS);

      // `tts-error` is not a supported event on every platform/version of
      // react-native-tts (iOS rejects the listener registration outright),
      // so playback failures fall through to the timeout above instead.

      Tts.setDefaultLanguage(voice.language).catch(() => undefined);
      Tts.setDefaultPitch(voice.pitch).catch(() => undefined);
      Tts.setDefaultRate(voice.rate).catch(() => undefined);
      Tts.speak(text);
    });
  },
};

const MIN_SPEAK_MS = 900;
const MS_PER_CHARACTER = 40;

// Kept for local/demo use without an audio output — VoiceService defaults
// to `realTextToSpeechService`.
export const mockTextToSpeechService: TextToSpeechService = {
  speak: (text, voice) =>
    new Promise(resolve => {
      const duration = Math.min(
        Math.max(text.length * MS_PER_CHARACTER, MIN_SPEAK_MS) / voice.rate,
        4000,
      );
      setTimeout(resolve, duration);
    }),
};
