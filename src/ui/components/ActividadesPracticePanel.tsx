import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getActividadPracticeMode,
  getEditorPlaceholder,
  getLiveFeedbackTitle,
  getPracticeInstruction,
  getSandboxEditorLabel,
  isReadyForLiveValidation,
  parseActividadSubNavId,
} from '../../domain/config/actividades.config';
import type { SqlExecutionResult } from '../../domain/models/SqlExecutionResult';
import type { SqlValidationResult } from '../../domain/models/SqlValidationResult';
import { HttpSqlExecutorAdapter } from '../../infrastructure/adapters/HttpSqlExecutorAdapter';
import { HttpSqlValidationAdapter } from '../../infrastructure/adapters/HttpSqlValidationAdapter';
import { getApiErrorMessage } from '../../infrastructure/api/apiErrors';
import { useActividadesCatalog } from '../session/ActividadesCatalogContext';
import { FadeInUp } from './FadeInUp';
import { SqlResultsTable } from './SqlResultsTable';

const sqlExecutorAdapter = new HttpSqlExecutorAdapter();
const sqlValidationAdapter = new HttpSqlValidationAdapter();

const LIVE_VALIDATE_DEBOUNCE_MS = 700;

interface ActividadesPracticePanelProps {
  activeSubNavId?: string | null;
}

function practiceItems(entry: {
  preguntas: { id: number; pregunta: string; orden: number }[];
  descripcion: string;
}): { id: number; text: string; orden: number }[] {
  if (entry.preguntas.length > 0) {
    return entry.preguntas.map((pregunta) => ({
      id: pregunta.id,
      text: pregunta.pregunta,
      orden: pregunta.orden,
    }));
  }

  if (entry.descripcion) {
    return [{ id: 0, text: entry.descripcion, orden: 1 }];
  }

  return [];
}

function validationPanelStyles(
  result: SqlValidationResult,
  feedbackMode: 'manual' | 'live' | 'execute',
): string {
  if (result.correct) {
    return 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20';
  }
  if (feedbackMode === 'live') {
    return 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20';
  }
  return 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20';
}

function validationTitleClass(
  result: SqlValidationResult,
  feedbackMode: 'manual' | 'live' | 'execute',
): string {
  if (result.correct) return 'text-emerald-800 dark:text-emerald-300';
  if (feedbackMode === 'live') return 'text-amber-800 dark:text-amber-300';
  return 'text-red-800 dark:text-red-300';
}

