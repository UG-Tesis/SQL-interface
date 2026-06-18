import { useCallback, useState } from 'react';

type MissionOption = {
  id: string;
  label: string;
  fragment: string;
  correct: boolean;
  feedback: string;
};

type MissionRound = {
  id: string;
  tag: 'ORDER BY' | 'GROUP BY' | 'LIMIT' | 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN';
  title: string;
  mission: string;
  queryBefore: string;
  queryAfter: string;
  placeholder: string;
  options: MissionOption[];
};

const ROUNDS: MissionRound[] = [
  {
    id: 'm1',
    tag: 'ORDER BY',
    title: 'Del más barato al más caro',
    mission:
      'La tienda quiere ver los productos ordenados por precio, empezando por el más económico. ¿Qué cláusula va al final de la consulta?',
    queryBefore: 'SELECT nombre, precio\nFROM producto',
    queryAfter: ';',
    placeholder: '???',
    options: [
      {
        id: 'm1a',
        label: 'Orden ascendente',
        fragment: 'ORDER BY precio ASC',
        correct: true,
        feedback:
          'Correcto: ORDER BY precio ASC ordena de menor a mayor, como en el ejemplo de la lección.',
      },
      {
        id: 'm1b',
        label: 'Orden descendente',
        fragment: 'ORDER BY precio DESC',
        correct: false,
        feedback: 'DESC muestra primero los más caros. Aquí necesitas ASC (de menor a mayor).',
      },
      {
        id: 'm1c',
        label: 'Agrupar por precio',
        fragment: 'GROUP BY precio',
        correct: false,
        feedback: 'GROUP BY agrupa filas para contar o resumir; no ordena un listado de productos.',
      },
      {
        id: 'm1d',
        label: 'Solo tres filas',
        fragment: 'LIMIT 3',
        correct: false,
        feedback: 'LIMIT acota cuántas filas devuelves, pero no define el orden de los precios.',
      },
    ],
  },
  {
    id: 'm2',
    tag: 'LIMIT',
    title: 'Los 3 productos más caros',
    mission:
      'Necesitas el nombre y precio de los tres artículos con mayor precio. Debes ordenar y limitar el resultado.',
    queryBefore: 'SELECT nombre, precio\nFROM producto',
    queryAfter: ';',
    placeholder: '???',
    options: [
      {
        id: 'm2a',
        label: 'Descendente + límite',
        fragment: 'ORDER BY precio DESC\nLIMIT 3',
        correct: true,
        feedback:
          'Correcto: primero ORDER BY precio DESC (mayor a menor) y luego LIMIT 3, igual que en el curso.',
      },
      {
        id: 'm2b',
        label: 'Solo LIMIT',
        fragment: 'LIMIT 3',
        correct: false,
        feedback: 'LIMIT 3 sin ORDER BY devuelve tres filas cualesquiera, no necesariamente las más caras.',
      },
      {
        id: 'm2c',
        label: 'Ascendente + límite',
        fragment: 'ORDER BY precio ASC\nLIMIT 3',
        correct: false,
        feedback: 'ASC mostraría los tres más baratos, no los más caros.',
      },
      {
        id: 'm2d',
        label: 'Contar productos',
        fragment: 'SELECT COUNT(*)\nFROM producto',
        correct: false,
        feedback: 'COUNT(*) devuelve un solo número total, no el listado de los tres productos.',
      },
    ],
  },
  {
    id: 'm3',
    tag: 'GROUP BY',
    title: 'Productos por cada precio',
    mission:
      'Quieres saber cuántos productos comparten el mismo precio. La consulta ya trae precio y COUNT(*); ¿qué falta?',
    queryBefore: 'SELECT precio, COUNT(*)\nFROM producto',
    queryAfter: ';',
    placeholder: '???',
    options: [
      {
        id: 'm3a',
        label: 'Agrupar por precio',
        fragment: 'GROUP BY precio',
        correct: true,
        feedback:
          'Correcto: GROUP BY precio une filas con el mismo precio y COUNT(*) cuenta cuántas hay en cada grupo.',
      },
      {
        id: 'm3b',
        label: 'Ordenar por precio',
        fragment: 'ORDER BY precio',
        correct: false,
        feedback: 'ORDER BY solo ordena filas; no agrupa ni cuenta por precio.',
      },
      {
        id: 'm3c',
        label: 'Filtrar precios altos',
        fragment: 'WHERE precio > 10',
        correct: false,
        feedback: 'WHERE filtra antes de agrupar; aquí necesitas GROUP BY para contar por precio.',
      },
      {
        id: 'm3d',
        label: 'Sumar precios',
        fragment: 'SELECT SUM(precio)',
        correct: false,
        feedback: 'SUM da un total general, no cuántos productos hay por cada precio.',
      },
    ],
  },
  {
    id: 'm4',
    tag: 'COUNT',
    title: '¿Cuántos productos hay?',
    mission: 'El inventario pide saber el número total de filas en la tabla producto. ¿Qué expresión va en el SELECT?',
    queryBefore: 'SELECT',
    queryAfter: 'FROM producto;',
    placeholder: '???',
    options: [
      {
        id: 'm4a',
        label: 'Contar todas las filas',
        fragment: 'COUNT(*)',
        correct: true,
        feedback: 'Correcto: COUNT(*) cuenta todas las filas de la consulta, como en el ejemplo del módulo.',
      },
      {
        id: 'm4b',
        label: 'Sumar precios',
        fragment: 'SUM(precio)',
        correct: false,
        feedback: 'SUM suma valores numéricos; no cuenta cuántos productos existen.',
      },
      {
        id: 'm4c',
        label: 'Precio promedio',
        fragment: 'AVG(precio)',
        correct: false,
        feedback: 'AVG calcula un promedio, no la cantidad de productos.',
      },
      {
        id: 'm4d',
        label: 'Precio máximo',
        fragment: 'MAX(precio)',
        correct: false,
        feedback: 'MAX devuelve el precio más alto, no el total de registros.',
      },
    ],
  },
  {
    id: 'm5',
    tag: 'AVG',
    title: 'Precio promedio del catálogo',
    mission: 'Marketing necesita el precio medio de todos los productos. ¿Qué función usas en el SELECT?',
    queryBefore: 'SELECT',
    queryAfter: 'FROM producto;',
    placeholder: '???',
    options: [
      {
        id: 'm5a',
        label: 'Promedio',
        fragment: 'AVG(precio)',
        correct: true,
        feedback: 'Correcto: AVG(precio) calcula el promedio de los precios registrados.',
      },
      {
        id: 'm5b',
        label: 'Suma total',
        fragment: 'SUM(precio)',
        correct: false,
        feedback: 'SUM suma todos los precios, pero no divide entre la cantidad para obtener el promedio.',
      },
      {
        id: 'm5c',
        label: 'Contar filas',
        fragment: 'COUNT(precio)',
        correct: false,
        feedback: 'COUNT cuenta filas con precio no nulo, no calcula la media.',
      },
      {
        id: 'm5d',
        label: 'Ordenar resultados',
        fragment: 'nombre, precio\nFROM producto\nORDER BY precio',
        correct: false,
        feedback: 'ORDER BY ordena filas; para un promedio necesitas AVG en el SELECT.',
      },
    ],
  },
  {
    id: 'm6',
    tag: 'MAX',
    title: '¿Cuál es el precio más alto?',
    mission: 'Quieres un solo valor: el precio máximo registrado en producto. Elige la expresión correcta.',
    queryBefore: 'SELECT',
    queryAfter: 'FROM producto;',
    placeholder: '???',
    options: [
      {
        id: 'm6a',
        label: 'Valor máximo',
        fragment: 'MAX(precio)',
        correct: true,
        feedback: 'Correcto: MAX(precio) devuelve el precio más alto de la tabla.',
      },
      {
        id: 'm6b',
        label: 'Valor mínimo',
        fragment: 'MIN(precio)',
        correct: false,
        feedback: 'MIN devuelve el precio más bajo, no el más alto.',
      },
      {
        id: 'm6c',
        label: 'Tres precios altos',
        fragment: 'precio\nFROM producto\nORDER BY precio DESC\nLIMIT 3',
        correct: false,
        feedback: 'Eso lista tres filas; el enunciado pide un único valor máximo con MAX.',
      },
      {
        id: 'm6d',
        label: 'Suma de precios',
        fragment: 'SUM(precio)',
        correct: false,
        feedback: 'SUM suma todos los precios; no indica cuál es el mayor.',
      },
    ],
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

function buildShuffledRounds(): MissionRound[] {
  return ROUNDS.map((round) => ({
    ...round,
    options: shuffleInPlace(round.options),
  }));
}

function tagGradient(tag: MissionRound['tag']) {
  switch (tag) {
    case 'ORDER BY':
      return 'from-sky-500 to-blue-600';
    case 'GROUP BY':
      return 'from-violet-500 to-purple-600';
    case 'LIMIT':
      return 'from-amber-500 to-orange-600';
    case 'COUNT':
      return 'from-cyan-500 to-teal-600';
    case 'SUM':
      return 'from-emerald-500 to-green-600';
    case 'AVG':
      return 'from-indigo-500 to-violet-600';
    case 'MAX':
      return 'from-rose-500 to-pink-600';
    case 'MIN':
      return 'from-slate-500 to-slate-700';
    default:
      return 'from-slate-600 to-slate-800';
  }
}

export function DqlAnalyticsGame() {
  const [gameRounds, setGameRounds] = useState<MissionRound[]>(() => buildShuffledRounds());
  const [roundIndex, setRoundIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = gameRounds[roundIndex];
  const totalRounds = gameRounds.length;

  const resetGame = useCallback(() => {
    setGameRounds(buildShuffledRounds());
    setRoundIndex(0);
    setPickedId(null);
    setScore(0);
    setFinished(false);
  }, []);

  const pickOption = useCallback(
    (option: MissionOption) => {
      if (pickedId !== null || finished) return;
      setPickedId(option.id);
      if (option.correct) setScore((value) => value + 1);
    },
    [pickedId, finished],
  );

  const goNext = useCallback(() => {
    if (pickedId === null) return;
    if (roundIndex >= totalRounds - 1) {
      setFinished(true);
      return;
    }
    setRoundIndex((index) => index + 1);
    setPickedId(null);
  }, [pickedId, roundIndex, totalRounds]);

  const pickedOption = round.options.find((option) => option.id === pickedId);

  if (finished) {
    const pct = Math.round((score / totalRounds) * 100);
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-sky-300/60 bg-gradient-to-br from-[#0c4a6e] via-[#0f172a] to-[#134e4a] p-8 sm:p-10">
        <div className="relative text-center">
          <span className="text-5xl" aria-hidden>
            📊
          </span>
          <h3 className="mt-4 bg-gradient-to-r from-sky-200 via-white to-cyan-200 bg-clip-text text-2xl font-bold text-transparent">
            ¡Misiones analíticas completadas!
          </h3>
          <p className="mt-2 text-sm text-sky-200/90">
            {score} de {totalRounds} aciertos
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            {pct >= 80
              ? 'Dominas ORDER BY, GROUP BY, LIMIT y las funciones COUNT, AVG y MAX.'
              : pct >= 50
                ? 'Buen avance. Repasa cuándo ordenar, agrupar, limitar o agregar.'
                : 'Vuelve a la lección del módulo 4 y repite el reto.'}
          </p>
          <button
            type="button"
            onClick={resetGame}
            className="mt-8 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-sky-400/40 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/80 p-[2px] shadow-[0_24px_60px_-12px_rgba(14,165,233,0.3)]">
      <div className="relative rounded-[14px] bg-white/95 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-800">
              Modo analítico
            </span>
            <h3 className="bg-gradient-to-r from-sky-800 via-blue-700 to-cyan-700 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              Misiones DQL avanzado
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Lee la misión, mira la consulta incompleta y elige la pieza que falta. Todo sobre la tabla{' '}
              <strong className="text-slate-800">producto</strong> de <strong className="text-slate-800">tienda_curso</strong>.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-white">
              <span className="text-[10px] uppercase text-slate-400">Misión </span>
              <span className="font-mono text-lg font-bold text-sky-300">
                {roundIndex + 1}/{totalRounds}
              </span>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900">
              Aciertos: <span className="font-mono text-base">{score}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg bg-gradient-to-r px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white ${tagGradient(round.tag)}`}
            >
              {round.tag}
            </span>
            <h4 className="text-base font-bold">{round.title}</h4>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{round.mission}</p>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Consulta en curso</p>
          <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-100 sm:text-sm">
            <code>
              {round.queryBefore}
              {'\n'}
              <span className="rounded bg-amber-500/20 px-1 text-amber-200">{round.placeholder}</span>
              {round.queryAfter.startsWith(';') || round.queryAfter.startsWith('\n') ? '' : ' '}
              {round.queryAfter}
              {pickedOption ? `\n\n-- Tu elección: ${pickedOption.fragment.replace(/\n/g, ' ')}` : ''}
            </code>
          </pre>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-label="Opciones de respuesta">
          {round.options.map((option, index) => {
            const isPicked = pickedId === option.id;
            const showResult = pickedId !== null;
            const letter = String.fromCharCode(65 + index);

            let card =
              'border-2 border-slate-200 bg-white hover:border-sky-400 hover:shadow-md';
            if (showResult && option.correct) {
              card = 'border-2 border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40';
            } else if (isPicked && !option.correct) {
              card = 'border-2 border-rose-500 bg-rose-50 ring-2 ring-rose-400/40';
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={pickedId !== null}
                onClick={() => pickOption(option)}
                className={`rounded-xl p-4 text-left transition-all ${card} disabled:cursor-default`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-sm font-bold text-sky-300">
                    {letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 px-2 py-1.5 font-mono text-[10px] text-emerald-100 sm:text-xs">
                      {option.fragment}
                    </pre>
                    {showResult && (isPicked || option.correct) ? (
                      <p
                        className={`mt-2 text-xs leading-relaxed ${
                          option.correct ? 'text-emerald-800' : isPicked ? 'text-rose-800' : 'text-slate-600'
                        }`}
                      >
                        {option.feedback}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          {pickedId !== null ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              {roundIndex >= totalRounds - 1 ? 'Ver resultado' : 'Siguiente misión →'}
            </button>
          ) : (
            <p className="text-xs text-slate-500">Elige la opción que completa la consulta.</p>
          )}
        </div>
      </div>
    </div>
  );
}
