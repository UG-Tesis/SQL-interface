import type { RegisteredUser } from '../../domain/models/RegisteredUser';
import type { SessionPort } from '../../domain/ports/SessionPort';
import { APP_STORAGE_KEYS, clearAllAppStorage } from '../storage/browserStorage';

const STORAGE_KEY = APP_STORAGE_KEYS.users;
const ACTIVE_KEY = APP_STORAGE_KEYS.activeUserId;

interface StoredPayload {
  users: RegisteredUser[];
}

function readPayload(): StoredPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { users: [] };
    const parsed = JSON.parse(raw) as StoredPayload;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    return { users: [] };
  }
}

function writePayload(payload: StoredPayload): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export class LocalStorageSessionAdapter implements SessionPort {
  getUsers(): RegisteredUser[] {
    return readPayload().users.sort(
      (a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime(),
    );
  }

  getActiveUser(): RegisteredUser | null {
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (!activeId) return null;
    const personaId = Number(activeId);
    return this.getUsers().find((user) => user.personaId === personaId) ?? null;
  }

  saveUser(user: RegisteredUser): void {
    const payload = readPayload();
    const index = payload.users.findIndex((item) => item.personaId === user.personaId);
    if (index >= 0) {
      payload.users[index] = user;
    } else {
      payload.users.push(user);
    }
    writePayload(payload);
    localStorage.setItem(ACTIVE_KEY, String(user.personaId));
  }

  setActiveUser(personaId: number): RegisteredUser | null {
    const user = this.getUsers().find((item) => item.personaId === personaId) ?? null;
    if (!user) return null;
    localStorage.setItem(ACTIVE_KEY, String(personaId));
    return user;
  }

  clearActiveUser(): void {
    localStorage.removeItem(ACTIVE_KEY);
  }

  clearAllData(): void {
    clearAllAppStorage();
  }
}
