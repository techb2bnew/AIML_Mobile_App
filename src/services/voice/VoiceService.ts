import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { AiVoiceConfig, UserRole } from '../../types/user';
import { AssistantState } from '../../types/conversation';
import { sendMessage } from '../api/conversationApi';
import { requestMicPermission } from './PermissionService';
import {
  isRealSpeechToTextAvailable,
  mockSpeechToTextService,
  realSpeechToTextService,
  SpeechToTextService,
} from './SpeechToTextService';
import { realTextToSpeechService, TextToSpeechService } from './TextToSpeechService';

// Falls back to the mock STT when the native Voice module didn't link into
// this build, so the conversation loop still runs end-to-end instead of
// failing on every single turn. Real STT keeps working wherever it's
// actually available (confirmed working on iOS).
const defaultSpeechToTextService: SpeechToTextService = isRealSpeechToTextAvailable()
  ? realSpeechToTextService
  : mockSpeechToTextService;

if (__DEV__ && !isRealSpeechToTextAvailable()) {
  console.warn(
    '[VoiceService] Native Voice module not found — falling back to mock speech-to-text.',
  );
}

export type VoiceErrorCode =
  | 'PERMISSION_DENIED'
  | 'SPEECH_RECOGNITION_FAILED'
  | 'EMPTY_SPEECH'
  | 'API_FAILED'
  | 'PLAYBACK_FAILED';

export class VoiceFlowError extends Error {
  code: VoiceErrorCode;
  constructor(code: VoiceErrorCode) {
    super(code);
    this.code = code;
  }
}

interface ConverseParams {
  token: string;
  userId: string;
  role: UserRole;
  voice: AiVoiceConfig;
  onStateChange: (state: AssistantState) => void;
  onUserText: (text: string) => void;
  onAiText: (text: string) => void;
}

// Orchestrates one full voice turn: permission -> listen -> transcribe ->
// send to the conversation API -> speak the response. Screens/contexts only
// call `converse()` and react to state callbacks; the STT/TTS/API
// implementations underneath can be swapped independently.
class VoiceServiceImpl {
  constructor(
    private stt: SpeechToTextService = defaultSpeechToTextService,
    private tts: TextToSpeechService = realTextToSpeechService,
  ) {}

  async converse({
    token,
    userId,
    role,
    voice,
    onStateChange,
    onUserText,
    onAiText,
  }: ConverseParams): Promise<void> {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      throw new VoiceFlowError('PERMISSION_DENIED');
    }

    onStateChange('listening');
    let recognizedText: string;
    try {
      recognizedText = await this.stt.listen();
    } catch {
      throw new VoiceFlowError('SPEECH_RECOGNITION_FAILED');
    }

    if (!recognizedText || !recognizedText.trim()) {
      throw new VoiceFlowError('EMPTY_SPEECH');
    }
    onUserText(recognizedText);

    onStateChange('processing');
    let aiMessage: string;
    try {
      const result = await sendMessage(
        { token, userId, role, message: recognizedText },
        voice.voiceId,
      );
      aiMessage = result.message;
    } catch {
      throw new VoiceFlowError('API_FAILED');
    }
    onAiText(aiMessage);

    onStateChange('speaking');
    try {
      await this.tts.speak(aiMessage, voice);
    } catch (error) {
      if (__DEV__) {
        console.warn('[VoiceService] tts.speak() failed', error);
      }
      throw new VoiceFlowError('PLAYBACK_FAILED');
    }

    onStateChange('idle');
  }

  // Best-effort interrupt for an in-flight turn (user tapped the orb again
  // mid-listen/mid-speech). The pending `converse()` call still settles on
  // its own from whatever STT/TTS callback fires next.
  cancel(): void {
    Voice.stop().catch(() => undefined);
    try {
      // Some native builds require this argument outright (passing
      // `undefined` fails to bridge to Objective-C's BOOL and throws
      // synchronously, before a promise even exists to catch).
      Tts.stop(false).catch(() => undefined);
    } catch {
      // Ignore — nothing to stop.
    }
  }
}

export const VoiceService = new VoiceServiceImpl();