const ValidationSidebar = memo(function ValidationSidebar({
  isModuleOne,
  moduloOrden,
  liveValidating,
  validating,
  validationResult,
  feedbackMode,
}: {
  isModuleOne: boolean;
  moduloOrden: number;
  liveValidating: boolean;
  validating: boolean;
  validationResult: SqlValidationResult | null;
  feedbackMode: 'manual' | 'live' | 'execute';
}) {
  const resolvedMode = feedbackMode === 'manual' ? 'live' : feedbackMode;

  return (
    <aside className="flex min-h-[14rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 md:min-h-0 md:h-full">
      <div className="border-b border-slate-200 bg-white/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/80">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isModuleOne ? 'Resultado de validación' : 'Sugerencias'}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {liveValidating || validating ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Revisando...</p>
        ) : validationResult ? (
          <div
            className={`rounded-lg border px-3 py-3 ${validationPanelStyles(validationResult, resolvedMode)}`}
          >
            <p
              className={`text-sm font-semibold ${validationTitleClass(validationResult, resolvedMode)}`}
            >
              {isModuleOne
                ? validationResult.correct
                  ? 'Correcto'
                  : 'Incorrecto'
                : getLiveFeedbackTitle(moduloOrden, validationResult.correct, resolvedMode)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {validationResult.message}
            </p>
            {validationResult.hints && validationResult.hints.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {validationResult.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {isModuleOne
              ? 'Presiona Validar consulta para revisar tu sentencia aquí.'
              : 'Escribe tu consulta SQL; las sugerencias aparecerán aquí mientras redactas.'}
          </p>
        )}
      </div>
    </aside>
  );
});

export function ActividadesPracticePanel({ activeSubNavId }: ActividadesPracticePanelProps) {
  const { entries, loading, error, findEntryByActividadId, ensureCatalog } = useActividadesCatalog();
  const liveValidationAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void ensureCatalog();
  }, [ensureCatalog]);

  const [sql, setSql] = useState('');
  const [validating, setValidating] = useState(false);
  const [liveValidating, setLiveValidating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<SqlValidationResult | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<'manual' | 'live' | 'execute'>('manual');
  const [result, setResult] = useState<SqlExecutionResult | null>(null);

  const activeActividadId = parseActividadSubNavId(activeSubNavId);
  const activeEntry = useMemo(() => {
    if (activeActividadId) return findEntryByActividadId(activeActividadId);
    return entries[0] ?? null;
  }, [activeActividadId, findEntryByActividadId, entries]);

  const isModuleOne = activeEntry?.moduloOrden === 1;

  useEffect(() => {
    setSql('');
    setResult(null);
    setValidationResult(null);
    setQueryError(null);
    setFeedbackMode('manual');
    setLiveValidating(false);
  }, [activeEntry?.id]);

  const practiceMode = activeEntry
    ? getActividadPracticeMode(activeEntry.moduloOrden, activeEntry.orden)
    : 'validate_only';

  const runValidation = useCallback(
    async (statement: string, mode: 'manual' | 'live' | 'execute') => {
      if (!activeEntry) return null;

      try {
        const validation = await sqlValidationAdapter.validate(statement, activeEntry.id);
        setValidationResult(validation);
        setFeedbackMode(mode);
        return validation;
      } catch (error) {
        if (mode !== 'live') {
          setValidationResult(null);
          setQueryError(getApiErrorMessage(error, 'No se pudo validar la consulta.'));
        }
        return null;
      }
    },
    [activeEntry],
  );

  useEffect(() => {
    if (!activeEntry || isModuleOne) return;

    const statement = sql.trim();
    if (!isReadyForLiveValidation(statement, activeEntry.moduloOrden, activeEntry.orden)) {
      setValidationResult(null);
      setLiveValidating(false);
      return;
    }

    let cancelled = false;
    setLiveValidating(true);
    liveValidationAbortRef.current?.abort();
    const controller = new AbortController();
    liveValidationAbortRef.current = controller;

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const validation = await sqlValidationAdapter.validate(statement, activeEntry.id, {
            signal: controller.signal,
          });
          if (!cancelled) {
            setValidationResult(validation);
            setFeedbackMode('live');
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          if (!cancelled) setValidationResult(null);
        } finally {
          if (!cancelled) setLiveValidating(false);
        }
      })();
    }, LIVE_VALIDATE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [sql, activeEntry, isModuleOne]);

  const handleValidateQuery = async () => {
    const statement = sql.trim();
    if (!statement || !activeEntry) {
      setQueryError('Escribe una sentencia SQL antes de validar.');
      return;
    }

    setValidating(true);
    setQueryError(null);
    setValidationResult(null);
    try {
      await runValidation(statement, 'manual');
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteQuery = async () => {
    const statement = sql.trim();
    if (!statement) {
      setQueryError('Escribe una sentencia SQL antes de ejecutar.');
      return;
    }

    setExecuting(true);
    setQueryError(null);
    setResult(null);
    try {
      const execution = await sqlExecutorAdapter.execute(statement);
      setResult(execution);
      await runValidation(statement, 'execute');
    } catch (error) {
      setResult(null);
      setQueryError(getApiErrorMessage(error, 'No se pudo ejecutar la consulta.'));
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <FadeInUp delayMs={120} className="py-16 text-center">
        <p className="text-slate-600 dark:text-slate-300">Cargando actividades por módulo...</p>
      </FadeInUp>
    );
  }

  if (error) {
    return (
      <FadeInUp delayMs={120}>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      </FadeInUp>
    );
  }

  if (!activeEntry) {
    return (
      <FadeInUp delayMs={120} className="py-16 text-center">
        <p className="text-slate-600 dark:text-slate-300">
          No hay actividades registradas en el curso.
        </p>
      </FadeInUp>
    );
  }

  const enunciados = practiceItems(activeEntry);
  const editorPlaceholder = getEditorPlaceholder(activeEntry.moduloOrden, activeEntry.orden);
  const practiceInstruction = getPracticeInstruction(activeEntry.moduloOrden);
  const sandboxLabel = getSandboxEditorLabel(activeEntry.moduloOrden);
  const canExecute =
    !isModuleOne && (validationResult?.correct === true || feedbackMode === 'execute');

  return (
    <div className="space-y-6">
      <FadeInUp delayMs={80}>
        <div className="rounded-2xl border border-cyan-200/80 bg-cyan-50/60 px-5 py-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
            Módulo {activeEntry.moduloOrden} · {activeEntry.moduloNombre}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {activeEntry.nombre}
          </h2>
        </div>
      </FadeInUp>

      <FadeInUp delayMs={140}>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
            Orden a cumplir
          </h3>
          {enunciados.length > 0 ? (
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {enunciados.map((item) => (
                <li key={item.id || item.orden}>{item.text}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No hay una orden definida para esta actividad.
            </p>
          )}
          <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">{practiceInstruction}</p>
        </section>
      </FadeInUp>

      <FadeInUp delayMs={200}>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Editor SQL</h3>
            <div className="flex flex-wrap items-center gap-2">
              {isModuleOne ? (
                <button
                  type="button"
                  onClick={() => void handleValidateQuery()}
                  disabled={validating}
                  className="inline-flex items-center justify-center rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
                >
                  {validating ? 'Validando...' : 'Validar consulta'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleExecuteQuery()}
                  disabled={executing}
                  title={
                    validationResult?.correct
                      ? 'La consulta cumple la orden; puedes ejecutarla'
                      : 'Ejecuta para ver el resultado; las sugerencias te indican qué falta'
                  }
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    canExecute
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-cyan-600 hover:bg-cyan-500'
                  }`}
                >
                  {executing ? 'Ejecutando...' : 'Realizar consulta'}
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] md:items-stretch">
            <ValidationSidebar
              isModuleOne={isModuleOne}
              moduloOrden={activeEntry.moduloOrden}
              liveValidating={liveValidating}
              validating={validating}
              validationResult={validationResult}
              feedbackMode={feedbackMode}
            />

            <div className="min-w-0">
              <div
                className={`overflow-hidden rounded-xl border bg-slate-950 transition-colors ${
                  !isModuleOne && validationResult?.correct
                    ? 'border-emerald-600/60 ring-1 ring-emerald-500/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="border-b border-slate-800 bg-slate-900/80 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {practiceMode === 'validate_only'
                    ? 'Validación sin ejecutar en el servidor'
                    : sandboxLabel}
                </div>
                <textarea
                  value={sql}
                  onChange={(event) => setSql(event.target.value)}
                  rows={10}
                  spellCheck={false}
                  placeholder={editorPlaceholder}
                  className="min-h-[14rem] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-emerald-100/95 outline-none placeholder:text-slate-600 md:min-h-[280px]"
                />
              </div>

              {queryError ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {queryError}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </FadeInUp>

      {result ? (
        <FadeInUp delayMs={260}>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Resultado ({result.rowCount} registro{result.rowCount === 1 ? '' : 's'})
            </h3>
            <SqlResultsTable
              columns={result.columns}
              rows={result.rows}
              message={result.message}
            />
          </section>
        </FadeInUp>
      ) : null}
    </div>
  );
}
