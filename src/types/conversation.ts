export type MessageSender = 'user' | 'ai';

export interface ConversationMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
}

export type AssistantState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';
