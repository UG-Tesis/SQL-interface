import { useCallback, useMemo, useState } from 'react';

type DdlCmd = 'CREATE' | 'ALTER' | 'DROP' | 'TRUNCATE';

type ScenarioCard = {
  id: string;
  situation: string;
  cmd: DdlCmd;
};

const SCENARIOS: ScenarioCard[] = [
  {
    id: 'sc1',
    cmd: 'CREATE',
    situation:
      'Debes definir por primera vez la tabla producto (columnas, tipos y clave primaria) dentro del esquema que ya existe.',
  },
  {
    id: 'sc2',
    cmd: 'ALTER',
    situation:
      'La tabla cliente ya está en producción con datos; solo necesitas añadir una columna opcional ciudad sin recrear la tabla.',
  },
  {
    id: 'sc3',
    cmd: 'DROP',
    situation:
      'El índice idx_temporal_nunca_usado solo ocupa espacio y quieres quitarlo del catálogo sin tocar las filas.',
  },
  {
    id: 'sc4',
    cmd: 'TRUNCATE',
    situation:
      'Tienes una tabla staging_import que debe quedar vacía para la siguiente corrida ETL, pero conservando columnas e índices.',
  },
];

function shuffleInPlace<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CMD_LABEL: Record<DdlCmd, string> = {
  CREATE: 'CREATE',
  ALTER: 'ALTER',
  DROP: 'DROP',
  TRUNCATE: 'TRUNCATE',
};

const CMD_HINT: Record<DdlCmd, string> = {
  CREATE: 'Definir objeto nuevo',
  ALTER: 'Cambiar estructura existente',
  DROP: 'Eliminar objeto del catálogo',
  TRUNCATE: 'Vaciar filas, mantener tabla',
};

function cmdButtonClass(cmd: DdlCmd, active: boolean, matched: boolean, wrong: boolean): string {
  if (matched) {
    return 'border-2 border-emerald-500 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-900 opacity-90 cursor-default shadow-inner shadow-emerald-500/20 ring-2 ring-emerald-400/40';
  }
  const base =
    'border-2 font-mono text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0';
  if (wrong) {
    return `${base} border-rose-500 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-900 shadow-rose-500/25 animate-[shake_0.35s_ease-in-out]`;
  }
  if (active) {
    return `${base} scale-[1.03] border-indigo-500 bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 text-indigo-950 shadow-xl shadow-indigo-500/35 ring-2 ring-indigo-400/60`;
  }
  switch (cmd) {
    case 'CREATE':
      return `${base} border-indigo-400/80 bg-gradient-to-br from-white to-indigo-50/90 text-indigo-900 shadow-md shadow-indigo-500/10 hover:border-indigo-500 hover:shadow-indigo-500/25`;
    case 'ALTER':
      return `${base} border-violet-400/80 bg-gradient-to-br from-white to-violet-50/90 text-violet-900 shadow-md shadow-violet-500/10 hover:border-violet-500 hover:shadow-violet-500/25`;
    case 'DROP':
      return `${base} border-rose-400/80 bg-gradient-to-br from-white to-rose-50/90 text-rose-900 shadow-md shadow-rose-500/10 hover:border-rose-500 hover:shadow-rose-500/25`;
    case 'TRUNCATE':
      return `${base} border-amber-400/80 bg-gradient-to-br from-white to-amber-50/90 text-amber-950 shadow-md shadow-amber-500/10 hover:border-amber-500 hover:shadow-amber-500/25`;
    default:
      return base;
  }
}

