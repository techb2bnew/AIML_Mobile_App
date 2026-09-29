import { NativeModules } from 'react-native';
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';

// Speech-to-text interface. `realSpeechToTextService` wraps
// @react-native-voice/voice; VoiceService only depends on this shape, so a
// different provider can be dropped in later without touching any caller.
export interface SpeechToTextService {
  listen: () => Promise<string>;
}

// True only when the native Voice module actually linked into this build.
// Some installs (an old APK still on the device, a build that skipped
// autolinking, incompatible native toolchain) leave it unavailable — this
// lets VoiceService fall back to the mock instead of failing every turn.
export const isRealSpeechToTextAvailable = (): boolean => Boolean(NativeModules.Voice);

// Overall ceiling in case nothing ever settles the session.
const LISTEN_TIMEOUT_MS = 15000;
// How long to wait after the *last* transcript update before treating the
// utterance as finished. iOS's native module fires `onSpeechResults` on
// every partial update (not just the final one), so resolving on the first
// event was cutting sentences off after the first word — this debounce
// waits for a natural pause instead. Android's module only fires it once,
// with the final text, so the debounce there just adds a small, harmless
// delay.
const SILENCE_DEBOUNCE_MS = 900;

export const realSpeechToTextService: SpeechToTextService = {
  listen: async () => {
    // Fully tear down any lingering session from a previous turn first —
    // starting a new recognition session before the last one has finished
    // destroying can make iOS in particular fail the new session outright.
    try {
      await Voice.destroy();
    } catch {
      // Nothing to destroy — fine to proceed.
    }

    return new Promise<string>((resolve, reject) => {
      let isSettled = false;
      let latestTranscript = '';
      let debounceTimeoutId: ReturnType<typeof setTimeout> | undefined;

      const cleanup = () => {
        clearTimeout(timeoutId);
        clearTimeout(debounceTimeoutId);
        try {
          Voice.removeAllListeners();
        } catch {
          // The native Voice module isn't available on this build (e.g. a
          // stale install predating this dependency) — nothing to clean up.
        }
      };

      const settle = (fn: () => void) => {
        if (isSettled) {
          return;
        }
        isSettled = true;
        cleanup();
        Voice.stop().catch(() => undefined);
        fn();
      };

      const finalize = () => {
        settle(() =>
          latestTranscript.trim() ? resolve(latestTranscript) : reject(new Error('EMPTY_SPEECH')),
        );
      };

      const timeoutId = setTimeout(finalize, LISTEN_TIMEOUT_MS);

      try {
        Voice.onSpeechResults = (event: SpeechResultsEvent) => {
          const text = event.value?.[0];
          if (text) {
            latestTranscript = text;
          }
          clearTimeout(debounceTimeoutId);
          debounceTimeoutId = setTimeout(finalize, SILENCE_DEBOUNCE_MS);
        };

        Voice.onSpeechError = (event: SpeechErrorEvent) => {
          if (__DEV__) {
            console.warn('[SpeechToText] onSpeechError', event.error);
          }
          // A transcript already arrived before this error (some platforms
          // report a harmless end-of-session error right after delivering
          // results) — prefer using it over failing the whole turn.
          if (latestTranscript.trim()) {
            finalize();
            return;
          }
          settle(() => reject(new Error(event.error?.message ?? 'SPEECH_RECOGNITION_FAILED')));
        };

        Voice.onSpeechEnd = () => {
          // If a transcript already came in, finalize right away instead of
          // waiting out the full debounce. If none has arrived yet (Android
          // can fire this slightly before its one-shot onSpeechResults),
          // let the debounce/timeout above keep waiting for it.
          if (latestTranscript.trim()) {
            finalize();
          }
        };
      } catch {
        settle(() => reject(new Error('SPEECH_RECOGNITION_FAILED')));
        return;
      }

      Voice.start('en-US').catch(error => {
        if (__DEV__) {
          console.warn('[SpeechToText] Voice.start() rejected', error);
        }
        settle(() => reject(error));
      });
    });
  },
};

const SAMPLE_PHRASES = [
  'What is my task?',
  'What should I do first?',
  'How is my team doing today?',
  'What is my route for today?',
];

const MOCK_LISTEN_MS = 1400;

// Kept for local/demo use without a microphone (e.g. simulators without
// mic passthrough) — VoiceService defaults to `realSpeechToTextService`.
export const mockSpeechToTextService: SpeechToTextService = {
  listen: () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const phrase = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)];
        if (!phrase) {
          reject(new Error('EMPTY_SPEECH'));
          return;
        }
        resolve(phrase);
      }, MOCK_LISTEN_MS);
    }),
};
