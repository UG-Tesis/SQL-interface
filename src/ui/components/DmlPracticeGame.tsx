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
    title: 'Registrar clientes nuevos',
    scenario:
      'En la tabla cliente debes agregar tres personas que aún no están en la base de datos: Ana Ruiz, Luis Paz y Sofía Núñez, con su nombre y correo. Es el mismo tipo de caso que practicaste con INSERT en la lección.',
    question: '¿Qué sentencia INSERT es la más adecuada según lo visto en el curso?',
    options: [
      {
        id: 'r1a',
        summary: 'Un INSERT con varias filas',
        sql: `INSERT INTO cliente (nombre, email) VALUES
  ('Ana Ruiz', 'ana@ejemplo.com'),
  ('Luis Paz', 'luis@ejemplo.com'),
  ('Sofía Núñez', 'sofia@ejemplo.com');`,
        correct: true,
        feedback:
          'Correcto: en la lección vimos que puedes insertar varias filas en una sola sentencia, listando columnas y valores en el mismo orden.',
      },
      {
        id: 'r1b',
        summary: 'Tres INSERT por separado',
        sql: `INSERT INTO cliente (nombre, email) VALUES ('Ana Ruiz', 'ana@ejemplo.com');
INSERT INTO cliente (nombre, email) VALUES ('Luis Paz', 'luis@ejemplo.com');
INSERT INTO cliente (nombre, email) VALUES ('Sofía Núñez', 'sofia@ejemplo.com');`,
        correct: false,
        feedback:
          'También insertaría los datos, pero son tres sentencias en lugar de una. El curso muestra el INSERT con varias filas como forma más práctica para este caso.',
      },
      {
        id: 'r1c',
        summary: 'UPDATE en lugar de INSERT',
        sql: `UPDATE cliente
SET nombre = 'Ana Ruiz', email = 'ana@ejemplo.com'
WHERE id_cliente IS NULL;`,
        correct: false,
        feedback:
          'UPDATE modifica filas que ya existen. Para clientes nuevos debes usar INSERT, como en los ejemplos de la lección.',
      },
      {
        id: 'r1d',
        summary: 'DELETE antes de insertar',
        sql: `DELETE FROM cliente WHERE email LIKE '%ejemplo%';
INSERT INTO cliente (nombre, email) VALUES (...);`,
        correct: false,
        feedback:
          'No hace falta borrar datos para dar de alta clientes nuevos. INSERT es el comando correcto para agregar registros.',
      },
    ],
  },
  {
    id: 'r2',
    tag: 'UPDATE',
    title: 'Corregir el correo de un cliente',
    scenario:
      'El cliente con id_cliente = 2 tiene un email antiguo. Debes cambiarlo a nuevo@ejemplo.com. Solo esa fila debe modificarse; el resto de la tabla no debe cambiar.',
    question: '¿Cuál sentencia UPDATE encaja con lo explicado en el curso?',
    options: [
      {
        id: 'r2a',
        summary: 'UPDATE con WHERE por id',
        sql: `UPDATE cliente
SET email = 'nuevo@ejemplo.com'
WHERE id_cliente = 2;`,
        correct: true,
        feedback:
          'Correcto: UPDATE cambia columnas con SET y acotas la fila con WHERE id_cliente = ..., igual que en el ejemplo de la lección.',
      },
      {
        id: 'r2b',
        summary: 'UPDATE sin WHERE',
        sql: `UPDATE cliente
SET email = 'nuevo@ejemplo.com';`,
        correct: false,
        feedback:
          'Sin WHERE cambiarías el email de todos los clientes. Siempre debes indicar qué fila modificar, normalmente con su id.',
      },
      {
        id: 'r2c',
        summary: 'DELETE y volver a insertar',
        sql: `DELETE FROM cliente WHERE id_cliente = 2;
INSERT INTO cliente (nombre, email) VALUES ('Cliente', 'nuevo@ejemplo.com');`,
        correct: false,
        feedback:
          'No es necesario borrar y crear de nuevo. Para corregir un dato existente se usa UPDATE.',
      },
      {
        id: 'r2d',
        summary: 'INSERT de otro cliente',
        sql: `INSERT INTO cliente (nombre, email)
VALUES ('Cliente', 'nuevo@ejemplo.com');`,
        correct: false,
        feedback:
          'INSERT agrega una fila nueva; no corrige la del cliente 2. Para modificar datos existentes usa UPDATE.',
      },
    ],
  },
  {
    id: 'r3',
    tag: 'DELETE',
    title: 'Eliminar un registro',
    scenario:
      'Debes quitar de la tabla cliente al registro con id_cliente = 99. Es el mismo tipo de ejercicio que el ejemplo DELETE de la lección.',
    question: '¿Qué sentencia elimina solo ese cliente?',
    options: [
      {
        id: 'r3a',
        summary: 'DELETE con WHERE por id',
        sql: `DELETE FROM cliente
WHERE id_cliente = 99;`,
        correct: true,
        feedback:
          'Correcto: DELETE FROM tabla WHERE condición elimina solo las filas que cumplen la condición, como en el ejemplo del curso.',
      },
      {
        id: 'r3b',
        summary: 'DELETE sin WHERE',
        sql: `DELETE FROM cliente;`,
        correct: false,
        feedback:
          'Sin WHERE se borrarían todas las filas de la tabla. La lección advierte que esto es un riesgo alto.',
      },
      {
        id: 'r3c',
        summary: 'UPDATE poniendo NULL',
        sql: `UPDATE cliente
SET nombre = NULL, email = NULL
WHERE id_cliente = 99;`,
        correct: false,
        feedback:
          'Eso vacía columnas, pero la fila sigue en la tabla. Si el objetivo es eliminar el registro, usa DELETE.',
      },
      {
        id: 'r3d',
        summary: 'DROP TABLE',
        sql: `DROP TABLE cliente;`,
        correct: false,
        feedback:
          'DROP es DDL (módulo 1): elimina la tabla entera, no una fila. Para borrar registros se usa DELETE.',
      },
    ],
  },
  {
    id: 'r4',
    tag: 'MIXTO',
    title: '¿Cuál es la más peligrosa?',
    scenario:
      'Revisa estas tres sentencias sobre la tabla cliente. Una de ellas puede borrar todos los registros si la ejecutas por error.',
    question: '¿Cuál es la más riesgosa?',
    options: [
      {
        id: 'r4a',
        summary: 'DELETE sin WHERE',
        sql: `DELETE FROM cliente;`,
        correct: true,
        feedback:
          'Correcto: sin WHERE se eliminan todas las filas. En la lección se marca como un error grave en DML.',
      },
      {
        id: 'r4b',
        summary: 'DELETE con WHERE por id',
        sql: `DELETE FROM cliente
WHERE id_cliente = 12;`,
        correct: false,
        feedback:
          'Solo afecta al cliente 12. El alcance está controlado gracias al WHERE.',
      },
      {
        id: 'r4c',
        summary: 'INSERT de una fila',
        sql: `INSERT INTO cliente (nombre, email)
VALUES ('Prueba', 'prueba@ejemplo.com');`,
        correct: false,
        feedback:
          'INSERT agrega datos; no borra los que ya existen.',
      },
      {
        id: 'r4d',
        summary: 'UPDATE con WHERE por id',
        sql: `UPDATE cliente
SET telefono = '0991111222'
WHERE id_cliente = 1;`,
        correct: false,
        feedback:
          'Con WHERE bien escrito solo cambias una fila. El gran riesgo en DML suele ser UPDATE o DELETE sin WHERE.',
      },
    ],
  },
  {
    id: 'r5',
    tag: 'UPDATE',
    title: 'Cambiar el teléfono de un cliente',
    scenario:
      'El cliente con id_cliente = 1 debe actualizar su teléfono a 0991111222. Los demás clientes no deben modificarse.',
    question: '¿Qué sentencia cumple la orden?',
    options: [
      {
        id: 'r5a',
        summary: 'UPDATE telefono con WHERE',
        sql: `UPDATE cliente
SET telefono = '0991111222'
WHERE id_cliente = 1;`,
        correct: true,
        feedback:
          'Correcto: es el mismo patrón del ejemplo de la lección — SET para la columna y WHERE para el id del registro.',
      },
      {
        id: 'r5b',
        summary: 'UPDATE sin WHERE',
        sql: `UPDATE cliente
SET telefono = '0991111222';`,
        correct: false,
        feedback:
          'Cambiarías el teléfono de todos los clientes. Debes filtrar con WHERE id_cliente = 1.',
      },
      {
        id: 'r5c',
        summary: 'INSERT de un cliente nuevo',
        sql: `INSERT INTO cliente (nombre, telefono)
VALUES ('Cliente 1', '0991111222');`,
        correct: false,
        feedback:
          'INSERT crea otro registro distinto; no actualiza al cliente que ya tiene id_cliente = 1.',
      },
      {
        id: 'r5d',
        summary: 'DELETE del cliente 1',
        sql: `DELETE FROM cliente
WHERE id_cliente = 1;`,
        correct: false,
        feedback:
          'DELETE elimina la fila. Aquí solo quieres cambiar el teléfono, no borrar al cliente.',
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
      return 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-600/40 ring-2 ring-white/30';
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
      pct >= 80 ? { emoji: '🏆', gradient: 'from-emerald-400 via-cyan-400 to-cyan-400' } : pct >= 50
        ? { emoji: '⚡', gradient: 'from-amber-400 via-orange-400 to-rose-400' }
        : { emoji: '📚', gradient: 'from-sky-400 via-cyan-400 to-cyan-600' };

    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-300/60 bg-gradient-to-br from-[#0a192f] via-[#0f172a] to-[#112240] p-8 shadow-[0_0_60px_-12px_rgba(8,145,178,0.45)] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden />
        <div className="relative text-center">
          <span className="text-5xl drop-shadow-lg sm:text-6xl" aria-hidden>
            {tier.emoji}
          </span>
          <h3 className="mt-4 bg-gradient-to-r from-white via-cyan-100 to-cyan-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            ¡Laboratorio completado!
          </h3>
          <p className="mt-2 text-sm font-medium text-cyan-200/90">Resultado del desafío DML</p>
          <div className="mx-auto mt-6 flex max-w-xs flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
            <span className={`bg-gradient-to-r ${tier.gradient} bg-clip-text text-5xl font-black tabular-nums text-transparent sm:text-6xl`}>
              {pct}%
            </span>
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-cyan-300">{score}</span> de {totalRounds} retos acertados
            </span>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-300">
            {pct >= 80
              ? 'Muy bien: reconoces cuándo usar INSERT, UPDATE o DELETE y la importancia del WHERE.'
              : pct >= 50
                ? 'Buen avance. Repasa los retos fallidos y vuelve a leer los ejemplos de la lección.'
                : 'Repasa la sección INSERT, UPDATE y DELETE de arriba y vuelve a intentar el laboratorio.'}
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-500 to-cyan-500 bg-[length:200%_100%] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-slate-950 shadow-[0_8px_30px_-6px_rgba(45,212,191,0.65)] transition-[background-position,transform] duration-300 hover:bg-right hover:shadow-[0_12px_40px_-8px_rgba(34,211,238,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]"
            >
              Volver a jugar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-50/95 via-white to-sky-50/80 p-[2px] shadow-[0_24px_60px_-12px_rgba(13,148,136,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.22),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" aria-hidden />

      <div className="relative rounded-[14px] bg-white/90 p-5 backdrop-blur-md sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/80 bg-gradient-to-r from-cyan-500/15 to-cyan-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              Modo interactivo
            </span>
            <h3 className="bg-gradient-to-r from-cyan-700 via-cyan-700 to-sky-700 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
              Laboratorio DML en contexto
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Cinco situaciones sencillas sobre la tabla <strong className="text-slate-800">cliente</strong>: elige la
              sentencia correcta de INSERT, UPDATE o DELETE, como en los ejemplos de arriba.
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

        <div className="relative mt-6 overflow-hidden rounded-xl border-2 border-slate-800/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-slate-100 shadow-xl shadow-slate-900/30">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 via-cyan-400 to-sky-500" aria-hidden />
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
              'border-2 border-slate-200/90 bg-white shadow-md shadow-slate-300/30 hover:-translate-y-1 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/20';
            if (showResult && opt.correct) {
              card =
                'border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-cyan-50 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50';
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
                className={`group relative flex flex-col rounded-xl p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-default ${card}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black ${
                      showResult && opt.correct
                        ? 'bg-emerald-600 text-white'
                        : isWrongPick
                          ? 'bg-rose-600 text-white'
                          : 'bg-gradient-to-br from-slate-800 to-slate-900 text-cyan-300 shadow-md group-hover:from-cyan-600 group-hover:to-cyan-700 group-hover:text-white'
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
              className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/40 transition hover:shadow-xl hover:shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 active:scale-[0.98] sm:ml-auto"
            >
              {roundIndex >= totalRounds - 1 ? '✨ Ver resultado' : 'Siguiente reto →'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
