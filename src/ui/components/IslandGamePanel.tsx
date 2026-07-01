import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getIslandMissionIndexForStep,
  ISLAND_AUTO_STEPS,
  ISLAND_INTRO,
  ISLAND_MISSIONS_UI,
  ISLAND_SCHEMA_TABLES,
  ISLAND_STEP_NARRATIVES,
  ISLAND_TOTAL_STEPS,
} from '../../domain/config/island.config';
import type { IslandActionResult } from '../../domain/models/IslandActionResult';
import type { SqlColumnMeta } from '../../domain/models/SqlExecutionResult';
import { HttpIslandAdapter } from '../../infrastructure/adapters/HttpIslandAdapter';
import { getApiErrorMessage } from '../../infrastructure/api/apiErrors';
import {
  clearStoredIslandSessionId,
  getStoredIslandSessionId,
  setStoredIslandSessionId,
} from '../../infrastructure/session/islandSessionStorage';
import { closeIslandSessionReliable } from '../../infrastructure/session/islandSessionCleanup';
import { FadeInUp } from './FadeInUp';
import { SqlResultsTable } from './SqlResultsTable';
import { TypewriterText } from './TypewriterText';

const islandAdapter = new HttpIslandAdapter();

interface QueryHistoryEntry {
  sql: string;
  columns: SqlColumnMeta[];
  rows: Record<string, unknown>[];
  message?: string;
  feedback?: string;
  success?: boolean;
}

