export type UserRole = 'manager' | 'driver';

export interface AiVoiceConfig {
  voiceId: string;
  displayName: string;
  pitch: number;
  rate: number;
  language: string;
}

export interface AssistantConfiguration {
  assistantName: string;
  greeting: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  aiVoiceId: string;
}

export interface AuthSession {
  user: User;
  token: string;
  aiVoice: AiVoiceConfig;
  assistantConfiguration: AssistantConfiguration;
}
