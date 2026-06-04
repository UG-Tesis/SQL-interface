import { useModuloCompletion } from '../hooks/useModuloCompletion';

interface ModuleCompleteButtonProps {
  topicId: string;
}

export function ModuleCompleteButton({ topicId }: ModuleCompleteButtonProps) {
  const {
    activeUser,
    completed,
    loading,
    submitting,
    error,
    enabled,
    porcentaje,
    porcentajeCurso,
    markCompleted,
  } = useModuloCompletion(topicId);

  if (!activeUser) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Finalizar módulo
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registra tu avance como{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {activeUser.nombre} {activeUser.apellido}
            </span>{' '}
            (ID {activeUser.personaId}).
          </p>
          <p className="mt-2 text-xs font-medium text-cyan-700 dark:text-cyan-400">
            Avance del curso: {porcentajeCurso}% · Este módulo: {porcentaje}%
          </p>
        </div>

        {loading ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">Consultando avance...</span>
        ) : completed ? (
          <span className="inline-flex items-center justify-center rounded-xl bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Completado · 100%
          </span>
        ) : (
          <button
            type="button"
            disabled={submitting || !enabled}
            onClick={() => void markCompleted()}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Guardando...' : 'Marcar como completado'}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
