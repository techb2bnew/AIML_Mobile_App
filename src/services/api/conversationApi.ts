import { UserRole } from '../../types/user';
import { sendChatMessage } from './agentApi';

export interface SendMessagePayload {
  token: string;
  userId: string;
  role: UserRole;
  message: string;
}

export interface SendMessageResult {
  message: string;
  voice: string;
}

// Real conversation endpoint (POST /api/agent/chat): sends the recognized
// user text, returns the assistant's reply. `voiceId` is only threaded
// through so the reply gets spoken with this user's configured voice.
export const sendMessage = async (
  payload: SendMessagePayload,
  voiceId: string,
): Promise<SendMessageResult> => {
  const result = await sendChatMessage(payload.token, payload.message);
  return { message: result.message, voice: voiceId };
};
