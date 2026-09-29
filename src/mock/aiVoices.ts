import { AiVoiceConfig } from '../types/user';

// Mock voice configuration. When a real TTS provider is connected, `voiceId`
// maps to that provider's actual voice identifier.
//
// `rate` must stay strictly between 0 and 1 (both iOS's AVSpeechUtterance and
// the Android native module's rate normalization use that scale, where ~0.5
// is normal speed). `pitch` is the main lever that makes the two voices read
// as distinctly different — a 0.1 gap was barely audible, so the male/female
// voices sit well apart on either side of 1.0 (device-neutral, since a
// specific system voice id varies per phone).
export const AI_VOICES: Record<string, AiVoiceConfig> = {
  voice_male: {
    voiceId: 'voice_male',
    displayName: 'Rex',
    pitch: 0.78,
    rate: 0.5,
    language: 'en-US',
  },
  voice_female: {
    voiceId: 'voice_female',
    displayName: 'Aria',
    pitch: 1.25,
    rate: 0.5,
    language: 'en-US',
  },
};

// Assigns a voice from the user id's trailing number: odd -> male voice,
// even -> female voice. Mirrors how a real backend would return a per-user
// `assistantConfiguration`/`aiVoice`, just derived locally for now.
export const getAiVoiceIdForUser = (userId: string): string => {
  const match = userId.match(/(\d+)$/);
  const trailingNumber = match ? parseInt(match[1], 10) : 0;
  return trailingNumber % 2 === 0 ? 'voice_female' : 'voice_male';
};

export const getAiVoiceById = (voiceId: string): AiVoiceConfig =>
  AI_VOICES[voiceId] ?? AI_VOICES.voice_male;
