import { AssistantConfiguration, AuthSession, User, UserRole } from '../../types/user';
import { ASSISTANT_CONFIG_BY_ROLE } from '../../mock/users';
import { getAiVoiceById, getAiVoiceIdForUser } from '../../mock/aiVoices';
import { ApiError, request } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

const DEFAULT_ROLE: UserRole = 'manager';

const isUserRole = (value: unknown): value is UserRole => value === 'manager' || value === 'driver';

const defaultAssistantConfig = (role: UserRole): AssistantConfiguration =>
  ASSISTANT_CONFIG_BY_ROLE[role] ?? ASSISTANT_CONFIG_BY_ROLE[DEFAULT_ROLE];

export interface CurrentUserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
}

// GET /api/auth/me — the backend's login response is just a bearer token
// with no user object (pure-JWT auth), so this is also how `login()` below
// gets the actual profile. Kept loose (`role` as a raw string) since the
// backend's role vocabulary (e.g. "Employee") doesn't line up with the
// app's internal manager/driver voice-routing roles — this is for display.
export const getMe = async (token: string): Promise<CurrentUserDetails> => {
  const response = await request<any>('/api/auth/me', { token });

  const rawUser = response.user ?? response.data?.user ?? response.data ?? response;

  return {
    id: String(rawUser?.id ?? rawUser?._id ?? rawUser?.userId ?? rawUser?.sub ?? ''),
    name: rawUser?.name ?? rawUser?.fullName ?? rawUser?.email ?? 'User',
    email: rawUser?.email ?? '',
    role: rawUser?.role ?? '',
  };
};

// POST /api/auth/login only returns `{ access_token, token_type }` — no
// user details — so this immediately follows up with `/api/auth/me` to
// build the full session the rest of the app expects.
export const login = async (credentials: LoginCredentials): Promise<AuthSession> => {
  const response = await request<any>('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });

  const token: string =
    response.access_token ?? response.token ?? response.accessToken ?? response.data?.token ?? '';

  const me = await getMe(token);
  const role: UserRole = isUserRole(me.role) ? me.role : DEFAULT_ROLE;

  const user: User = {
    id: me.id,
    name: me.name,
    email: me.email,
    role,
    aiVoiceId: getAiVoiceIdForUser(me.id),
  };

  return {
    user,
    token,
    aiVoice: getAiVoiceById(user.aiVoiceId),
    assistantConfiguration: defaultAssistantConfig(role),
  };
};

// POST /api/auth/logout. Best-effort: the caller (AuthContext) clears the
// local session regardless of whether this succeeds, since the user should
// always be able to log out of the app even if the backend call fails.
export const logout = async (token: string): Promise<void> => {
  await request('/api/auth/logout', { method: 'POST', token });
};

export { ApiError };
