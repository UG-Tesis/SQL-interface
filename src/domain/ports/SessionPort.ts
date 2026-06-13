import type { RegisteredUser } from '../models/RegisteredUser';

export interface SessionPort {
  getUsers(): RegisteredUser[];
  getActiveUser(): RegisteredUser | null;
  saveUser(user: RegisteredUser): void;
  setActiveUser(personaId: number): RegisteredUser | null;
  clearActiveUser(): void;
  clearAllData(): void;
}
