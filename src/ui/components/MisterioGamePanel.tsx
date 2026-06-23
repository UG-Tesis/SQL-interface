import { useCallback, useMemo, useRef, useState } from 'react';
import { MISTERIO_QUICK_START } from '../../domain/config/misterio.config';
import type { MisterioExecutionResult } from '../../domain/models/MisterioExecutionResult';
import { HttpMisterioAdapter } from '../../infrastructure/adapters/HttpMisterioAdapter';
import { getApiErrorMessage } from '../../infrastructure/api/apiErrors';
import { FadeInUp } from './FadeInUp';
import { MisterioCaseHeader, type MisterioHelpTab } from './MisterioCaseHeader';
import { MisterioHelpPanel } from './MisterioHelpPanel';
import { MisterioSqlWorkspace } from './MisterioSqlWorkspace';

const misterioAdapter = new HttpMisterioAdapter();

function resolveEtapa(result: MisterioExecutionResult | null): 1 | 2 | 'resuelto' {
  const check = result?.solutionCheck;
  if (!check?.correct) return 1;
  if (check.etapa === 2) return 'resuelto';
  return 2;
}

export function MisterioGamePanel() {
  const [sql, setSql] = useState('');
  const [executing, setExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [result, setResult] = useState<MisterioExecutionResult | null>(null);
  const [firstClueLoaded, setFirstClueLoaded] = useState(false);
  const [helpOpen, setHelpOpen] = useState(true);
  const [helpTab, setHelpTab] = useState<MisterioHelpTab>('caso');
  const helpPanelRef = useRef<HTMLElement>(null);

  const currentEtapa = useMemo(() => resolveEtapa(result), [result]);

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

  const handleLoadFirstClue = useCallback(() => {
    setSql(MISTERIO_QUICK_START.sql);
    setFirstClueLoaded(true);
    setResult(null);
    setQueryError(null);
  }, []);

  const handleReset = useCallback(() => {
    setSql('');
    setFirstClueLoaded(false);
    setResult(null);
    setQueryError(null);
  }, []);

  const handleOpenHelp = useCallback((tab: MisterioHelpTab) => {
    setHelpTab(tab);
    setHelpOpen(true);
    requestAnimationFrame(() => {
      helpPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  return (
    <div className="w-full space-y-4">
      <FadeInUp delayMs={60} className="w-full">
        <MisterioCaseHeader
          currentEtapa={currentEtapa}
          firstClueLoaded={firstClueLoaded}
          onLoadFirstClue={handleLoadFirstClue}
          onOpenHelp={handleOpenHelp}
        />
      </FadeInUp>

      <FadeInUp delayMs={100} className="w-full">
        <MisterioSqlWorkspace
          sql={sql}
          onSqlChange={setSql}
          onExecute={() => void handleExecute()}
          executing={executing}
          queryError={queryError}
          result={result}
          editorLabel="Investigación · tesis_misterio"
          onReset={handleReset}
        />
      </FadeInUp>

      <FadeInUp delayMs={140} className="w-full">
        <MisterioHelpPanel
          ref={helpPanelRef}
          open={helpOpen}
          activeTab={helpTab}
          onTabChange={setHelpTab}
          onToggle={() => setHelpOpen((prev) => !prev)}
          onLoadQuery={handleLoadDefault}
        />
      </FadeInUp>
    </div>
  );
}
