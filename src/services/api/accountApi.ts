const MOCK_LATENCY_MS = 500;

// Mirrors the future `DELETE /account` call. No real deletion happens here;
// the caller (AuthContext) is responsible for clearing the local session.
export const deleteAccount = (_userId: string): Promise<{ success: true }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, MOCK_LATENCY_MS);
  });
};
