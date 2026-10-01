// Hermes provides atob at runtime; RN's TypeScript config just doesn't type it.
declare const atob: (data: string) => string;

// The backend uses pure-JWT auth, so the token itself says when it expires
// (`exp`, in seconds). Reading it lets the app log out on time instead of
// waiting for the first request to fail. Returns null when the token isn't
// a readable JWT or has no `exp` — the 401 handler still covers that case.
export const getTokenExpiryMs = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const exp = JSON.parse(atob(padded)).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiryMs(token);
  return expiry !== null && expiry <= Date.now();
};
