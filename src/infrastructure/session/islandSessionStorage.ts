const ISLAND_SESSION_STORAGE_KEY = 'island-session-id';

export function getStoredIslandSessionId(): string | null {
  try {
    return sessionStorage.getItem(ISLAND_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredIslandSessionId(sessionId: string): void {
  try {
    sessionStorage.setItem(ISLAND_SESSION_STORAGE_KEY, sessionId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredIslandSessionId(): void {
  try {
    sessionStorage.removeItem(ISLAND_SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