export function DdlMatchGame() {
  const [leftOrder, setLeftOrder] = useState<ScenarioCard[]>(() => shuffleInPlace(SCENARIOS));
  const [rightOrder, setRightOrder] = useState<DdlCmd[]>(() =>
    shuffleInPlace(['CREATE', 'ALTER', 'DROP', 'TRUNCATE'] as DdlCmd[]),
  );
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());
  const [matchedCmds, setMatchedCmds] = useState<Set<DdlCmd>>(() => new Set());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedCmd, setSelectedCmd] = useState<DdlCmd | null>(null);
  const [wrongCmd, setWrongCmd] = useState<DdlCmd | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);

  const pairsDone = matchedIds.size;

  const reset = useCallback(() => {
    setLeftOrder(shuffleInPlace(SCENARIOS));
    setRightOrder(shuffleInPlace(['CREATE', 'ALTER', 'DROP', 'TRUNCATE'] as DdlCmd[]));
    setMatchedIds(new Set());
    setMatchedCmds(new Set());
    setSelectedScenarioId(null);
    setSelectedCmd(null);
    setWrongCmd(null);
    setAttempts(0);
    setCompleted(false);
  }, []);

  const tryPair = useCallback((scenarioId: string, expectedCmd: DdlCmd, cmd: DdlCmd) => {
    setAttempts((a) => a + 1);
    if (expectedCmd === cmd) {
      setMatchedIds((prev) => {
        const next = new Set(prev).add(scenarioId);
        if (next.size >= SCENARIOS.length) {
          queueMicrotask(() => setCompleted(true));
        }
        return next;
      });
      setMatchedCmds((prev) => new Set(prev).add(cmd));
      setSelectedScenarioId(null);
      setSelectedCmd(null);
      setWrongCmd(null);
    } else {
      setWrongCmd(cmd);
      setSelectedScenarioId(null);
      setSelectedCmd(null);
      window.setTimeout(() => setWrongCmd(null), 450);
    }
  }, []);

  const onPickScenario = useCallback(
    (s: ScenarioCard) => {
      if (matchedIds.has(s.id) || completed) return;
      setWrongCmd(null);
      if (selectedScenarioId === s.id) {
        setSelectedScenarioId(null);
        return;
      }
      if (selectedCmd !== null) {
        tryPair(s.id, s.cmd, selectedCmd);
        return;
      }
      setSelectedScenarioId(s.id);
    },
    [matchedIds, completed, selectedScenarioId, selectedCmd, tryPair],
  );

  const onPickCmd = useCallback(
    (cmd: DdlCmd) => {
      if (matchedCmds.has(cmd) || completed) return;
      setWrongCmd(null);
      if (selectedCmd === cmd) {
        setSelectedCmd(null);
        return;
      }
      setSelectedCmd(cmd);
      if (selectedScenarioId !== null) {
        const sc = SCENARIOS.find((x) => x.id === selectedScenarioId);
        if (sc) tryPair(sc.id, sc.cmd, cmd);
      }
    },
    [matchedCmds, completed, selectedCmd, selectedScenarioId, tryPair],
  );

  const shakeKeyframes = useMemo(
    () => (
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    ),
    [],
  );

  if (completed) {
    const ideal = SCENARIOS.length;
    const efficiency = attempts <= ideal ? 'perfecta' : attempts <= ideal + 2 ? 'muy buena' : 'mejorable';

    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-400/50 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 shadow-[0_0_60px_-12px_rgba(129,140,248,0.55)] sm:p-10">
        {shakeKeyframes}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" aria-hidden />
        <div className="relative text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/40 to-violet-600/40 text-3xl shadow-lg shadow-indigo-500/30 backdrop-blur-sm" aria-hidden>
            🔗
          </span>
          <h3 className="mt-5 bg-gradient-to-r from-indigo-200 via-white to-fuchsia-200 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
            ¡Tablero completado!
          </h3>
          <p className="mt-2 text-sm font-medium text-indigo-200/95">Emparejamiento DDL sin errores de concepto</p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-widest text-indigo-300/80">Intentos totales</p>
            <p className="mt-1 font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
              {attempts}
              <span className="text-lg font-semibold text-indigo-300/70"> / mín. {ideal}</span>
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Eficiencia: <span className="font-semibold text-violet-300">{efficiency}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 bg-[length:200%_100%] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_40px_-8px_rgba(139,92,246,0.55)] transition-[background-position,transform] duration-300 hover:bg-right hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
          >
            Mezclar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-400/45 bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/15 to-violet-600/20 p-[2px] shadow-[0_24px_60px_-12px_rgba(99,102,241,0.35)]">
      {shakeKeyframes}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(129,140,248,0.2),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />

      <div className="relative rounded-[14px] bg-white/92 p-5 backdrop-blur-md sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-gradient-to-r from-indigo-500/12 to-violet-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
              Modo emparejar
            </span>
            <h3 className="bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-700 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
              Reto: emparejamiento DDL
            </h3>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Enlaza cada <strong className="text-indigo-900">situación</strong> con su{' '}
              <strong className="text-violet-900">verbo DDL</strong>. Puedes elegir primero la tarjeta o el comando.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-2.5 text-white shadow-lg shadow-slate-900/30">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pares</span>
              <span className="font-mono text-xl font-bold tabular-nums text-indigo-300">
                {pairsDone}
                <span className="text-slate-500">/</span>
                {SCENARIOS.length}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-300/70 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 shadow-md shadow-amber-500/20">
              <span className="text-base" aria-hidden>
                ⚡
              </span>
              <span className="text-xs font-bold text-amber-950">
                Intentos: <span className="font-mono text-base">{attempts}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/90 via-cyan-50/40 to-violet-50/80 p-1 shadow-inner">
          <div className="rounded-lg border border-white/60 bg-white/70 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-semibold leading-relaxed text-indigo-950 sm:text-xs">
              <span className="mr-1.5 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Cómo jugar
              </span>
              Pulsa una situación y el comando que encaje (o al revés). Acierto → par en verde. Fallo → el comando tiembla;
              ¡sigue intentando!
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent" aria-hidden />
              Situaciones
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent" aria-hidden />
            </p>
            <ul className="flex flex-col gap-3">
              {leftOrder.map((s, idx) => {
                const matched = matchedIds.has(s.id);
                const active = selectedScenarioId === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={matched}
                      onClick={() => onPickScenario(s)}
                      className={`group relative w-full overflow-hidden rounded-xl border-2 p-4 text-left text-sm leading-relaxed transition-all duration-200 disabled:cursor-default ${
                        matched
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 shadow-md shadow-emerald-500/15'
                          : active
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-400/50'
                            : 'border-slate-200/90 bg-white shadow-md shadow-slate-200/40 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/15'
                      }`}
                    >
                      <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            matched
                              ? 'bg-emerald-600 text-white'
                              : active
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-800'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Caso</span>
                          <p className="mt-1 text-slate-800">{s.situation}</p>
                          {matched ? (
                            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <span className="text-emerald-600">✓</span> Emparejado con {s.cmd}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-300 to-transparent" aria-hidden />
              Comandos DDL
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-300 to-transparent" aria-hidden />
            </p>
            <ul className="flex flex-col gap-3">
              {rightOrder.map((cmd) => {
                const matched = matchedCmds.has(cmd);
                const active = selectedCmd === cmd;
                const wrong = wrongCmd === cmd;
                return (
                  <li key={cmd}>
                    <button
                      type="button"
                      disabled={matched}
                      onClick={() => onPickCmd(cmd)}
                      className={`flex min-h-[5rem] w-full flex-col items-center justify-center rounded-xl px-3 py-3 ${cmdButtonClass(cmd, active, matched, wrong)}`}
                    >
                      <span className="text-base tracking-wide">{CMD_LABEL[cmd]}</span>
                      <span className="mt-1 text-center text-[10px] font-medium normal-case opacity-90">
                        {CMD_HINT[cmd]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[11px] leading-relaxed text-slate-600">
            <span className="font-bold text-indigo-700">Tip:</span>{' '}
            <span className="rounded bg-slate-100 px-1 font-mono text-[10px] text-rose-800">DROP</span> quita el
            objeto del catálogo;{' '}
            <span className="rounded bg-slate-100 px-1 font-mono text-[10px] text-amber-900">TRUNCATE</span> vacía la
            tabla y conserva la definición.
          </p>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-xl border-2 border-slate-300 bg-gradient-to-b from-white to-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-md transition hover:border-indigo-300 hover:shadow-indigo-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-[0.98]"
          >
            Reiniciar tablero
          </button>
        </div>
      </div>
    </div>
  );
}
