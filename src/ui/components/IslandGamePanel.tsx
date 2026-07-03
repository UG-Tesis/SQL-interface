import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getIslandMissionIndexForStep,
  getIslandHintForStep,
  getIslandSqlTaskForStep,
  ISLAND_AUTO_STEPS,
  ISLAND_AUTO_STEP_PROMPTS,
  ISLAND_HINT_AFTER_FAILURES,
  ISLAND_MISSIONS_UI,
  ISLAND_SCHEMA_TABLES,
  ISLAND_STEP_NARRATIVES,
  ISLAND_TOTAL_STEPS,
} from '../../domain/config/island.config';
import {
  ISLAND_STEP_ANSWER_SPEAKERS,
  ISLAND_STEP_FOLLOW_UP_SPEAKERS,
  ISLAND_STEP_NARRATIVE_SPEAKERS,
  ISLAND_STEP_PRE_SQL_DIALOGUE,
} from '../../domain/config/island-chat.config';
import type { IslandActionResult } from '../../domain/models/IslandActionResult';
import type { SqlColumnMeta } from '../../domain/models/SqlExecutionResult';
import { HttpIslandAdapter } from '../../infrastructure/adapters/HttpIslandAdapter';
import { getApiErrorMessage } from '../../infrastructure/api/apiErrors';
import {
  clearStoredIslandProgress,
  clearStoredIslandStepIndex,
  getStoredIslandSessionId,
  getStoredIslandStepIndex,
  setStoredIslandSessionId,
  setStoredIslandStepIndex,
} from '../../infrastructure/session/islandSessionStorage';
import { closeIslandSessionReliable } from '../../infrastructure/session/islandSessionCleanup';
import { IslandChatPanel } from './IslandChatPanel';
import type { IslandChatMessageData } from './IslandChatMessage';
import { FadeInUp } from './FadeInUp';
import { SqlResultsTable } from './SqlResultsTable';

const islandAdapter = new HttpIslandAdapter();

