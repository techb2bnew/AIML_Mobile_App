import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';

// `localhost` means "this device" on a phone/emulator, not the machine
// running the backend. The Android emulator's host-loopback alias is
// 10.0.2.2; iOS Simulator can reach the Mac's localhost directly. A real
// device needs the machine's LAN IP in API_BASE_URL instead of localhost.
const resolveBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return API_BASE_URL.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return API_BASE_URL;
};

export const BASE_URL = resolveBaseUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const method = options.method ?? 'GET';
  const url = `${BASE_URL}${path}`;

  if (__DEV__) {
    console.warn(`[API request] ${method} ${url}`, options.body ?? '(no body)');
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawBody = await response.text();
  let parsedBody: any;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
  } catch {
    // Not JSON (e.g. a plain-text 401/500 page) — keep the raw text so the
    // error message below still has something useful to show.
    parsedBody = rawBody;
  }

  if (__DEV__) {
    console.warn(`[API response] ${method} ${url} (${response.status})`, parsedBody);
  }

  if (!response.ok) {
    const message =
      (parsedBody && (parsedBody.message || parsedBody.error || parsedBody.detail)) ||
      (typeof parsedBody === 'string' && parsedBody) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, parsedBody, message);
  }

  return parsedBody as T;
};
