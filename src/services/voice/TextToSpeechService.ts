import { Platform } from 'react-native';
import Tts from 'react-native-tts';
import { AiVoiceConfig } from '../../types/user';
import { getPreferredVoiceId } from './VoicePreference';

// Text-to-speech interface. `realTextToSpeechService` wraps react-native-tts;
// VoiceService only depends on this shape, so a different provider can be
// dropped in later without touching any caller.
export interface TextToSpeechService {
  // `systemVoiceId` overrides the user's saved voice (used by the picker's
  // preview); otherwise the saved choice, then the built-in default, applies.
  speak: (text: string, voice: AiVoiceConfig, systemVoiceId?: string) => Promise<void>;
}

export interface SystemVoice {
  id: string;
  label: string;
  language: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  'en-us': 'English (US)',
  'en-gb': 'English (UK)',
  'en-in': 'English (India)',
  'en-au': 'English (Australia)',
  'en-ca': 'English (Canada)',
  'en-ie': 'English (Ireland)',
  'en-za': 'English (South Africa)',
};

const languageLabel = (language: string) =>
  LANGUAGE_LABELS[language.toLowerCase().replace('_', '-')] ?? language;

// iOS ships joke voices ("Bad News", "Bells", "Boing", "Zarvox"...) under this
// id prefix; they have no place in a work assistant.
const NOVELTY_VOICE_ID_PREFIX = 'com.apple.speech.synthesis.voice';

// English voices actually installed on this device. iOS gives real names
// ("Samantha"); Android only gives engine ids like `en-us-x-iom-local`, so
// those are numbered per language instead of shown raw.
export const listSystemVoices = async (): Promise<SystemVoice[]> => {
  const all = await Tts.voices();
  const usable = all
    .filter(v => v.language?.toLowerCase().startsWith('en') && !v.notInstalled && !v.id.startsWith(NOVELTY_VOICE_ID_PREFIX))
    .sort((a, b) => a.language.localeCompare(b.language) || a.id.localeCompare(b.id));

  const perLanguage: Record<string, number> = {};
  return usable.map(v => {
    const label = languageLabel(v.language);
    if (Platform.OS === 'ios') {
      return { id: v.id, label: `${v.name} · ${label}`, language: v.language };
    }
    perLanguage[v.language] = (perLanguage[v.language] ?? 0) + 1;
    return { id: v.id, label: `${label} · Voice ${perLanguage[v.language]}`, language: v.language };
  });
};

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
  speak: async (text, voice, systemVoiceId) => {
    await ensureInitialized();
    const chosenVoiceId = systemVoiceId ?? (await getPreferredVoiceId());

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

      // Language first: on both platforms it resets the active voice, so the
      // chosen voice has to be applied after it. A chosen system voice keeps
      // its natural pitch — the male/female pitch shift is only for the
      // built-in default.
      Tts.setDefaultLanguage(voice.language).catch(() => undefined);
      if (chosenVoiceId) {
        Tts.setDefaultVoice(chosenVoiceId).catch(() => undefined);
      }
      Tts.setDefaultPitch(chosenVoiceId ? 1 : voice.pitch).catch(() => undefined);
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