function IslandGameBootstrapState({ error }: { error: string | null }) {
  if (error) {
    return (
      <div className="flex min-h-[calc(100dvh-8.5rem)] flex-1 items-center justify-center rounded-xl border border-red-200/80 bg-red-50/80 px-6 py-10 text-center dark:border-red-500/30 dark:bg-red-950/20">
        <p className="max-w-md text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="grid h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)] min-h-0 flex-1 grid-rows-[minmax(0,36%)_minmax(0,1fr)] gap-2 overflow-hidden lg:grid-cols-[minmax(200px,26%)_1fr] lg:grid-rows-1"
      aria-busy="true"
      aria-live="polite"
    >
      <aside className="flex min-h-0 flex-col gap-2 overflow-hidden lg:h-full">
        <div className="flex min-h-0 flex-1 animate-pulse flex-col rounded-xl border border-amber-200/50 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="h-3 w-28 rounded bg-amber-200/80 dark:bg-slate-700" />
          <div className="mt-4 space-y-3">
            <div className="h-12 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
            <div className="h-12 w-4/5 rounded-xl bg-slate-200/60 dark:bg-slate-800/80" />
          </div>
        </div>
        <div className="shrink-0 animate-pulse rounded-lg border border-amber-200/50 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 space-y-2">
            <div className="h-8 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
            <div className="h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800/80" />
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 animate-pulse flex-col gap-2 overflow-hidden rounded-xl border border-amber-200/50 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="h-3 w-32 rounded bg-amber-200/80 dark:bg-slate-700" />
        <div className="min-h-0 flex-1 rounded-lg bg-slate-200/70 dark:bg-slate-800/80" />
        <div className="h-24 rounded-lg bg-slate-200/60 dark:bg-slate-800/70" />
      </main>

      <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Preparando tu partida en la isla…
      </p>
    </div>
  );
}

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
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const [pendingNextStep, setPendingNextStep] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<IslandChatMessageData[]>([]);
  const [awaitingAdvance, setAwaitingAdvance] = useState(false);
  const [nextStepAfterAdvance, setNextStepAfterAdvance] = useState<number | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [stepFailureCount, setStepFailureCount] = useState(0);
  const [stepHint, setStepHint] = useState<string | null>(null);
  const [preSqlDialogueDone, setPreSqlDialogueDone] = useState(true);

  const queryLogRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const bootstrapStartedRef = useRef(false);
  const chatIdRef = useRef(0);
  const lastNarrativeStepRef = useRef<number | null>(null);
  const gameCompletePushedRef = useRef(false);
  const hintPushedForStepRef = useRef<number | null>(null);

  const appendChatMessage = useCallback(
    (message: Omit<IslandChatMessageData, 'id'>) => {
      chatIdRef.current += 1;
      const id = `chat-${chatIdRef.current}`;
      setChatMessages((prev) => [
        ...prev.map((entry) => ({ ...entry, animate: false })),
        { ...message, id, animate: true },
      ]);
    },
    [],
  );

  const pushStepNarrative = useCallback(
    (index: number) => {
      const text = ISLAND_STEP_NARRATIVES[index];
      if (!text) return;
      const speaker = ISLAND_STEP_NARRATIVE_SPEAKERS[index] ?? { side: 'player' as const };
      const autoPrompt = ISLAND_AUTO_STEP_PROMPTS[index];
      const preSqlDialogue = ISLAND_STEP_PRE_SQL_DIALOGUE[index];

      appendChatMessage({
        side: speaker.side,
        speakerName: speaker.side === 'other' ? speaker.name : 'Tú',
        text,
        onAnimateComplete: preSqlDialogue
          ? () => {
              appendChatMessage({
                side: preSqlDialogue.speaker.side,
                speakerName: preSqlDialogue.speaker.name ?? 'Isla',
                text: preSqlDialogue.text,
                onAnimateComplete: () => {
                  setPreSqlDialogueDone(true);
                },
              });
            }
          : autoPrompt
            ? () => {
                appendChatMessage({
                  side: 'other',
                  speakerName: 'Guía',
                  text: autoPrompt,
                });
              }
            : undefined,
      });
      lastNarrativeStepRef.current = index;
    },
    [appendChatMessage],
  );

  const pushStepAnswer = useCallback(
    (index: number, text: string) => {
      const speaker = ISLAND_STEP_ANSWER_SPEAKERS[index] ?? {
        side: 'other' as const,
        name: 'Isla',
      };
      appendChatMessage({
        side: speaker.side,
        speakerName: speaker.side === 'player' ? 'Tú' : speaker.name,
        text,
      });
    },
    [appendChatMessage],
  );

  const pushStepFollowUp = useCallback(
    (index: number, text: string) => {
      const speaker = ISLAND_STEP_FOLLOW_UP_SPEAKERS[index] ?? {
        side: 'other' as const,
        name: 'Isla',
      };
      appendChatMessage({
        side: speaker.side,
        speakerName: speaker.side === 'player' ? 'Tú' : speaker.name,
        text,
      });
    },
    [appendChatMessage],
  );

  const pushGameCompleteOnce = useCallback(() => {
    if (gameCompletePushedRef.current) return;
    gameCompletePushedRef.current = true;
    appendChatMessage({
      side: 'other',
      speakerName: 'Isla',
      text: '¡Felicidades! Completaste las 8 misiones y escapaste de SQL Island.',
    });
  }, [appendChatMessage]);

  const revealStepHint = useCallback(
    (hint: string) => {
      setStepHint(hint);
      if (hintPushedForStepRef.current === stepIndex) {
        return;
      }
      hintPushedForStepRef.current = stepIndex;
      appendChatMessage({
        side: 'other',
        speakerName: 'Guía',
        text: `Pista: ${hint}`,
      });
    },
    [appendChatMessage, stepIndex],
  );

  const registerStepFailure = useCallback(
    (failureCount?: number) => {
      const nextCount = failureCount ?? stepFailureCount + 1;
      setStepFailureCount(nextCount);

      if (nextCount >= ISLAND_HINT_AFTER_FAILURES) {
        const hint = getIslandHintForStep(stepIndex);
        if (hint) {
          revealStepHint(hint);
        }
      }
    },
    [revealStepHint, stepFailureCount, stepIndex],
  );

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
  const sqlTask = useMemo(() => {
    if (ISLAND_STEP_PRE_SQL_DIALOGUE[stepIndex] && !preSqlDialogueDone) {
      return null;
    }
    return getIslandSqlTaskForStep(stepIndex);
  }, [preSqlDialogueDone, stepIndex]);
  const sqlPlaceholder = useMemo(() => {
    if (!sqlTask) return 'SELECT ...  ← escribe tu consulta aquí';
    switch (sqlTask.kind) {
      case 'INSERT':
        return 'INSERT INTO ...  ← escribe tu sentencia aquí';
      case 'UPDATE':
        return 'UPDATE ... SET ...  ← escribe tu sentencia aquí';
      case 'DELETE':
        return 'DELETE FROM ...  ← escribe tu sentencia aquí';
      default:
        return 'SELECT ... FROM ...  ← escribe tu consulta aquí';
    }
  }, [sqlTask]);

  useEffect(() => {
    setStepFailureCount(0);
    setStepHint(null);
    setPreSqlDialogueDone(!ISLAND_STEP_PRE_SQL_DIALOGUE[stepIndex]);
  }, [stepIndex]);

  const attemptsUntilHint = Math.max(0, ISLAND_HINT_AFTER_FAILURES - stepFailureCount);

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
      pushGameCompleteOnce();
      setAwaitingAdvance(false);
      setNextStepAfterAdvance(null);
      return;
    }
    setStepIndex(nextIndex);
    setSql('');
    setPendingFollowUp(null);
    setPendingNextStep(null);
    setAwaitingAdvance(false);
    setNextStepAfterAdvance(null);
    setQueryError(null);
    setStepFailureCount(0);
    setStepHint(null);
  }, [pushGameCompleteOnce]);

  const markStepComplete = useCallback((actionResult: IslandActionResult) => {
    if (actionResult.answer && actionResult.followUp) {
      const answerSpeaker = ISLAND_STEP_ANSWER_SPEAKERS[stepIndex] ?? {
        side: 'other' as const,
        name: 'Isla',
      };
      setPendingFollowUp(actionResult.followUp);
      setPendingNextStep(actionResult.nextStepIndex);
      appendChatMessage({
        side: answerSpeaker.side,
        speakerName: answerSpeaker.side === 'player' ? 'Tú' : answerSpeaker.name,
        text: actionResult.answer,
        onAnimateComplete: () => {
          pushStepFollowUp(stepIndex, actionResult.followUp!);
        },
      });
      setAwaitingAdvance(false);
      return;
    }

    if (actionResult.answer) {
      pushStepAnswer(stepIndex, actionResult.answer);
    }
    if (actionResult.followUp) {
      setPendingFollowUp(actionResult.followUp);
      setPendingNextStep(actionResult.nextStepIndex);
      pushStepFollowUp(stepIndex, actionResult.followUp);
      setAwaitingAdvance(false);
      return;
    }
    if (actionResult.gameComplete) {
      setGameComplete(true);
      pushGameCompleteOnce();
      setAwaitingAdvance(false);
      return;
    }
    setNextStepAfterAdvance(actionResult.nextStepIndex);
    setAwaitingAdvance(true);
  }, [appendChatMessage, pushGameCompleteOnce, pushStepAnswer, pushStepFollowUp, stepIndex]);

  useEffect(() => {
    if (!ready || gameComplete) return;
    if (lastNarrativeStepRef.current === stepIndex) return;
    pushStepNarrative(stepIndex);
  }, [gameComplete, pushStepNarrative, ready, sessionKey, stepIndex]);

  const resetGameUi = useCallback((nextStepIndex = 0) => {
    setStepIndex(nextStepIndex);
    setSql('');
    setPendingFollowUp(null);
    setPendingNextStep(null);
    setGameComplete(false);
    setQueryHistory([]);
    setChatMessages([]);
    lastNarrativeStepRef.current = null;
    gameCompletePushedRef.current = false;
    hintPushedForStepRef.current = null;
    chatIdRef.current = 0;
    setSessionKey((key) => key + 1);
    setStepFailureCount(0);
    setStepHint(null);
    setAwaitingAdvance(false);
    setNextStepAfterAdvance(null);
    setPreSqlDialogueDone(!ISLAND_STEP_PRE_SQL_DIALOGUE[nextStepIndex]);
  }, []);

  const bootstrap = useCallback(async (options?: { resetExisting?: boolean }) => {
    setExecuting(true);
    setQueryError(null);
    try {
      if (options?.resetExisting) {
        const sessionId =
          sessionIdRef.current ?? getStoredIslandSessionId() ?? undefined;
        const restartResult = await islandAdapter.restart(sessionId);
        sessionIdRef.current = restartResult.sessionId;
        setStoredIslandSessionId(restartResult.sessionId);
        clearStoredIslandStepIndex();
        resetGameUi(0);
        setReady(true);
        return;
      }

      const storedSessionId = getStoredIslandSessionId();
      if (storedSessionId) {
        try {
          await islandAdapter.resume(storedSessionId);
          sessionIdRef.current = storedSessionId;
          resetGameUi(getStoredIslandStepIndex() ?? 0);
          setReady(true);
          return;
        } catch {
          clearStoredIslandProgress();
        }
      }

      const restartResult = await islandAdapter.restart();
      sessionIdRef.current = restartResult.sessionId;
      setStoredIslandSessionId(restartResult.sessionId);
      clearStoredIslandStepIndex();
      resetGameUi(0);
      setReady(true);
    } catch (error) {
      setQueryError(getApiErrorMessage(error, 'No se pudo iniciar el juego.'));
    } finally {
      setExecuting(false);
    }
  }, [resetGameUi]);

  useEffect(() => {
    if (bootstrapStartedRef.current) return;
    bootstrapStartedRef.current = true;
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!ready || !sessionIdRef.current) return;
    setStoredIslandStepIndex(stepIndex);
  }, [ready, stepIndex]);

  useEffect(() => {
    const handlePageHide = () => {
      const sessionId = sessionIdRef.current ?? getStoredIslandSessionId();
      if (!sessionId) {
        return;
      }

      sessionIdRef.current = null;
      clearStoredIslandProgress();
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
        const nextFailureCount = actionResult.failureCount ?? stepFailureCount + 1;
        setStepFailureCount(nextFailureCount);

        const hintToShow =
          actionResult.hint ??
          (nextFailureCount >= ISLAND_HINT_AFTER_FAILURES
            ? getIslandHintForStep(stepIndex)
            : null);
        if (hintToShow) {
          revealStepHint(hintToShow);
        }

        setQueryError(actionResult.message);
        return;
      }

      setStepFailureCount(0);
      setStepHint(null);
      markStepComplete(actionResult);
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo ejecutar la consulta.');
      registerStepFailure();
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
  }, [
    appendHistory,
    markStepComplete,
    registerStepFailure,
    requireSessionId,
    revealStepHint,
    sql,
    stepFailureCount,
    stepIndex,
  ]);

  const handleContinue = useCallback(async () => {
    if (pendingFollowUp) {
      const next = pendingNextStep ?? stepIndex + 1;
      setPendingFollowUp(null);
      setPendingNextStep(null);
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
        const statements = Array.isArray(actionResult.demoSql)
          ? actionResult.demoSql
          : [actionResult.demoSql];
        statements.forEach((sql, index) => {
          const isLast = index === statements.length - 1;
          appendHistory({
            sql,
            columns: isLast ? actionResult.columns : [],
            rows: isLast ? actionResult.rows : [],
            message:
              isLast && actionResult.rows.length > 0
                ? undefined
                : actionResult.message,
            feedback: 'Acción automática completada',
            success: true,
          });
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
  const showSqlConsole =
    !gameComplete && !showContinueOnly && (!ISLAND_STEP_PRE_SQL_DIALOGUE[stepIndex] || preSqlDialogueDone);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden">
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
          <div className="grid h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)] min-h-0 flex-1 grid-rows-[minmax(0,36%)_minmax(0,1fr)] gap-2 overflow-hidden lg:grid-cols-[minmax(200px,26%)_1fr] lg:grid-rows-1">
            {/* —— Columna izquierda: órdenes / historia —— */}
            <aside className="flex min-h-0 flex-col gap-2 overflow-hidden lg:h-full">
              <div className="min-h-0 flex-1 overflow-hidden">
                <IslandChatPanel
                  className="h-full"
                missionLabel={
                  gameComplete
                    ? 'Fin del juego'
                    : `Misión ${currentMission.id} · Paso ${stepIndex + 1}/${ISLAND_TOTAL_STEPS}`
                }
                messages={chatMessages}
                footer={
                  !gameComplete && showContinueOnly ? (
                    <button
                      type="button"
                      onClick={() => void handleContinue()}
                      disabled={executing}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-60"
                    >
                      {executing ? 'Avanzando…' : 'Continuar →'}
                    </button>
                  ) : undefined
                }
                />
              </div>

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

            {/* —— Columna derecha: resultados + consola —— */}
            {!gameComplete ? (
              <main className="flex min-h-0 h-full flex-col gap-2 overflow-hidden">
                {/* Panel de resultados */}
                <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
                  <header className="shrink-0 border-b border-slate-200 bg-slate-100/90 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/90">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Resultados
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500">
                      Historial de consultas y tablas devueltas
                    </p>
                  </header>
                  <div
                    ref={queryLogRef}
                    className="min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-slate-50/50 p-4 dark:bg-slate-950/40"
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
                </section>

                {/* Panel consola SQL */}
                {!showSqlConsole && !showContinueOnly && ISLAND_STEP_PRE_SQL_DIALOGUE[stepIndex] ? (
                  <section className="shrink-0 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-center text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                    Ernesto está respondiendo…
                  </section>
                ) : !showSqlConsole ? (
                  <section className="shrink-0 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-center text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                    Pulsa <strong>Continuar</strong> en el panel izquierdo para avanzar
                  </section>
                ) : (
                  <section className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-teal-200/80 bg-slate-900 shadow-md shadow-teal-900/10 dark:border-teal-800/50 dark:bg-slate-950">
                    <header className="shrink-0 border-b border-teal-800/40 bg-gradient-to-r from-slate-900 to-slate-800 px-3 py-2 dark:from-slate-950 dark:to-slate-900">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {sqlTask ? (
                            <p className="text-xs font-medium leading-snug">
                              <span className="font-bold uppercase tracking-wide text-red-400 dark:text-red-400">
                                Orden:
                              </span>{' '}
                              <span className="text-teal-300/90">{sqlTask.instruction}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400">escribe y ejecuta aquí</p>
                          )}
                        </div>
                        {sqlTask ? (
                          <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-300/90">
                            {sqlTask.kind}
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] text-slate-500">Shift + Enter</span>
                        )}
                      </div>
                      {stepHint ? (
                        <p className="mt-2 rounded-lg border border-cyan-700/50 bg-cyan-950/40 px-2.5 py-2 text-xs leading-relaxed text-cyan-100">
                          <span className="font-bold">Pista: </span>
                          {stepHint}
                        </p>
                      ) : null}
                    </header>

                    <textarea
                      value={sql}
                      onChange={(event) => setSql(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && event.shiftKey) {
                          event.preventDefault();
                          void handleExecute();
                        }
                      }}
                      rows={3}
                      spellCheck={false}
                      placeholder={sqlPlaceholder}
                      className="w-full resize-none bg-slate-900 px-4 py-3 font-mono text-sm leading-relaxed text-emerald-100 outline-none placeholder:text-slate-600 dark:bg-slate-950"
                    />

                    <div className="flex items-center justify-between gap-2 border-t border-teal-900/40 bg-slate-800/80 px-3 py-2 dark:bg-slate-900/90">
                      <div className="min-w-0 flex-1">
                        {queryError ? (
                          <p className="truncate text-xs text-rose-400" title={queryError}>
                            {queryError}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Ejecuta para validar el paso
                            <span className="ml-2 text-[10px] text-slate-500">· Shift + Enter</span>
                          </span>
                        )}
                        {stepFailureCount > 0 && !stepHint && attemptsUntilHint > 0 ? (
                          <p className="mt-0.5 text-[11px] text-amber-400">
                            Pista disponible en {attemptsUntilHint}{' '}
                            {attemptsUntilHint === 1 ? 'intento' : 'intentos'} más.
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleExecute()}
                        disabled={executing}
                        className="shrink-0 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-teal-500 disabled:opacity-60 dark:from-cyan-500 dark:to-teal-500"
                      >
                        {executing ? 'Ejecutando…' : 'Ejecutar'}
                      </button>
                    </div>
                  </section>
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
      ) : (
        <IslandGameBootstrapState error={queryError} />
      )}
    </div>
  );
}
