import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AssistantState, ConversationMessage } from '../types/conversation';
import { useAuth } from './AuthContext';
import { VoiceFlowError, VoiceService } from '../services/voice/VoiceService';
import { getChatHistory, heartbeat } from '../services/api/agentApi';
import { isRealSpeechToTextAvailable } from '../services/voice/SpeechToTextService';
import {
  ERROR_API,
  ERROR_EMPTY_SPEECH,
  ERROR_GENERIC,
  ERROR_MIC_PERMISSION,
  ERROR_SPEECH_RECOGNITION,
  ERROR_VOICE_PLAYBACK,
} from '../constants/text/en';

const ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  PERMISSION_DENIED: ERROR_MIC_PERMISSION,
  SPEECH_RECOGNITION_FAILED: ERROR_SPEECH_RECOGNITION,
  EMPTY_SPEECH: ERROR_EMPTY_SPEECH,
  API_FAILED: ERROR_API,
  PLAYBACK_FAILED: ERROR_VOICE_PLAYBACK,
};

// Brief pause between "AI finished speaking" and "start listening again" so
// the mic doesn't pick up the tail end of the assistant's own voice.
const AUTO_LISTEN_DELAY_MS = 500;

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

interface AssistantContextValue {
  state: AssistantState;
  messages: ConversationMessage[];
  errorMessage: string | null;
  isConversationActive: boolean;
  toggleConversation: () => void;
  stopConversation: () => void;
}

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [state, setState] = useState<AssistantState>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const isConversationActiveRef = useRef(false);
  const isRunningRef = useRef(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const runTurn = useCallback(() => {
    const activeSession = sessionRef.current;
    if (!activeSession || isRunningRef.current || !isConversationActiveRef.current) {
      return;
    }
    isRunningRef.current = true;
    setErrorMessage(null);

    VoiceService.converse({
      token: activeSession.token,
      userId: activeSession.user.id,
      role: activeSession.user.role,
      voice: activeSession.aiVoice,
      onStateChange: setState,
      onUserText: text => {
        setMessages(prev => [
          ...prev,
          { id: createId(), sender: 'user', text, timestamp: Date.now() },
        ]);
      },
      onAiText: text => {
        setMessages(prev => [
          ...prev,
          { id: createId(), sender: 'ai', text, timestamp: Date.now() },
        ]);
      },
    })
      .then(() => {
        isRunningRef.current = false;
        // Without a real mic, "listening" resolves instantly with a sample
        // phrase — auto-continuing would just talk to itself forever.
        // Require an explicit tap for each turn until real capture works.
        if (isConversationActiveRef.current && isRealSpeechToTextAvailable()) {
          setTimeout(runTurn, AUTO_LISTEN_DELAY_MS);
        } else {
          isConversationActiveRef.current = false;
          setIsConversationActive(false);
        }
      })
      .catch(error => {
        isRunningRef.current = false;
        isConversationActiveRef.current = false;
        setIsConversationActive(false);
        const code = error instanceof VoiceFlowError ? error.code : undefined;
        setErrorMessage((code && ERROR_MESSAGE_BY_CODE[code]) || ERROR_GENERIC);
        setState('error');
      });
  }, []);

  const stopConversation = useCallback(() => {
    if (!isConversationActiveRef.current) {
      return;
    }
    isConversationActiveRef.current = false;
    setIsConversationActive(false);
    VoiceService.cancel();
  }, []);

  const toggleConversation = useCallback(() => {
    if (!sessionRef.current) {
      return;
    }

    if (isConversationActiveRef.current) {
      stopConversation();
      return;
    }

    isConversationActiveRef.current = true;
    setIsConversationActive(true);
    setErrorMessage(null);
    runTurn();
  }, [runTurn, stopConversation]);

  // Every login/logout/user-switch gets a clean slate: stop anything still
  // talking/listening for the previous user and clear their conversation,
  // rather than carrying it (and their voice) over to the next session.
  const userId = session?.user.id;
  const token = session?.token;
  useEffect(() => {
    stopConversation();
    setMessages([]);
    setErrorMessage(null);
    setState('idle');

    if (!token) {
      return;
    }

    // Tell the backend this user's agent session is active, then load
    // their past turns so the conversation persists across app launches.
    heartbeat(token).catch(() => undefined);
    getChatHistory(token)
      .then(setMessages)
      .catch(() => undefined);
  }, [userId, token, stopConversation]);

  const value = useMemo(
    () => ({
      state,
      messages,
      errorMessage,
      isConversationActive,
      toggleConversation,
      stopConversation,
    }),
    [state, messages, errorMessage, isConversationActive, toggleConversation, stopConversation],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = (): AssistantContextValue => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
