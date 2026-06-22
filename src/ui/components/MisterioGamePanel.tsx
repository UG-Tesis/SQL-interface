import { useCallback, useEffect, useState } from 'react';
import {
  MISTERIO_EXPERT_BLOCKS,
  MISTERIO_INTRO,
  MISTERIO_QUICK_START,
} from '../../domain/config/misterio.config';
import type { MisterioExecutionResult } from '../../domain/models/MisterioExecutionResult';
import { HttpMisterioAdapter } from '../../infrastructure/adapters/HttpMisterioAdapter';
import { getApiErrorMessage } from '../../infrastructure/api/apiErrors';
import { FadeInUp } from './FadeInUp';
import {
  MisterioHowToPlay,
  MisterioObjectives,
  MisterioQuickStart,
  MisterioSchemaGuide,
  MisterioVerifyHelp,
} from './MisterioHelpSections';
import { MisterioSqlWorkspace } from './MisterioSqlWorkspace';

const misterioAdapter = new HttpMisterioAdapter();

interface MisterioGamePanelProps {
  activeSubNavId?: string | null;
}

function OptionalQueries({
  onLoadQuery,
}: {
  onLoadQuery: (sql: string) => void;
}) {
  if (MISTERIO_EXPERT_BLOCKS.length === 0) return null;

  return (
    <details className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/80">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Consultas de apoyo (opcional)
      </summary>
      <ul className="space-y-3 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
        {MISTERIO_EXPERT_BLOCKS.map((block) => (
          <li key={block.id}>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{block.title}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{block.body}</p>
            {block.defaultSql ? (
              <button
                type="button"
                onClick={() => onLoadQuery(block.defaultSql ?? '')}
                className="mt-2 text-sm font-medium text-violet-700 hover:text-violet-600 dark:text-violet-300"
              >
                Cargar consulta
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function MisterioGamePanel(_props: MisterioGamePanelProps) {
  const [sql, setSql] = useState(MISTERIO_QUICK_START.sql);
  const [executing, setExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [result, setResult] = useState<MisterioExecutionResult | null>(null);

  useEffect(() => {
    setSql(MISTERIO_QUICK_START.sql);
    setResult(null);
    setQueryError(null);
  }, []);

  const handleExecute = useCallback(async () => {
    const statement = sql.trim();
    if (!statement) {
      setQueryError('Escribe una sentencia SQL antes de ejecutar.');
      return;
    }

    setExecuting(true);
    setQueryError(null);
    setResult(null);
    try {
      const execution = await misterioAdapter.executeSql(statement);
      setResult(execution);
    } catch (error) {
      setResult(null);
      setQueryError(getApiErrorMessage(error, 'No se pudo ejecutar la consulta.'));
    } finally {
      setExecuting(false);
    }
  }, [sql]);

  const handleLoadDefault = useCallback((value: string) => {
    setSql(value);
    setResult(null);
    setQueryError(null);
  }, []);

  return (
    <div className="space-y-6">
      <FadeInUp delayMs={80}>
        <div className="rounded-2xl border border-violet-200/80 bg-violet-50/60 px-5 py-4 dark:border-violet-900/50 dark:bg-violet-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400">
            Modo experto
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Misterio SQL: ¿Quién lo hizo?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {MISTERIO_INTRO}
          </p>
          <p className="mt-2 text-xs text-violet-800/80 dark:text-violet-300/80">
            ¿Primera vez? Lee «¿Cómo funciona este juego?» más abajo para orientarte.
          </p>
        </div>
      </FadeInUp>

      <FadeInUp delayMs={100}>
        <MisterioHowToPlay />
      </FadeInUp>

      <FadeInUp delayMs={120}>
        <MisterioObjectives />
      </FadeInUp>

      <FadeInUp delayMs={140}>
        <MisterioQuickStart onLoadQuery={handleLoadDefault} />
      </FadeInUp>

      <FadeInUp delayMs={160}>
        <MisterioSchemaGuide />
      </FadeInUp>

      <FadeInUp delayMs={180}>
        <MisterioSqlWorkspace
          sql={sql}
          onSqlChange={setSql}
          onExecute={() => void handleExecute()}
          executing={executing}
          queryError={queryError}
          result={result}
          editorLabel="Investigación · tesis_misterio"
          onReset={() => handleLoadDefault(MISTERIO_QUICK_START.sql)}
        />
      </FadeInUp>

      <FadeInUp delayMs={200}>
        <OptionalQueries onLoadQuery={handleLoadDefault} />
      </FadeInUp>

      <FadeInUp delayMs={220}>
        <MisterioVerifyHelp />
      </FadeInUp>
    </div>
  );
}
