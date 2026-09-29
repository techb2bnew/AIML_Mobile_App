import { AssistantConfiguration, User } from '../types/user';

// Fallback greeting used only when the backend's login/`/me` response
// doesn't include its own `assistantConfiguration` for the user's role.
export const ASSISTANT_CONFIG_BY_ROLE: Record<User['role'], AssistantConfiguration> = {
  manager: {
    assistantName: 'AIME',
    greeting: 'Hello! How can I help you manage your fleet today?',
  },
  driver: {
    assistantName: 'AIME',
    greeting: 'Hi! Ready to hear your tasks for today?',
  },
};
