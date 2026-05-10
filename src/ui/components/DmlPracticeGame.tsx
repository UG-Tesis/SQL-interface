import { useCallback, useState } from 'react';

type GameOption = {
  id: string;
  summary: string;
  sql: string;
  correct: boolean;
  feedback: string;
};

type GameRound = {
  id: string;
  tag: 'INSERT' | 'UPDATE' | 'DELETE' | 'MIXTO';
  title: string;
  scenario: string;
  question: string;
  options: GameOption[];
};

const ROUNDS: GameRound[] = [
  {
    id: 'r1',
    tag: 'INSERT',
    title: 'Carga de feria comercial',
    scenario:
      'La tienda capturó en papel a tres clientes nuevos durante una feria. Ya validaste que no existen en la base. Debes registrarlos en cliente con nombre y email, en el menor número de viajes al servidor y sin filas duplicadas por error de re-ejecución.',
    question: '¿Qué estrategia encaja mejor con buenas prácticas de DML?',
    options: [
      {
        id: 'r1a',
        summary: 'Un solo INSERT con varias tuplas',
        sql: `INSERT INTO cliente (nombre, email) VALUES
  ('Patricia Mora', 'patricia@ejemplo.com'),
  ('Diego Vera', 'diego@ejemplo.com'),
  ('Sofía Núñez', 'sofia@ejemplo.com');`,
        correct: true,
        feedback:
          'Correcto: un INSERT multi-fila es idiomático, atómico en una sentencia y reduce latencia. Si necesitaras idempotencia ante re-ejecución, podrías combinarlo con validaciones o claves únicas en email.',
      },
      {
        id: 'r1b',
        summary: 'Tres INSERT separados',
        sql: `INSERT INTO cliente (nombre, email) VALUES ('Patricia Mora', 'patricia@ejemplo.com');
INSERT INTO cliente (nombre, email) VALUES ('Diego Vera', 'diego@ejemplo.com');
INSERT INTO cliente (nombre, email) VALUES ('Sofía Núñez', 'sofia@ejemplo.com');`,
        correct: false,
        feedback:
          'Funciona, pero es más verboso y abre más ventana a errores parciales (dos filas sí, una no). Para un lote pequeño un solo INSERT suele ser más claro y eficiente.',
      },
      {
        id: 'r1c',
        summary: 'UPDATE sobre filas vacías',
        sql: `UPDATE cliente
SET nombre = 'Patricia Mora', email = 'patricia@ejemplo.com'
WHERE id_cliente IS NULL;`,
        correct: false,
        feedback:
          'UPDATE modifica filas existentes; no crea registros nuevos. Si no hay filas que cumplan el WHERE, no insertarás a los tres clientes.',
      },
      {
        id: 'r1d',
        summary: 'DELETE previo “por si acaso”',
        sql: `DELETE FROM cliente WHERE email LIKE '%feria%';
INSERT INTO cliente (nombre, email) VALUES (...);`,
        correct: false,
        feedback:
          'Mezclar DELETE con datos reales por convención de nombre es arriesgado: podrías borrar histórico legítimo. Para altas nuevas usa INSERT (y restricciones UNIQUE), no DELETE preventivo.',
      },
    ],
  },
  {
    id: 'r2',
    tag: 'UPDATE',
    title: 'Corrección quirúrgica',
    scenario:
      'Solo el cliente con id_cliente = 42 tiene un email mal tipeado: fino@gmial.com debe quedar fino@gmail.com. El resto de filas no debe cambiar.',
    question: 'Elige la sentencia adecuada.',
    options: [
      {
        id: 'r2a',
        summary: 'UPDATE acotado por clave',
        sql: `UPDATE cliente
SET email = 'fino@gmail.com'
WHERE id_cliente = 42;`,
        correct: true,
        feedback:
          'Correcto: UPDATE con WHERE por clave primaria limita el cambio a una fila. Antes de ejecutar en producción, un SELECT con el mismo WHERE confirma el alcance.',
      },
      {
        id: 'r2b',
        summary: 'UPDATE sin WHERE',
        sql: `UPDATE cliente
SET email = 'fino@gmail.com';`,
        correct: false,
        feedback:
          'Peligro: sin WHERE actualizas el email de todos los clientes al mismo valor, destruyendo datos.',
      },
      {
        id: 'r2c',
        summary: 'DELETE y volver a insertar',
        sql: `DELETE FROM cliente WHERE id_cliente = 42;
INSERT INTO cliente (nombre, email) VALUES ('Fino', 'fino@gmail.com');`,
        correct: false,
        feedback:
          'Pierdes el mismo id_cliente (AUTO_INCREMENT generará otro), rompes referencias si otras tablas apuntan al 42, y es más trabajo que un UPDATE puntual.',
      },
      {
        id: 'r2d',
        summary: 'INSERT duplicado',
        sql: `INSERT INTO cliente (nombre, email)
VALUES ('Fino', 'fino@gmail.com');`,
        correct: false,
        feedback:
          'INSERT añade otra fila; no corrige la fila 42. Además podrías violar UNIQUE en email si existe.',
      },
    ],
  },
  {
    id: 'r3',
    tag: 'DELETE',
    title: 'Baja por solicitud del titular',
    scenario:
      'Por política de privacidad debes eliminar por completo la fila del cliente id_cliente = 77 en la tabla cliente (no hay hijos referenciando en este ejercicio).',
    question: '¿Cuál es la opción correcta?',
    options: [
      {
        id: 'r3a',
        summary: 'DELETE filtrado',
        sql: `DELETE FROM cliente
WHERE id_cliente = 77;`,
        correct: true,
        feedback:
          'Correcto: DELETE con WHERE elimina solo las filas que cumplen la condición. Verifica antes con SELECT el mismo WHERE.',
      },
      {
        id: 'r3b',
        summary: 'Vaciar toda la tabla',
        sql: `DELETE FROM cliente;`,
        correct: false,
        feedback:
          'Sin WHERE borras todas las filas de cliente, no solo la 77. Es uno de los errores más graves en DML.',
      },
      {
        id: 'r3c',
        summary: 'UPDATE “lógico”',
        sql: `UPDATE cliente
SET nombre = NULL, email = NULL
WHERE id_cliente = 77;`,
        correct: false,
        feedback:
          'Eso anonimiza o anula columnas, pero la fila sigue existiendo. El enunciado pide eliminar la fila → DELETE.',
      },
      {
        id: 'r3d',
        summary: 'DROP de tabla',
        sql: `DROP TABLE cliente;`,
        correct: false,
        feedback:
          'DROP es DDL: elimina la tabla entera y su definición, no una fila. No corresponde al caso.',
      },
    ],
  },
  {
    id: 'r4',
    tag: 'MIXTO',
    title: 'Auditoría de riesgo',
    scenario:
      'Revisas el historial de consultas de un becario. Todas las sentencias compilan, pero una de ellas podría vaciar o corromper masivamente datos de cliente si se ejecutara en el esquema equivocado.',
    question: '¿Cuál es la más crítica en términos de alcance destructivo?',
    options: [
      {
        id: 'r4a',
        summary: 'DELETE sin filtro',
        sql: `DELETE FROM cliente;`,
        correct: true,
        feedback:
          'Correcto: sin WHERE se eliminan todas las filas de la tabla. En muchos entornos es irreversible sin backup.',
      },
      {
        id: 'r4b',
        summary: 'DELETE acotado',
        sql: `DELETE FROM cliente
WHERE id_cliente = 12;`,
        correct: false,
        feedback:
          'Es destructivo solo para las filas que cumplen la condición; el alcance está controlado si el WHERE es correcto.',
      },
      {
        id: 'r4c',
        summary: 'INSERT de una fila',
        sql: `INSERT INTO cliente (nombre, email)
VALUES ('Prueba', 'prueba@ejemplo.com');`,
        correct: false,
        feedback:
          'INSERT añade datos; no borra existentes. El riesgo es distinto (duplicados, constraints), no el vaciado masivo.',
      },
      {
        id: 'r4d',
        summary: 'UPDATE acotado',
        sql: `UPDATE cliente
SET telefono = '0990000000'
WHERE id_cliente = 12;`,
        correct: false,
        feedback:
          'Con WHERE bien definido el daño está acotado. El problema grave es UPDATE o DELETE sin WHERE.',
      },
    ],
  },
  {
    id: 'r5',
    tag: 'UPDATE',
    title: 'Normalización masiva controlada',
    scenario:
      'Marketing exige que todos los emails existentes en cliente queden en minúsculas y sin espacios al inicio/fin, para un envío de campaña. Hay miles de filas y solo deben cambiar las que tienen email no nulo.',
    question: '¿Qué planteamiento es el adecuado con DML?',
    options: [
      {
        id: 'r5a',
        summary: 'UPDATE con predicado y función',
        sql: `UPDATE cliente
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL;`,
        correct: true,
        feedback:
          'Correcto: UPDATE alcanza todas las filas que cumplen el predicado y aplica la transformación en bloque. Antes conviene SELECT COUNT(*) con el mismo WHERE para dimensionar el impacto.',
      },
      {
        id: 'r5b',
        summary: 'UPDATE sin WHERE',
        sql: `UPDATE cliente
SET email = LOWER(TRIM(email));`,
        correct: false,
        feedback:
          'Sin WHERE también tocas filas con email NULL (dependiendo del motor y función, puedes obtener NULL inesperados o escrituras innecesarias). Mejor acotar con email IS NOT NULL.',
      },
      {
        id: 'r5c',
        summary: 'INSERT de reemplazo masivo',
        sql: `INSERT INTO cliente (nombre, email)
SELECT nombre, LOWER(TRIM(email)) FROM cliente;`,
        correct: false,
        feedback:
          'Duplicarías filas o chocarías con restricciones; no es el patrón para “limpiar” columnas existentes. Para eso se usa UPDATE.',
      },
      {
        id: 'r5d',
        summary: 'DELETE de todos y recarga manual',
        sql: `DELETE FROM cliente;
-- volver a cargar datos a mano`,
        correct: false,
        feedback:
          'Eliminar todo para “normalizar” es inaceptable en un sistema real salvo proceso ETL muy controlado. El requisito se resuelve con UPDATE.',
      },
    ],
  },
];

