const ISLAND_SESSION_STORAGE_KEY = 'island-session-id';
const ISLAND_STEP_STORAGE_KEY = 'island-step-index';

function readSessionItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

function removeSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Solo sessionStorage: vive mientras la pestaña esté abierta (resume SPA, no entre pestañas). */
export function getStoredIslandSessionId(): string | null {
  return readSessionItem(ISLAND_SESSION_STORAGE_KEY);
}

export function setStoredIslandSessionId(sessionId: string): void {
  writeSessionItem(ISLAND_SESSION_STORAGE_KEY, sessionId);
}

export function clearStoredIslandSessionId(): void {
  removeSessionItem(ISLAND_SESSION_STORAGE_KEY);
}

export function getStoredIslandStepIndex(): number | null {
  const raw = readSessionItem(ISLAND_STEP_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function setStoredIslandStepIndex(stepIndex: number): void {
  writeSessionItem(ISLAND_STEP_STORAGE_KEY, String(stepIndex));
}

export function clearStoredIslandStepIndex(): void {
  removeSessionItem(ISLAND_STEP_STORAGE_KEY);
}

export function clearStoredIslandProgress(): void {
  clearStoredIslandSessionId();
  clearStoredIslandStepIndex();
}
