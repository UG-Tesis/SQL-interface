import { useCallback, useMemo, useState } from 'react';

type ClauseTile = {
  id: string;
  text: string;
};

type BuilderRound = {
  id: string;
  tag: 'SELECT' | 'FROM' | 'WHERE' | 'CÁLCULO' | 'REPASO';
  title: string;
  mission: string;
  solutionIds: string[];
  tiles: ClauseTile[];
  successFeedback: string;
};

const ROUNDS: BuilderRound[] = [
  {
    id: 'q1',
    tag: 'SELECT',
    title: 'Columnas concretas',
    mission:
      'La tienda quiere un listado con solo el nombre y el correo de cada cliente, sin mostrar el resto de columnas.',
    solutionIds: ['q1-select', 'q1-from'],
    tiles: [
      { id: 'q1-select', text: 'SELECT nombre, email' },
      { id: 'q1-from', text: 'FROM cliente' },
      { id: 'q1-wrong-star', text: 'SELECT *' },
      { id: 'q1-wrong-prod', text: 'FROM producto' },
      { id: 'q1-wrong-where', text: 'WHERE id_cliente = 1' },
    ],
    successFeedback:
      'Correcto: en la lección viste que puedes elegir columnas específicas en el SELECT en lugar de usar el comodín *.',
  },
  {
    id: 'q2',
    tag: 'SELECT',
    title: 'Explorar con *',
    mission:
      'Es tu primer día en la base tienda_curso y quieres ver todas las columnas de la tabla cliente para conocer su estructura.',
    solutionIds: ['q2-select', 'q2-from'],
    tiles: [
      { id: 'q2-select', text: 'SELECT *' },
      { id: 'q2-from', text: 'FROM cliente' },
      { id: 'q2-wrong-cols', text: 'SELECT nombre, email' },
      { id: 'q2-wrong-prod', text: 'FROM producto' },
      { id: 'q2-wrong-where', text: 'WHERE precio > 10' },
    ],
    successFeedback:
      'Correcto: el comodín * devuelve todas las columnas de la tabla indicada en FROM, ideal para explorar.',
  },
  {
    id: 'q3',
    tag: 'FROM',
    title: 'Elegir la tabla correcta',
    mission:
      'Necesitas consultar el nombre y el precio de cada artículo del catálogo. Los datos están en la tabla producto.',
    solutionIds: ['q3-select', 'q3-from'],
    tiles: [
      { id: 'q3-select', text: 'SELECT nombre, precio' },
      { id: 'q3-from', text: 'FROM producto' },
      { id: 'q3-wrong-cliente', text: 'FROM cliente' },
      { id: 'q3-wrong-star', text: 'SELECT *' },
      { id: 'q3-wrong-where', text: 'WHERE id_cliente = 1' },
    ],
    successFeedback:
      'Correcto: FROM indica de qué tabla lees. Para precios de artículos usas producto, no cliente.',
  },
  {
    id: 'q4',
    tag: 'WHERE',
    title: 'Filtrar productos',
    mission:
      'Solo te interesan los productos con precio mayor a 10. Debes ver su nombre y precio, filtrando el resto.',
    solutionIds: ['q4-select', 'q4-from', 'q4-where'],
    tiles: [
      { id: 'q4-select', text: 'SELECT nombre, precio' },
      { id: 'q4-from', text: 'FROM producto' },
      { id: 'q4-where', text: 'WHERE precio > 10' },
      { id: 'q4-wrong-eq', text: 'WHERE precio = 10' },
      { id: 'q4-wrong-cliente', text: 'FROM cliente' },
      { id: 'q4-wrong-id', text: 'WHERE id_cliente = 1' },
    ],
    successFeedback:
      'Correcto: WHERE precio > 10 deja pasar solo las filas que cumplen la condición, como en el ejemplo del curso.',
  },
  {
    id: 'q5',
    tag: 'CÁLCULO',
    title: 'Precio de dos unidades',
    mission:
      'Para la vitrina online quieres mostrar el nombre, el precio unitario y cuánto costarían dos unidades (precio × 2) de cada producto.',
    solutionIds: ['q5-select', 'q5-from'],
    tiles: [
      { id: 'q5-select', text: 'SELECT nombre, precio, precio * 2' },
      { id: 'q5-from', text: 'FROM producto' },
      { id: 'q5-wrong-plus', text: 'SELECT nombre, precio + 2' },
      { id: 'q5-wrong-div', text: 'SELECT nombre, precio / 2' },
      { id: 'q5-wrong-where', text: 'WHERE precio > 10' },
    ],
    successFeedback:
      'Correcto: en SELECT puedes calcular columnas con operadores (+, -, *, /) sin modificar los datos guardados en la tabla.',
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

function tagStyles(tag: BuilderRound['tag']) {
  switch (tag) {
    case 'SELECT':
      return 'from-violet-500 to-indigo-600';
    case 'FROM':
      return 'from-sky-500 to-cyan-600';
    case 'WHERE':
      return 'from-amber-500 to-orange-600';
    case 'CÁLCULO':
      return 'from-emerald-500 to-teal-600';
    default:
      return 'from-slate-600 to-slate-800';
  }
}

function buildShuffledRounds(): BuilderRound[] {
  return ROUNDS.map((round) => ({
    ...round,
    tiles: shuffleInPlace(round.tiles),
  }));
}

export function DqlQueryBuilderGame() {
  const [gameRounds, setGameRounds] = useState<BuilderRound[]>(() => buildShuffledRounds());
  const [roundIndex, setRoundIndex] = useState(0);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = gameRounds[roundIndex];
  const totalRounds = gameRounds.length;

  const pickedTiles = useMemo(
    () =>
      pickedIds
        .map((id) => round.tiles.find((tile) => tile.id === id))
        .filter((tile): tile is ClauseTile => Boolean(tile)),
    [pickedIds, round.tiles],
  );

  const availableTiles = useMemo(
    () => round.tiles.filter((tile) => !pickedIds.includes(tile.id)),
    [pickedIds, round.tiles],
  );

  const resetRoundState = useCallback(() => {
    setPickedIds([]);
    setChecked(false);
    setIsCorrect(false);
  }, []);

  const resetGame = useCallback(() => {
    setGameRounds(buildShuffledRounds());
    setRoundIndex(0);
    setPickedIds([]);
    setChecked(false);
    setIsCorrect(false);
    setScore(0);
    setFinished(false);
  }, []);

  const pickTile = useCallback(
    (tileId: string) => {
      if (checked && isCorrect) return;
      setPickedIds((prev) => [...prev, tileId]);
      if (checked) {
        setChecked(false);
        setIsCorrect(false);
      }
    },
    [checked, isCorrect],
  );

  const undoLast = useCallback(() => {
    if (checked && isCorrect) return;
    setPickedIds((prev) => prev.slice(0, -1));
    setChecked(false);
    setIsCorrect(false);
  }, [checked, isCorrect]);

  const clearPicks = useCallback(() => {
    if (checked && isCorrect) return;
    resetRoundState();
  }, [checked, isCorrect, resetRoundState]);

  const verify = useCallback(() => {
    if (checked && isCorrect) return;
    const correct =
      pickedIds.length === round.solutionIds.length &&
      pickedIds.every((id, index) => id === round.solutionIds[index]);
    setChecked(true);
    setIsCorrect(correct);
    if (correct) setScore((value) => value + 1);
  }, [checked, isCorrect, pickedIds, round.solutionIds]);

  const goNext = useCallback(() => {
    if (!isCorrect) return;
    if (roundIndex >= totalRounds - 1) {
      setFinished(true);
      return;
    }
    setRoundIndex((index) => index + 1);
    resetRoundState();
  }, [isCorrect, roundIndex, totalRounds, resetRoundState]);

  if (finished) {
    const pct = Math.round((score / totalRounds) * 100);
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-300/60 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#134e4a] p-8 shadow-[0_0_60px_-12px_rgba(139,92,246,0.45)] sm:p-10">
        <div className="relative text-center">
          <span className="text-5xl" aria-hidden>
            🔍
          </span>
          <h3 className="mt-4 bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            ¡Constructor DQL completado!
          </h3>
          <p className="mt-2 text-sm text-violet-200/90">
            {score} de {totalRounds} consultas armadas correctamente
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            {pct >= 80
              ? 'Dominas el orden SELECT → FROM → WHERE y cuándo usar columnas, * o expresiones calculadas.'
              : pct >= 50
                ? 'Buen trabajo. Repasa los retos fallidos y vuelve a leer la sección de comandos básicos del SELECT.'
                : 'Vuelve a la lección: fíjate en qué hace cada parte de la consulta antes de armarla.'}
          </p>
          <button
            type="button"
            onClick={resetGame}
            className="mt-8 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-violet-400/40 bg-gradient-to-br from-violet-50/90 via-white to-cyan-50/80 p-[2px] shadow-[0_24px_60px_-12px_rgba(124,58,237,0.25)]">
      <div className="relative rounded-[14px] bg-white/95 p-5 backdrop-blur-md sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-800">
              Modo constructor
            </span>
            <h3 className="bg-gradient-to-r from-violet-800 via-indigo-700 to-cyan-700 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              Arma la consulta pieza a pieza
            </h3>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Toca las piezas SQL en el orden correcto para formar la consulta que pide cada misión. Usa la base{' '}
              <strong className="text-slate-800">tienda_curso</strong> y las tablas{' '}
              <strong className="text-slate-800">cliente</strong> y <strong className="text-slate-800">producto</strong>.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-white">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Misión </span>
              <span className="font-mono text-lg font-bold text-violet-300">
                {roundIndex + 1}/{totalRounds}
              </span>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
              <span className="text-xs font-semibold text-amber-900">
                Aciertos: <span className="font-mono">{score}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg bg-gradient-to-r px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white ${tagStyles(round.tag)}`}
            >
              {round.tag}
            </span>
            <h4 className="text-base font-bold text-white">{round.title}</h4>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{round.mission}</p>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Tu consulta</p>
          <div
            className={`min-h-[5.5rem] rounded-xl border-2 border-dashed p-4 font-mono text-sm transition-colors ${
              checked && isCorrect
                ? 'border-emerald-400 bg-emerald-50/80 text-emerald-950'
                : checked && !isCorrect
                  ? 'border-rose-400 bg-rose-50/80 text-rose-950'
                  : pickedTiles.length > 0
                    ? 'border-violet-300 bg-slate-950 text-emerald-100'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            {pickedTiles.length === 0 ? (
              <span className="text-xs text-slate-400">Toca las piezas de abajo en el orden correcto…</span>
            ) : (
              <div className="space-y-1">
                {pickedTiles.map((tile, index) => (
                  <div key={`${tile.id}-${index}`} className="leading-relaxed">
                    {tile.text}
                    {index < pickedTiles.length - 1 ? ';' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          {checked ? (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-sm leading-relaxed ${
                isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}
            >
              {isCorrect
                ? round.successFeedback
                : 'Aún no coincide. Recuerda el orden: primero SELECT (qué columnas), luego FROM (qué tabla) y WHERE solo si debes filtrar.'}
            </p>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Piezas disponibles</p>
          <div className="flex flex-wrap gap-2">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => pickTile(tile.id)}
                disabled={checked && isCorrect}
                className="rounded-lg border-2 border-violet-200/80 bg-white px-3 py-2 font-mono text-xs text-violet-900 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md disabled:cursor-default disabled:opacity-60"
              >
                {tile.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={undoLast}
            disabled={pickedIds.length === 0 || (checked && isCorrect)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
          >
            Quitar última
          </button>
          <button
            type="button"
            onClick={clearPicks}
            disabled={pickedIds.length === 0 || (checked && isCorrect)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
          >
            Reiniciar piezas
          </button>
          {!checked || !isCorrect ? (
            <button
              type="button"
              onClick={verify}
              disabled={pickedIds.length === 0}
              className="ml-auto rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-40"
            >
              Comprobar consulta
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="ml-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md"
            >
              {roundIndex >= totalRounds - 1 ? 'Ver resultado' : 'Siguiente misión →'}
            </button>
          )}
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          Tip: en Workbench el orden es <span className="font-mono text-violet-700">SELECT</span> →{' '}
          <span className="font-mono text-sky-700">FROM</span> →{' '}
          <span className="font-mono text-amber-700">WHERE</span> (opcional).
        </p>
      </div>
    </div>
  );
}
