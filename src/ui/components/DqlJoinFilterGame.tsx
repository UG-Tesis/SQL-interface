import { useCallback, useState } from 'react';

type FilterOption = {
  id: string;
  label: string;
  sql: string;
  correct: boolean;
  feedback: string;
};

type FilterMission = {
  id: string;
  tag: 'JOIN' | '=' | '<' | '>' | '!=' | 'AND' | 'OR' | 'NOT' | 'BETWEEN' | 'IN' | 'LIKE';
  title: string;
  mission: string;
  context: string;
  options: FilterOption[];
};

const MISSIONS: FilterMission[] = [
  {
    id: 'f1',
    tag: 'JOIN',
    title: 'Clientes y sus pedidos',
    mission:
      'Necesitas ver el nombre de cada cliente junto con la fecha de sus pedidos. Los datos están en las tablas cliente y pedido, relacionadas por id_cliente.',
    context: 'Tablas: cliente · pedido',
    options: [
      {
        id: 'f1a',
        label: 'Unir con JOIN',
        sql: `FROM cliente
JOIN pedido ON cliente.id_cliente = pedido.id_cliente`,
        correct: true,
        feedback:
          'Correcto: JOIN enlaza filas de dos tablas cuando coinciden en la columna de relación, como en el ejemplo del módulo.',
      },
      {
        id: 'f1b',
        label: 'Solo tabla cliente',
        sql: 'FROM cliente',
        correct: false,
        feedback: 'Con una sola tabla no obtienes la fecha del pedido; necesitas JOIN con pedido.',
      },
      {
        id: 'f1c',
        label: 'WHERE en lugar de JOIN',
        sql: 'FROM cliente\nWHERE id_cliente = pedido.id_cliente',
        correct: false,
        feedback: 'WHERE filtra filas de una tabla; no combina cliente con pedido. Usa JOIN ... ON.',
      },
      {
        id: 'f1d',
        label: 'JOIN sin ON',
        sql: 'FROM cliente\nJOIN pedido',
        correct: false,
        feedback: 'JOIN requiere ON para indicar cómo se relacionan las columnas de ambas tablas.',
      },
    ],
  },
  {
    id: 'f2',
    tag: '=',
    title: 'Un cliente concreto',
    mission: 'Busca el nombre y el correo del cliente cuyo id_cliente es exactamente 1.',
    context: 'Tabla: cliente',
    options: [
      {
        id: 'f2a',
        label: 'Igualdad',
        sql: 'WHERE id_cliente = 1',
        correct: true,
        feedback: 'Correcto: el operador = filtra filas donde el valor coincide exactamente.',
      },
      {
        id: 'f2b',
        label: 'Distinto de',
        sql: 'WHERE id_cliente != 1',
        correct: false,
        feedback: '!= excluye al cliente 1; aquí quieres solo ese cliente.',
      },
      {
        id: 'f2c',
        label: 'Lista de ids',
        sql: 'WHERE id_cliente IN (2, 3)',
        correct: false,
        feedback: 'IN sirve para varios valores; aquí buscas únicamente el id 1.',
      },
      {
        id: 'f2d',
        label: 'Patrón de texto',
        sql: "WHERE nombre LIKE 'A%'",
        correct: false,
        feedback: 'LIKE filtra por patrón en texto, no por id numérico exacto.',
      },
    ],
  },
  {
    id: 'f3',
    tag: '<',
    title: 'Productos económicos',
    mission: 'Lista productos con precio menor a 20 unidades.',
    context: 'Tabla: producto',
    options: [
      {
        id: 'f3a',
        label: 'Menor que',
        sql: 'WHERE precio < 20',
        correct: true,
        feedback: 'Correcto: < selecciona valores estrictamente menores que 20.',
      },
      {
        id: 'f3b',
        label: 'Mayor que',
        sql: 'WHERE precio > 20',
        correct: false,
        feedback: '> muestra precios por encima de 20, no por debajo.',
      },
      {
        id: 'f3c',
        label: 'Rango BETWEEN',
        sql: 'WHERE precio BETWEEN 20 AND 50',
        correct: false,
        feedback: 'BETWEEN incluye un rango; el enunciado pide solo menores a 20.',
      },
      {
        id: 'f3d',
        label: 'Igual a 20',
        sql: 'WHERE precio = 20',
        correct: false,
        feedback: '= solo devuelve productos con precio exactamente 20.',
      },
    ],
  },
  {
    id: 'f4',
    tag: 'AND',
    title: 'Rango de precios',
    mission: 'Quieres productos con precio mayor a 10 y, al mismo tiempo, menor a 100.',
    context: 'Tabla: producto',
    options: [
      {
        id: 'f4a',
        label: 'Dos condiciones con AND',
        sql: 'WHERE precio > 10\n  AND precio < 100',
        correct: true,
        feedback: 'Correcto: AND exige que se cumplan las dos condiciones a la vez.',
      },
      {
        id: 'f4b',
        label: 'Solo una condición',
        sql: 'WHERE precio > 10',
        correct: false,
        feedback: 'Falta acotar el máximo; sin precio < 100 incluirías productos muy caros.',
      },
      {
        id: 'f4c',
        label: 'OR en lugar de AND',
        sql: 'WHERE precio > 10\n   OR precio < 100',
        correct: false,
        feedback: 'Con OR casi todos los productos pasarían el filtro; necesitas AND.',
      },
      {
        id: 'f4d',
        label: 'BETWEEN equivalente',
        sql: 'WHERE precio BETWEEN 10 AND 100',
        correct: false,
        feedback:
          'BETWEEN también podría servir, pero el enunciado pide explícitamente combinar > y < con AND, como en la lección.',
      },
    ],
  },
  {
    id: 'f5',
    tag: 'BETWEEN',
    title: 'Precios en un rango',
    mission: 'Muestra productos cuyo precio está entre 10 y 50, incluyendo ambos extremos.',
    context: 'Tabla: producto',
    options: [
      {
        id: 'f5a',
        label: 'Rango inclusivo',
        sql: 'WHERE precio BETWEEN 10 AND 50',
        correct: true,
        feedback: 'Correcto: BETWEEN incluye los valores límite del rango.',
      },
      {
        id: 'f5b',
        label: 'Solo mayor que 10',
        sql: 'WHERE precio > 10',
        correct: false,
        feedback: 'No limita el precio máximo a 50.',
      },
      {
        id: 'f5c',
        label: 'Lista IN',
        sql: 'WHERE precio IN (10, 50)',
        correct: false,
        feedback: 'IN (10, 50) solo devuelve esos dos precios exactos, no todo el rango intermedio.',
      },
      {
        id: 'f5d',
        label: 'AND sin BETWEEN',
        sql: 'WHERE precio > 10\n  AND precio < 50',
        correct: false,
        feedback:
          'Con < 50 excluyes el precio 50; el enunciado pide incluir el extremo superior (usa BETWEEN).',
      },
    ],
  },
  {
    id: 'f6',
    tag: 'LIKE',
    title: 'Correos del dominio',
    mission: 'Filtra clientes cuyo email termina en @ejemplo.com usando un patrón con %.',
    context: 'Tabla: cliente',
    options: [
      {
        id: 'f6a',
        label: 'Patrón con %',
        sql: "WHERE email LIKE '%@ejemplo.com'",
        correct: true,
        feedback: "Correcto: % representa cualquier texto antes de '@ejemplo.com'.",
      },
      {
        id: 'f6b',
        label: 'Igualdad exacta',
        sql: "WHERE email = '@ejemplo.com'",
        correct: false,
        feedback: 'El email completo incluye la parte antes de @; necesitas LIKE con %.',
      },
      {
        id: 'f6c',
        label: 'IN con lista',
        sql: "WHERE email IN ('ana@ejemplo.com', 'luis@ejemplo.com')",
        correct: false,
        feedback: 'IN enumera correos concretos; LIKE busca todos los que terminan en ese dominio.',
      },
      {
        id: 'f6d',
        label: 'Un carácter con _',
        sql: "WHERE email LIKE 'A_a@ejemplo.com'",
        correct: false,
        feedback: '_ coincide con un solo carácter; aquí necesitas % para “cualquier prefijo”.',
      },
    ],
  },
  {
    id: 'f7',
    tag: 'IN',
    title: 'Varios clientes a la vez',
    mission: 'Obtén nombre y correo de los clientes con id_cliente 1, 2 o 3 en una sola condición.',
    context: 'Tabla: cliente',
    options: [
      {
        id: 'f7a',
        label: 'Lista con IN',
        sql: 'WHERE id_cliente IN (1, 2, 3)',
        correct: true,
        feedback: 'Correcto: IN comprueba si el valor está en la lista indicada.',
      },
      {
        id: 'f7b',
        label: 'OR equivalente largo',
        sql: 'WHERE id_cliente = 1\n   OR id_cliente = 4',
        correct: false,
        feedback: 'Incluye el id 4 en lugar del 3; además el enunciado pide la forma compacta IN.',
      },
      {
        id: 'f7c',
        label: 'Rango incompleto',
        sql: 'WHERE id_cliente BETWEEN 1 AND 2',
        correct: false,
        feedback: 'Ese rango solo incluye los ids 1 y 2; falta el cliente 3.',
      },
      {
        id: 'f7d',
        label: 'Solo id 1',
        sql: 'WHERE id_cliente = 1',
        correct: false,
        feedback: 'Solo devuelve un cliente; necesitas los ids 1, 2 y 3.',
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

function buildShuffledMissions(): FilterMission[] {
  return MISSIONS.map((mission) => ({
    ...mission,
    options: shuffleInPlace(mission.options),
  }));
}

function tagStyle(tag: FilterMission['tag']) {
  switch (tag) {
    case 'JOIN':
      return 'bg-gradient-to-r from-teal-500 to-emerald-600';
    case 'LIKE':
      return 'bg-gradient-to-r from-fuchsia-500 to-pink-600';
    case 'BETWEEN':
    case 'IN':
      return 'bg-gradient-to-r from-amber-500 to-orange-600';
    case 'AND':
    case 'OR':
    case 'NOT':
      return 'bg-gradient-to-r from-violet-500 to-purple-600';
    default:
      return 'bg-gradient-to-r from-cyan-500 to-sky-600';
  }
}

export function DqlJoinFilterGame() {
  const [missions, setMissions] = useState<FilterMission[]>(() => buildShuffledMissions());
  const [roundIndex, setRoundIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const mission = missions[roundIndex];
  const totalRounds = missions.length;

  const resetGame = useCallback(() => {
    setMissions(buildShuffledMissions());
    setRoundIndex(0);
    setPickedId(null);
    setScore(0);
    setFinished(false);
  }, []);

  const pickOption = useCallback(
    (option: FilterOption) => {
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

  if (finished) {
    const pct = Math.round((score / totalRounds) * 100);
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-teal-300/60 bg-gradient-to-br from-[#134e4a] via-[#0f172a] to-[#1e3a5f] p-8 sm:p-10">
        <div className="text-center">
          <span className="text-5xl" aria-hidden>
            🔗
          </span>
          <h3 className="mt-4 bg-gradient-to-r from-teal-200 via-white to-cyan-200 bg-clip-text text-2xl font-bold text-transparent">
            ¡Reto de uniones y filtros completado!
          </h3>
          <p className="mt-2 text-sm text-teal-200/90">
            {score} de {totalRounds} misiones resueltas
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            {pct >= 80
              ? 'Sabes cuándo usar JOIN y qué operador de WHERE encaja en cada situación.'
              : pct >= 50
                ? 'Buen avance. Repasa JOIN, AND, BETWEEN, IN y LIKE en la lección.'
                : 'Vuelve a leer el módulo 5 y prueba otra vez.'}
          </p>
          <button
            type="button"
            onClick={resetGame}
            className="mt-8 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-teal-400/40 bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/80 p-[2px] shadow-[0_24px_60px_-12px_rgba(20,184,166,0.3)]">
      <div className="relative rounded-[14px] bg-white/95 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-teal-200 bg-teal-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-800">
              Modo detective
            </span>
            <h3 className="bg-gradient-to-r from-teal-800 via-emerald-700 to-cyan-700 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              Elige el filtro correcto
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Lee la misión y selecciona la condición SQL que la resuelve: JOIN para unir tablas o WHERE con el
              operador adecuado.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-white">
              <span className="text-[10px] uppercase text-slate-400">Misión </span>
              <span className="font-mono text-lg font-bold text-teal-300">
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
            <span className={`rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white ${tagStyle(mission.tag)}`}>
              {mission.tag}
            </span>
            <h4 className="text-base font-bold">{mission.title}</h4>
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
              {mission.context}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{mission.mission}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-label="Opciones de filtro">
          {mission.options.map((option, index) => {
            const isPicked = pickedId === option.id;
            const showResult = pickedId !== null;
            const letter = String.fromCharCode(65 + index);

            let card = 'border-2 border-slate-200 bg-white hover:border-teal-400 hover:shadow-md';
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-mono text-sm font-bold text-teal-300">
                    {letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{option.label}</p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-emerald-100 sm:text-xs">
                      {option.sql}
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

        <div className="mt-6 flex justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            Tip: JOIN une tablas; WHERE filtra con =, &lt;, &gt;, AND, BETWEEN, IN o LIKE.
          </p>
          {pickedId !== null ? (
            <button
              type="button"
              onClick={goNext}
              className="shrink-0 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              {roundIndex >= totalRounds - 1 ? 'Ver resultado' : 'Siguiente →'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
