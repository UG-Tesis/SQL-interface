import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CompleteModuloUseCase } from '../../application/usecases/CompleteModuloUseCase';
import { GetCursoProgressUseCase } from '../../application/usecases/GetCursoProgressUseCase';
import type { CursoModuleAccess, InscripcionCursoProgress } from '../../domain/models/CursoModuleAccess';
import { progressAdapter } from '../../infrastructure/adapters/progressAdapterInstance';
import { useSession } from './SessionContext';

const getCursoProgressUseCase = new GetCursoProgressUseCase(progressAdapter);
const completeModuloUseCase = new CompleteModuloUseCase(progressAdapter);

interface CursoProgressContextValue {
  progress: InscripcionCursoProgress | null;
  loading: boolean;
  completingTopicId: string | null;
  error: string | null;
  refreshProgress: () => Promise<void>;
  completeModule: (topicId: string) => Promise<InscripcionCursoProgress | null>;
  getModuleAccess: (topicId: string) => CursoModuleAccess | undefined;
  isModuleEnabled: (topicId: string) => boolean;
  isModuleCompleted: (topicId: string) => boolean;
}

const CursoProgressContext = createContext<CursoProgressContextValue | null>(null);

export function CursoProgressProvider({ children }: { children: ReactNode }) {
  const { activeUser } = useSession();
  const [progress, setProgress] = useState<InscripcionCursoProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [completingTopicId, setCompletingTopicId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshProgress = useCallback(async () => {
    if (!activeUser) {
      setProgress(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nextProgress = await getCursoProgressUseCase.execute(activeUser.inscripcionId);
      setProgress(nextProgress);
    } catch {
      setProgress(null);
      setError('No se pudo cargar el progreso del curso.');
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  const completeModule = useCallback(
    async (topicId: string) => {
      if (!activeUser) return null;

      setCompletingTopicId(topicId);
      setError(null);
      try {
        const nextProgress = await completeModuloUseCase.execute(
          activeUser.inscripcionId,
          topicId,
        );
        setProgress(nextProgress);
        return nextProgress;
      } catch {
        setError('No se pudo registrar la finalización. Verifica que el backend esté activo.');
        return null;
      } finally {
        setCompletingTopicId(null);
      }
    },
    [activeUser],
  );

  useEffect(() => {
    void refreshProgress();
  }, [refreshProgress]);

  const getModuleAccess = useCallback(
    (topicId: string) => progress?.modules.find((module) => module.topicId === topicId),
    [progress],
  );

  const isModuleEnabled = useCallback(
    (topicId: string) => getModuleAccess(topicId)?.enabled ?? topicId === 'c1',
    [getModuleAccess],
  );

  const isModuleCompleted = useCallback(
    (topicId: string) => getModuleAccess(topicId)?.completed ?? false,
    [getModuleAccess],
  );

  const value = useMemo(
    () => ({
      progress,
      loading,
      completingTopicId,
      error,
      refreshProgress,
      completeModule,
      getModuleAccess,
      isModuleEnabled,
      isModuleCompleted,
    }),
    [
      progress,
      loading,
      completingTopicId,
      error,
      refreshProgress,
      completeModule,
      getModuleAccess,
      isModuleEnabled,
      isModuleCompleted,
    ],
  );

  return <CursoProgressContext.Provider value={value}>{children}</CursoProgressContext.Provider>;
}

export function useCursoProgress() {
  const context = useContext(CursoProgressContext);
  if (!context) {
    throw new Error('useCursoProgress debe usarse dentro de CursoProgressProvider');
  }
  return context;
}
