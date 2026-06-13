import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  GetActiveUserUseCase,
  GetRegisteredUsersUseCase,
  RegisterUserUseCase,
  SelectUserUseCase,
} from '../../application/usecases/SessionUseCases';
import type { NewUserInput, RegisteredUser } from '../../domain/models/RegisteredUser';
import { HttpUserRegistrationAdapter } from '../../infrastructure/adapters/HttpUserRegistrationAdapter';
import { LocalStorageSessionAdapter } from '../../infrastructure/adapters/LocalStorageSessionAdapter';

const sessionAdapter = new LocalStorageSessionAdapter();
const registrationAdapter = new HttpUserRegistrationAdapter();
const registerUserUseCase = new RegisterUserUseCase(registrationAdapter, sessionAdapter);
const selectUserUseCase = new SelectUserUseCase(sessionAdapter);
const getRegisteredUsersUseCase = new GetRegisteredUsersUseCase(sessionAdapter);
const getActiveUserUseCase = new GetActiveUserUseCase(sessionAdapter);

interface SessionContextValue {
  activeUser: RegisteredUser | null;
  registeredUsers: RegisteredUser[];
  registerUser: (input: NewUserInput) => Promise<RegisteredUser>;
  selectUser: (personaId: number) => RegisteredUser | null;
  clearAllBrowserData: () => void;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<RegisteredUser | null>(() =>
    getActiveUserUseCase.execute(),
  );
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() =>
    getRegisteredUsersUseCase.execute(),
  );

  const refreshSession = useCallback(() => {
    setActiveUser(getActiveUserUseCase.execute());
    setRegisteredUsers(getRegisteredUsersUseCase.execute());
  }, []);

  const registerUser = useCallback(async (input: NewUserInput) => {
    const user = await registerUserUseCase.execute(input);
    refreshSession();
    return user;
  }, [refreshSession]);

  const selectUser = useCallback((personaId: number) => {
    const user = selectUserUseCase.execute(personaId);
    refreshSession();
    return user;
  }, [refreshSession]);

  const clearAllBrowserData = useCallback(() => {
    sessionAdapter.clearAllData();
    window.location.href = '/';
  }, []);

  const value = useMemo(
    () => ({
      activeUser,
      registeredUsers,
      registerUser,
      selectUser,
      clearAllBrowserData,
      refreshSession,
    }),
    [activeUser, registeredUsers, registerUser, selectUser, clearAllBrowserData, refreshSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return context;
}