export function IslandGamePanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const [sql, setSql] = useState('');
  const [executing, setExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [narrativeExtra, setNarrativeExtra] = useState<string | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const [pendingNextStep, setPendingNextStep] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryEntry[]>([]);
  const [awaitingAdvance, setAwaitingAdvance] = useState(false);
  const [nextStepAfterAdvance, setNextStepAfterAdvance] = useState<number | null>(null);

  const queryLogRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const bootstrapStartedRef = useRef(false);

  const closeCurrentSession = useCallback(async () => {
    const sessionId = sessionIdRef.current ?? getStoredIslandSessionId();
    if (!sessionId) {
      return;
    }

    sessionIdRef.current = null;
    clearStoredIslandSessionId();

    try {
      await islandAdapter.closeSession(sessionId);
    } catch {
      /* La sesión pudo haber expirado en el servidor. */
    }
  }, []);

  const requireSessionId = useCallback(() => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) {
      throw new Error('No hay una sesión de juego activa.');
    }
    return sessionId;
  }, []);

  const missionIndex = useMemo(() => getIslandMissionIndexForStep(stepIndex), [stepIndex]);
  const currentMission = ISLAND_MISSIONS_UI[missionIndex];
  const isAutoStep = ISLAND_AUTO_STEPS.has(stepIndex);
  const narrative = pendingFollowUp ?? ISLAND_STEP_NARRATIVES[stepIndex] ?? ISLAND_INTRO;
  const narrativeKey = `${stepIndex}-${pendingFollowUp ? 'follow' : 'step'}-${narrative.length}`;
  const narrativeExtraKey = narrativeExtra
    ? `${stepIndex}-extra-${narrativeExtra.length}`
    : null;

  const appendHistory = useCallback((entry: QueryHistoryEntry) => {
    setQueryHistory((prev) => [...prev, entry]);
  }, []);

  useEffect(() => {
    const log = queryLogRef.current;
    if (!log) return;
    requestAnimationFrame(() => {
      log.scrollTop = log.scrollHeight;
    });
  }, [queryHistory.length, queryError]);

  const advanceToNextStep = useCallback((nextIndex: number | null) => {
    if (nextIndex == null) {
      setGameComplete(true);
      setAwaitingAdvance(false);
      setNextStepAfterAdvance(null);
      return;
    }
    setStepIndex(nextIndex);
    setSql('');
    setNarrativeExtra(null);
    setPendingFollowUp(null);
    setPendingNextStep(null);
    setAwaitingAdvance(false);
    setNextStepAfterAdvance(null);
    setQueryError(null);
  }, []);

  const markStepComplete = useCallback((actionResult: IslandActionResult) => {
    if (actionResult.answer) {
      setNarrativeExtra(actionResult.answer);
    }
    if (actionResult.followUp) {
      setPendingFollowUp(actionResult.followUp);
      setPendingNextStep(actionResult.nextStepIndex);
      setAwaitingAdvance(false);
      return;
    }
    if (actionResult.gameComplete) {
      setGameComplete(true);
      setAwaitingAdvance(false);
      return;
    }
    setNextStepAfterAdvance(actionResult.nextStepIndex);
    setAwaitingAdvance(true);
  }, []);

  const bootstrap = useCallback(async (options?: { resetExisting?: boolean }) => {
    setExecuting(true);
    setQueryError(null);
    try {
      if (!options?.resetExisting) {
        await closeCurrentSession();
      }

      const restartResult = await islandAdapter.restart(
        options?.resetExisting ? sessionIdRef.current ?? undefined : undefined,
      );

      sessionIdRef.current = restartResult.sessionId;
      setStoredIslandSessionId(restartResult.sessionId);
      setStepIndex(0);
      setSql('');
      setNarrativeExtra(null);
      setPendingFollowUp(null);
      setPendingNextStep(null);
      setGameComplete(false);
      setQueryHistory([]);
      setAwaitingAdvance(false);
      setNextStepAfterAdvance(null);
      setReady(true);
    } catch (error) {
      setQueryError(getApiErrorMessage(error, 'No se pudo iniciar el juego.'));
    } finally {
      setExecuting(false);
    }
  }, [closeCurrentSession]);

  useEffect(() => {
    if (bootstrapStartedRef.current) return;
    bootstrapStartedRef.current = true;
    void bootstrap();

    return () => {
      void closeCurrentSession();
    };
  }, [bootstrap, closeCurrentSession]);

  useEffect(() => {
    const handlePageHide = () => {
      const sessionId = sessionIdRef.current ?? getStoredIslandSessionId();
      if (!sessionId) {
        return;
      }

      sessionIdRef.current = null;
      clearStoredIslandSessionId();
      closeIslandSessionReliable(sessionId);
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const handleExecute = useCallback(async () => {
    const statement = sql.trim();
    if (!statement) {
      setQueryError('Escribe una sentencia SQL antes de ejecutar.');
      return;
    }

    setExecuting(true);
    setQueryError(null);
    try {
      const actionResult = await islandAdapter.executeSql(
        requireSessionId(),
        stepIndex,
        statement,
      );
      const failed = actionResult.code < 0 || !actionResult.stepComplete;

      appendHistory({
        sql: statement,
        columns: actionResult.columns,
        rows: actionResult.rows,
        message:
          actionResult.rows.length > 0
            ? undefined
            : actionResult.message,
        feedback: failed ? actionResult.message : '¡Correcto!',
        success: !failed,
      });

      if (failed) {
        setQueryError(actionResult.message);
        return;
      }

      markStepComplete(actionResult);
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo ejecutar la consulta.');
      appendHistory({
        sql: statement,
        columns: [],
        rows: [],
        feedback: message,
        success: false,
      });
      setQueryError(message);
    } finally {
      setExecuting(false);
    }
  }, [appendHistory, markStepComplete, requireSessionId, sql, stepIndex]);

  const handleContinue = useCallback(async () => {
    if (pendingFollowUp) {
      const next = pendingNextStep ?? stepIndex + 1;
      setPendingFollowUp(null);
      setPendingNextStep(null);
      setNarrativeExtra(null);
      advanceToNextStep(next);
      return;
    }

    if (awaitingAdvance) {
      advanceToNextStep(nextStepAfterAdvance ?? stepIndex + 1);
      return;
    }

    if (!isAutoStep) {
      return;
    }

    setExecuting(true);
    setQueryError(null);
    try {
      const actionResult = await islandAdapter.continue(requireSessionId(), stepIndex);
      if (actionResult.demoSql) {
        appendHistory({
          sql: actionResult.demoSql,
          columns: actionResult.columns,
          rows: actionResult.rows,
          message:
            actionResult.rows.length > 0 ? undefined : actionResult.message,
          feedback: '¡Correcto!',
          success: true,
        });
      }
      markStepComplete(actionResult);
    } catch (error) {
      setQueryError(getApiErrorMessage(error, 'No se pudo avanzar.'));
    } finally {
      setExecuting(false);
    }
  }, [
    advanceToNextStep,
    appendHistory,
    awaitingAdvance,
    isAutoStep,
    markStepComplete,
    nextStepAfterAdvance,
    pendingFollowUp,
    pendingNextStep,
    requireSessionId,
    stepIndex,
  ]);

  const showContinueOnly = awaitingAdvance || isAutoStep || Boolean(pendingFollowUp);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden">
      {/* Cabecera */}
      <FadeInUp delayMs={40} className="w-full shrink-0">
        <section className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-[1px] shadow-md shadow-amber-200/50 dark:border-amber-700/40 dark:from-amber-500 dark:via-orange-500 dark:to-rose-500 dark:shadow-orange-500/20">
          <div className="rounded-[calc(0.75rem-1px)] bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-3 py-2 sm:px-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-lg shadow-md shadow-cyan-500/25 dark:shadow-cyan-500/30">
                  🏝️
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-700/90 dark:text-amber-400/90">
                    SQL Island · tesis_island
                  </p>
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                    Escapa de la isla
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void bootstrap({ resetExisting: true })}
                disabled={executing}
                className="rounded-lg border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur transition hover:bg-white disabled:opacity-60 sm:text-sm dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                Reiniciar partida
              </button>
            </div>

            <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5">
              {ISLAND_MISSIONS_UI.map((mission, index) => {
                const done = gameComplete || index < missionIndex;
                const active = index === missionIndex && !gameComplete;
                return (
                  <div
                    key={mission.id}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                      active
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 dark:bg-amber-400 dark:text-slate-900 dark:shadow-amber-400/30'
                        : done
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40'
                          : 'bg-white/70 text-slate-500 ring-1 ring-amber-200/80 dark:bg-white/5 dark:text-slate-400 dark:ring-transparent'
                    }`}
                    title={mission.summary}
                  >
                    {done && !active ? '✓ ' : ''}
                    M{mission.id}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* Panel principal: izquierda narrativa · derecha consola */}
      {ready ? (
        <FadeInUp delayMs={80} className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <div className="grid min-h-[calc(100dvh-8.5rem)] flex-1 gap-2 lg:grid-cols-[minmax(200px,26%)_1fr] lg:grid-rows-1">
            {/* —— Columna izquierda: órdenes / historia —— */}
            <aside className="flex min-h-0 flex-col gap-2 overflow-hidden">
              <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-50/95 to-orange-50/90 p-3.5 shadow-sm dark:border-amber-800/30 dark:from-slate-800 dark:to-slate-900 dark:shadow-md">
                <div
                  className="pointer-events-none absolute -right-3 top-12 hidden h-0 w-0 border-y-[10px] border-l-[12px] border-y-transparent border-l-orange-50 lg:block dark:border-l-slate-800"
                  aria-hidden
                />

                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/90">
                  {gameComplete
                    ? 'Fin del juego'
                    : `Misión ${currentMission.id} · Paso ${stepIndex + 1}/${ISLAND_TOTAL_STEPS}`}
                </p>

                <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                  <p className="text-base font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                    <TypewriterText
                      key={narrativeKey}
                      text={narrative}
                      speed={18}
                      sentencePauseMs={360}
                    />
                  </p>

                  {narrativeExtra ? (
                    <div className="mt-4 rounded-xl border border-cyan-200/60 bg-cyan-50/90 px-3 py-2.5 text-sm leading-relaxed text-cyan-950 dark:border-cyan-800/50 dark:bg-cyan-950/40 dark:text-cyan-100">
                      <TypewriterText
                        key={narrativeExtraKey ?? 'extra'}
                        text={narrativeExtra}
                        speed={16}
                        sentencePauseMs={300}
                      />
                    </div>
                  ) : null}

                  {gameComplete ? (
                    <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <TypewriterText
                        key="game-complete"
                        text="¡Felicidades! Completaste las 8 misiones y escapaste de SQL Island."
                        speed={18}
                        sentencePauseMs={400}
                      />
                    </div>
                  ) : null}
                </div>

                {!gameComplete && showContinueOnly ? (
                  <button
                    type="button"
                    onClick={() => void handleContinue()}
                    disabled={executing}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-60"
                  >
                    {executing ? 'Avanzando…' : 'Continuar →'}
                  </button>
                ) : null}
              </section>

              <section className="shrink-0 rounded-lg border border-amber-200/70 bg-white/90 p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Tablas
                </h3>
                <ul className="mt-1 space-y-1">
                  {ISLAND_SCHEMA_TABLES.map((table) => (
                    <li
                      key={table.tabla}
                      className="rounded-lg bg-slate-100/80 px-2.5 py-1.5 font-mono text-[10px] leading-snug text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {table.tabla}
                      </span>{' '}
                      <span className="text-slate-500">({table.columnas})</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>

            {/* —— Columna derecha: log + editor —— */}
            {!gameComplete ? (
              <main className="flex h-[calc(100dvh-13rem)] min-h-[18rem] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-200/40 lg:h-full lg:min-h-0 lg:max-h-full lg:shrink dark:border-slate-700/80 dark:bg-slate-950 dark:shadow-xl dark:shadow-black/20">
                {/* Log de consultas (altura fija, scroll interno) */}
                <div
                  ref={queryLogRef}
                  className="min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4"
                  aria-label="Historial de consultas"
                >
                  {queryHistory.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      Aquí aparecerán tus consultas y sus resultados…
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {queryHistory.map((entry, index) => (
                        <div key={`${index}-${entry.sql.slice(0, 20)}`} className="space-y-2">
                          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-teal-800 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-emerald-300/95 dark:shadow-none">
                            <code>{entry.sql}</code>
                          </pre>

                          {entry.rows.length > 0 || entry.columns.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700/80">
                              <SqlResultsTable
                                columns={entry.columns}
                                rows={entry.rows}
                                message={entry.message}
                              />
                            </div>
                          ) : null}

                          {entry.feedback ? (
                            <p
                              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                entry.success
                                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30'
                                  : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30'
                              }`}
                            >
                              {entry.feedback}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editor SQL fijo abajo */}
                {!showContinueOnly ? (
                  <div className="shrink-0 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90">
                    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Consola SQL · tesis_island
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-600">Shift + Enter</span>
                    </div>
                    <textarea
                      value={sql}
                      onChange={(event) => setSql(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && event.shiftKey) {
                          event.preventDefault();
                          void handleExecute();
                        }
                      }}
                      rows={2}
                      spellCheck={false}
                      placeholder="SELECT ...  ← escribe tu consulta aquí"
                      className="w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-teal-900 outline-none placeholder:text-slate-400 dark:text-emerald-100 dark:placeholder:text-slate-600"
                    />
                    <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 dark:border-slate-800">
                      {queryError ? (
                        <p className="min-w-0 flex-1 truncate text-xs text-rose-600 dark:text-rose-400" title={queryError}>
                          {queryError}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-600">Ejecuta para validar el paso</span>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleExecute()}
                        disabled={executing}
                        className="shrink-0 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-teal-500 disabled:opacity-60 dark:from-cyan-500 dark:to-teal-500 dark:shadow-cyan-500/20 dark:hover:from-cyan-400 dark:hover:to-teal-400"
                      >
                        {executing ? 'Ejecutando…' : 'Ejecutar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 border-t border-slate-200 bg-slate-100/80 px-4 py-3 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                    Pulsa <strong className="text-amber-700 dark:text-amber-400">Continuar</strong> en el panel
                    izquierdo para avanzar
                  </div>
                )}
              </main>
            ) : (
              <main className="flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-950/20">
                <p className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                  Partida completada. Usa Reiniciar partida para jugar de nuevo.
                </p>
              </main>
            )}
          </div>
        </FadeInUp>
      ) : null}

      {!ready && queryError ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {queryError}
        </p>
      ) : null}
    </div>
  );
}