/** Baraja una copia del array (Fisher–Yates). */
function shuffleInPlace<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Una copia de cada reto con el orden de opciones aleatorio. */
function buildShuffledRounds(): GameRound[] {
  return ROUNDS.map((r) => ({
    ...r,
    options: shuffleInPlace(r.options),
  }));
}

function tagStyles(tag: GameRound['tag']) {
  switch (tag) {
    case 'INSERT':
      return 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-600/40 ring-2 ring-white/30';
    case 'UPDATE':
      return 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-600/35 ring-2 ring-white/30';
    case 'DELETE':
      return 'bg-gradient-to-r from-rose-500 to-orange-600 text-white shadow-lg shadow-rose-600/35 ring-2 ring-white/30';
    default:
      return 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-lg shadow-slate-700/40 ring-2 ring-white/20';
  }
}

export function DmlPracticeGame() {
  const [gameRounds, setGameRounds] = useState<GameRound[]>(() => buildShuffledRounds());
  const [roundIndex, setRoundIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = gameRounds[roundIndex];
  const totalRounds = gameRounds.length;

  const reset = useCallback(() => {
    setGameRounds(buildShuffledRounds());
    setRoundIndex(0);
    setPickedId(null);
    setScore(0);
    setFinished(false);
  }, []);

  const pickOption = useCallback(
    (opt: GameOption) => {
      if (pickedId !== null || finished) return;
      setPickedId(opt.id);
      if (opt.correct) setScore((s) => s + 1);
    },
    [pickedId, finished],
  );

  const goNext = useCallback(() => {
    if (pickedId === null) return;
    if (roundIndex >= totalRounds - 1) {
      setFinished(true);
      return;
    }
    setRoundIndex((i) => i + 1);
    setPickedId(null);
  }, [pickedId, roundIndex, totalRounds]);

  if (finished) {
    const pct = Math.round((score / totalRounds) * 100);
    const tier =
      pct >= 80 ? { emoji: '🏆', gradient: 'from-emerald-400 via-teal-400 to-cyan-400' } : pct >= 50
        ? { emoji: '⚡', gradient: 'from-amber-400 via-orange-400 to-rose-400' }
        : { emoji: '📚', gradient: 'from-violet-400 via-fuchsia-400 to-pink-400' };

    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-teal-300/60 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-8 shadow-[0_0_60px_-12px_rgba(45,212,191,0.55)] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden />
        <div className="relative text-center">
          <span className="text-5xl drop-shadow-lg sm:text-6xl" aria-hidden>
            {tier.emoji}
          </span>
          <h3 className="mt-4 bg-gradient-to-r from-white via-teal-100 to-cyan-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            ¡Laboratorio completado!
          </h3>
          <p className="mt-2 text-sm font-medium text-teal-200/90">Resultado del desafío DML</p>
          <div className="mx-auto mt-6 flex max-w-xs flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
            <span className={`bg-gradient-to-r ${tier.gradient} bg-clip-text text-5xl font-black tabular-nums text-transparent sm:text-6xl`}>
              {pct}%
            </span>
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-teal-300">{score}</span> de {totalRounds} retos acertados
            </span>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-300">
            {pct >= 80
              ? 'Muy bien: demuestras criterio sobre cuándo insertar, cómo acotar UPDATE/DELETE y cómo detectar sentencias de alto riesgo.'
              : pct >= 50
                ? 'Buen avance. Repasa los retos fallidos: fíjate en el WHERE, en no usar DELETE/UPDATE “a lo ancho” y en elegir INSERT frente a UPDATE según el caso.'
                : 'Vale la pena releer la sección y repetir el laboratorio: el DML exige precisión en el alcance de cada sentencia.'}
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 bg-[length:200%_100%] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-slate-950 shadow-[0_8px_30px_-6px_rgba(45,212,191,0.65)] transition-[background-position,transform] duration-300 hover:bg-right hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
            >
              Volver a jugar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-teal-400/40 bg-gradient-to-br from-teal-50/95 via-white to-violet-50/80 p-[2px] shadow-[0_24px_60px_-12px_rgba(13,148,136,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.22),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" aria-hidden />

      <div className="relative rounded-[14px] bg-white/90 p-5 backdrop-blur-md sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-gradient-to-r from-teal-500/15 to-cyan-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              Modo interactivo
            </span>
            <h3 className="bg-gradient-to-r from-teal-700 via-cyan-700 to-violet-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
              Laboratorio DML en contexto
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Cinco situaciones reales: elige la sentencia que mejor encaja. Una respuesta válida por reto — demuestra
              que dominas INSERT, UPDATE y DELETE.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-900 px-4 py-2.5 text-white shadow-lg shadow-slate-900/25">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Reto</span>
              <span className="font-mono text-lg font-bold tabular-nums text-cyan-300">
                {roundIndex + 1}<span className="text-slate-500">/</span>{totalRounds}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-300/60 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 shadow-md shadow-amber-500/15">
              <span className="text-lg" aria-hidden>
                ⭐
              </span>
              <span className="text-xs font-semibold text-amber-900">
                Puntos: <span className="font-mono text-base text-amber-950">{score}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-full border border-slate-200/80 bg-slate-200/90 p-1 shadow-inner" aria-hidden>
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 shadow-[0_0_14px_rgba(34,211,238,0.55)] transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(100, ((roundIndex + (pickedId ? 0.35 : 0)) / totalRounds) * 100)}%` }}
          />
        </div>

        <div className="relative mt-6 overflow-hidden rounded-xl border-2 border-slate-800/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-slate-100 shadow-xl shadow-slate-900/30">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-400 via-cyan-400 to-violet-500" aria-hidden />
          <div className="pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${tagStyles(round.tag)}`}>
                {round.tag}
              </span>
              <h4 className="text-base font-bold text-white">{round.title}</h4>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{round.scenario}</p>
            <p className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100">
              {round.question}
            </p>
          </div>
        </div>

        <div
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          role="group"
          aria-label="Opciones de respuesta"
        >
          {round.options.map((opt, optIndex) => {
            const isPicked = pickedId === opt.id;
            const showResult = pickedId !== null;
            const isWrongPick = isPicked && !opt.correct;
            const letter = String.fromCharCode(65 + optIndex);

            let card =
              'border-2 border-slate-200/90 bg-white shadow-md shadow-slate-300/30 hover:-translate-y-1 hover:border-teal-400/70 hover:shadow-lg hover:shadow-teal-500/20';
            if (showResult && opt.correct) {
              card =
                'border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50';
            } else if (isWrongPick) {
              card =
                'border-2 border-rose-500 bg-gradient-to-br from-rose-50 to-orange-50 shadow-lg shadow-rose-500/25 ring-2 ring-rose-400/40';
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={pickedId !== null}
                onClick={() => pickOption(opt)}
                className={`group relative flex flex-col rounded-xl p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-default ${card}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black ${
                      showResult && opt.correct
                        ? 'bg-emerald-600 text-white'
                        : isWrongPick
                          ? 'bg-rose-600 text-white'
                          : 'bg-gradient-to-br from-slate-800 to-slate-900 text-teal-300 shadow-md group-hover:from-teal-600 group-hover:to-cyan-700 group-hover:text-white'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="pt-1 text-sm font-bold text-slate-800">{opt.summary}</span>
                </div>
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-slate-800/90 bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-emerald-100/95 shadow-inner sm:text-[11px]">
                  <code>{opt.sql}</code>
                </pre>
                {showResult && (isPicked || opt.correct) ? (
                  <span
                    className={`mt-3 rounded-lg px-2 py-1.5 text-xs font-medium leading-relaxed ${
                      opt.correct ? 'bg-emerald-100/90 text-emerald-900' : isPicked ? 'bg-rose-100/90 text-rose-900' : 'text-slate-600'
                    }`}
                    aria-live="polite"
                  >
                    {opt.feedback}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          {pickedId === null ? (
            <p className="text-center text-xs font-medium text-slate-500 sm:text-left">
              👆 Elige la opción que encaje con el escenario.
            </p>
          ) : (
            <span className="hidden text-xs text-slate-500 sm:inline" />
          )}
          {pickedId !== null ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/40 transition hover:shadow-xl hover:shadow-teal-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 active:scale-[0.98] sm:ml-auto"
            >
              {roundIndex >= totalRounds - 1 ? '✨ Ver resultado' : 'Siguiente reto →'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
