import { ConversationMessage, MessageSender } from '../../types/conversation';
import { request } from './client';

// POST /api/agent/heartbeat — tells the backend this user's agent session
// is active. Called once when the assistant screen becomes ready, before
// any chat messages are sent.
export const heartbeat = async (token: string): Promise<void> => {
  await request('/api/agent/heartbeat', { method: 'POST', token });
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// The exact history item shape isn't finalized, so this reads a few common
// field names defensively (check the `[API response]` dev log for
// `/api/agent/chat/history` and adjust the lookups below if needed).
const mapHistoryItem = (raw: any): ConversationMessage => {
  const rawRole = String(raw?.role ?? raw?.sender ?? '').toLowerCase();
  const sender: MessageSender = rawRole === 'user' ? 'user' : 'ai';

  return {
    id: String(raw?.id ?? createId()),
    sender,
    text: raw?.message ?? raw?.content ?? raw?.text ?? '',
    timestamp: raw?.timestamp ? new Date(raw.timestamp).getTime() : Date.now(),
  };
};

// GET /api/agent/chat/history — past turns for this user, loaded once when
// the assistant screen opens so the conversation persists across sessions.
export const getChatHistory = async (token: string): Promise<ConversationMessage[]> => {
  const response = await request<any>('/api/agent/chat/history', { token });
  const items = Array.isArray(response) ? response : response?.data ?? response?.history ?? [];
  return items.map(mapHistoryItem).filter((item: ConversationMessage) => item.text);
};

export interface ChatResult {
  message: string;
}

// POST /api/agent/chat — the real conversation endpoint: send the
// recognized speech text, get the assistant's reply back.
export const sendChatMessage = async (token: string, message: string): Promise<ChatResult> => {
  const response = await request<any>('/api/agent/chat', {
    method: 'POST',
    token,
    body: { message },
  });

  const rawReply =
    response?.message ?? response?.reply ?? response?.response ?? response?.data?.message ?? '';

  return { message: String(rawReply) };
};
