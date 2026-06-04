import { useEffect, useMemo, useState } from 'react';
import {
  getActividadPracticeMode,
  parseActividadSubNavId,
  SANDBOX_DML_TABLE,
} from '../../domain/config/actividades.config';
import type { SqlExecutionResult } from '../../domain/models/SqlExecutionResult';
import type { SqlValidationResult } from '../../domain/models/SqlValidationResult';
import { HttpActividadesAdapter } from '../../infrastructure/adapters/HttpActividadesAdapter';
import { HttpSqlExecutorAdapter } from '../../infrastructure/adapters/HttpSqlExecutorAdapter';
import { HttpSqlValidationAdapter } from '../../infrastructure/adapters/HttpSqlValidationAdapter';
import { getApiErrorMessage } from '../../infrastructure/api/apiErrors';
import { useActividadesCatalog } from '../session/ActividadesCatalogContext';
import { useSession } from '../session/SessionContext';
import { FadeInUp } from './FadeInUp';
import { SqlResultsTable } from './SqlResultsTable';

const actividadesAdapter = new HttpActividadesAdapter();
const sqlExecutorAdapter = new HttpSqlExecutorAdapter();
const sqlValidationAdapter = new HttpSqlValidationAdapter();

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

function LockedActividadMessage({
  moduloOrden,
  moduloNombre,
}: {
  moduloOrden: number;
  moduloNombre: string;
}) {
  return (
    <FadeInUp delayMs={120}>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Módulo {moduloOrden} · {moduloNombre}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Las actividades de este módulo se habilitan cuando completes el módulo correspondiente en
          la sección Curso.
        </p>
      </div>
    </FadeInUp>
  );
}

export function ActividadesPracticePanel({ activeSubNavId }: ActividadesPracticePanelProps) {
  const { activeUser } = useSession();
  const {
    entries,
    loading,
    error,
    findEntryByActividadId,
    isActividadEnabled,
    isActividadFinalized,
    markActividadFinalized,
  } = useActividadesCatalog();

  const [sql, setSql] = useState('');
  const [validating, setValidating] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<SqlValidationResult | null>(null);
  const [result, setResult] = useState<SqlExecutionResult | null>(null);

  const activeActividadId = parseActividadSubNavId(activeSubNavId);
  const activeEntry = useMemo(() => {
    if (activeActividadId) return findEntryByActividadId(activeActividadId);
    return entries.find((entry) => entry.moduloEnabled) ?? entries[0] ?? null;
  }, [activeActividadId, findEntryByActividadId, entries]);

  useEffect(() => {
    setSql('');
    setResult(null);
    setValidationResult(null);
    setQueryError(null);
    setFinalizeError(null);
  }, [activeEntry?.id]);

  const practiceMode = activeEntry
    ? getActividadPracticeMode(activeEntry.moduloOrden, activeEntry.orden)
    : 'validate_only';

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
      const validation = await sqlValidationAdapter.validate(statement, activeEntry.id);
      setValidationResult(validation);
    } catch (error) {
      setValidationResult(null);
      setQueryError(getApiErrorMessage(error, 'No se pudo validar la consulta.'));
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
    try {
      const execution = await sqlExecutorAdapter.execute(statement);
      setResult(execution);
    } catch (error) {
      setResult(null);
      setQueryError(getApiErrorMessage(error, 'No se pudo ejecutar la consulta.'));
    } finally {
      setExecuting(false);
    }
  };

  const handleFinalize = async () => {
    if (!activeUser || !activeEntry || !activeEntry.moduloEnabled) return;

    const items = practiceItems(activeEntry);
    const totalPreguntas = Math.max(items.length, 1);

    setFinalizing(true);
    setFinalizeError(null);
    try {
      await actividadesAdapter.finalizeActividad(
        activeUser.inscripcionId,
        activeEntry.id,
        totalPreguntas,
      );
      markActividadFinalized(activeEntry.id);
    } catch (error) {
      setFinalizeError(getApiErrorMessage(error, 'No se pudo finalizar la actividad.'));
    } finally {
      setFinalizing(false);
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

  if (!isActividadEnabled(activeEntry.id)) {
    return (
      <LockedActividadMessage
        moduloOrden={activeEntry.moduloOrden}
        moduloNombre={activeEntry.moduloNombre}
      />
    );
  }

  const isFinalized = isActividadFinalized(activeEntry.id);
  const enunciados = practiceItems(activeEntry);

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
          {isFinalized ? (
            <span className="mt-2 inline-flex rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Actividad finalizada · 100%
            </span>
          ) : null}
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
          <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
            Escribe en el editor la sentencia SQL que cumpla exactamente con la orden. Luego presiona
            Validar consulta.
          </p>
        </section>
      </FadeInUp>

      <FadeInUp delayMs={200}>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Editor SQL</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleValidateQuery()}
                disabled={validating}
                className="inline-flex items-center justify-center rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
              >
                {validating ? 'Validando...' : 'Validar consulta'}
              </button>
              {practiceMode === 'validate_and_execute' ? (
                <button
                  type="button"
                  onClick={() => void handleExecuteQuery()}
                  disabled={executing}
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {executing ? 'Ejecutando...' : 'Realizar consulta'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void handleFinalize()}
                disabled={finalizing || isFinalized}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
              >
                {finalizing ? 'Guardando...' : isFinalized ? 'Finalizada' : 'Finalizar'}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="border-b border-slate-800 bg-slate-900/80 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {practiceMode === 'validate_only'
                ? 'Validación sin ejecutar en la base de datos'
                : `Consulta SQL · tesis_sandbox · tabla ${SANDBOX_DML_TABLE}`}
            </div>
            <textarea
              value={sql}
              onChange={(event) => setSql(event.target.value)}
              rows={8}
              spellCheck={false}
              placeholder="Escribe aquí la sentencia SQL que cumple la orden..."
              className="w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-emerald-100/95 outline-none placeholder:text-slate-600"
            />
          </div>

          {queryError ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {queryError}
            </p>
          ) : null}
          {finalizeError ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {finalizeError}
            </p>
          ) : null}
        </section>
      </FadeInUp>

      {validationResult ? (
        <FadeInUp delayMs={240}>
          <section
            className={`rounded-2xl border px-5 py-4 ${
              validationResult.correct
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                validationResult.correct
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-red-800 dark:text-red-300'
              }`}
            >
              {validationResult.correct ? 'Correcto' : 'Incorrecto'}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              {validationResult.message}
            </p>
            {validationResult.hints && validationResult.hints.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-400">
                {validationResult.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            ) : null}
          </section>
        </FadeInUp>
      ) : null}

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
