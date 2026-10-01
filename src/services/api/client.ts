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

// A trailing slash in .env would otherwise produce `//api/...` URLs.
export const BASE_URL = resolveBaseUrl().replace(/\/+$/, '');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

// Called when an authenticated request comes back 401, i.e. the token has
// expired or been revoked. AuthContext registers the handler that logs the
// user out. Requests without a token (the login call itself) never trigger
// it, so a wrong password isn't mistaken for an expired session.
let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

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

  // A web server (e.g. a frontend on the wrong port) answers every path with
  // its index.html and a 200. Without this check that "succeeds" with an HTML
  // string, login gets no token, and nothing says why.
  const contentType = response.headers.get('content-type') ?? '';
  if (response.ok && contentType.includes('text/html')) {
    throw new ApiError(
      response.status,
      undefined,
      `${url} returned a web page, not the API. Check API_BASE_URL in .env.`,
    );
  }

  if (response.status === 401 && options.token) {
    unauthorizedHandler?.();
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
