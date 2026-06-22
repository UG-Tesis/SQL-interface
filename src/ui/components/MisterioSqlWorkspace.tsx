import { useState } from 'react';
import type { MisterioExecutionResult } from '../../domain/models/MisterioExecutionResult';
import { SqlResultsTable } from './SqlResultsTable';

interface MisterioSqlWorkspaceProps {
  sql: string;
  onSqlChange: (value: string) => void;
  onExecute: () => void;
  executing: boolean;
  queryError: string | null;
  result: MisterioExecutionResult | null;
  editorLabel?: string;
  placeholder?: string;
  onReset?: () => void;
  defaultSql?: string;
  onShowSolution?: () => void;
  showSolutionButton?: boolean;
}

export function MisterioSqlWorkspace({
  sql,
  onSqlChange,
  onExecute,
  executing,
  queryError,
  result,
  editorLabel = 'tesis_misterio',
  placeholder = 'Escribe SELECT para investigar, o INSERT INTO solucion para entregar tu respuesta…',
  onReset,
  onShowSolution,
  showSolutionButton = false,
}: MisterioSqlWorkspaceProps) {
  const [showSolutionFeedback, setShowSolutionFeedback] = useState(true);

  const solutionCheck = result?.solutionCheck;
  const feedbackVisible = solutionCheck && showSolutionFeedback;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Editor SQL</h3>
        <div className="flex flex-wrap items-center gap-2">
          {showSolutionButton && onShowSolution ? (
            <button
              type="button"
              onClick={onShowSolution}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Ver consulta sugerida
            </button>
          ) : null}
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Restablecer
            </button>
          ) : null}
          <button
            type="button"
            onClick={onExecute}
            disabled={executing}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {executing ? 'Ejecutando…' : 'Ejecutar consulta'}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-xl border bg-slate-950 transition-colors ${
          solutionCheck?.correct
            ? 'border-emerald-600/60 ring-1 ring-emerald-500/20'
            : 'border-slate-800'
        }`}
      >
        <div className="border-b border-slate-800 bg-slate-900/80 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {editorLabel}
        </div>
        <textarea
          value={sql}
          onChange={(event) => onSqlChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.shiftKey) {
              event.preventDefault();
              onExecute();
            }
          }}
          rows={10}
          spellCheck={false}
          placeholder={placeholder}
          className="min-h-[14rem] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-emerald-100/95 outline-none placeholder:text-slate-600 md:min-h-[220px]"
        />
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        <strong>Ejecutar consulta</strong> envía el SQL al servidor · <strong>Shift + Enter</strong>{' '}
        atajo de teclado · Solo una sentencia a la vez
      </p>

      {queryError ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {queryError}
        </p>
      ) : null}

      {feedbackVisible ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 ${
            solutionCheck.correct
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
              : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className={`text-sm font-semibold ${
                  solutionCheck.correct
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-amber-800 dark:text-amber-300'
                }`}
              >
                {solutionCheck.correct
                  ? solutionCheck.etapa === 2
                    ? '¡Misterio resuelto!'
                    : '¡Pista correcta!'
                  : 'Aún no es la persona correcta'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {solutionCheck.mensaje}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSolutionFeedback(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              aria-label="Cerrar retroalimentación"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Resultado ({result.rowCount} registro{result.rowCount === 1 ? '' : 's'})
          </h4>
          <SqlResultsTable columns={result.columns} rows={result.rows} message={result.message} />
        </div>
      ) : null}
    </section>
  );
}
