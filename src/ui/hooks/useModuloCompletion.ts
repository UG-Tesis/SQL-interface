import { useCallback, useEffect, useState } from 'react';
import { useCursoProgress } from '../session/CursoProgressContext';
import { useSession } from '../session/SessionContext';

export function useModuloCompletion(topicId: string) {
  const { activeUser } = useSession();
  const {
    progress,
    completeModule,
    isModuleEnabled,
    isModuleCompleted,
    completingTopicId,
    loading: progressLoading,
    error: progressError,
  } = useCursoProgress();
  const [error, setError] = useState<string | null>(null);

  const completed = isModuleCompleted(topicId);
  const submitting = completingTopicId === topicId;
  const loading = progressLoading && progress === null;

  useEffect(() => {
    setError(null);
  }, [topicId, progress]);

  const markCompleted = useCallback(async () => {
    if (!activeUser || completed || submitting || !isModuleEnabled(topicId)) return;

    setError(null);
    const nextProgress = await completeModule(topicId);
    if (!nextProgress) {
      setError('No se pudo registrar la finalización. Verifica que el backend esté activo.');
    }
  }, [activeUser, completed, submitting, topicId, isModuleEnabled, completeModule]);

  const moduleAccess = progress?.modules.find((module) => module.topicId === topicId);

  return {
    activeUser,
    completed,
    loading,
    submitting,
    error: error ?? progressError,
    enabled: isModuleEnabled(topicId),
    porcentaje: moduleAccess?.porcentaje ?? 0,
    porcentajeCurso: progress?.porcentajeAvance ?? 0,
    markCompleted,
  };
}
