import {
  MISTERIO_CASE_NARRATIVE,
  MISTERIO_CASE_TITLE,
  MISTERIO_INVESTIGATION_PHASES,
  MISTERIO_QUICK_START,
} from '../../domain/config/misterio.config';

export type MisterioHelpTab = 'caso' | 'objetivos' | 'tablas' | 'ayuda' | 'entregar';

interface MisterioCaseHeaderProps {
  currentEtapa: 1 | 2 | 'resuelto';
  firstClueLoaded: boolean;
  onLoadFirstClue: () => void;
  onOpenHelp: (tab: MisterioHelpTab) => void;
}

function EtapaBadge({ currentEtapa }: { currentEtapa: 1 | 2 | 'resuelto' }) {
  if (currentEtapa === 'resuelto') {
    return (
      <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
        Caso cerrado
      </span>
    );
  }

  const phase = MISTERIO_INVESTIGATION_PHASES.find((p) => p.etapa === currentEtapa);
  return (
    <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
      Etapa {currentEtapa}: {phase?.title ?? 'Investigación'}
    </span>
  );
}

export function MisterioCaseHeader({
  currentEtapa,
  firstClueLoaded,
  onLoadFirstClue,
  onOpenHelp,
}: MisterioCaseHeaderProps) {
  return (
    <header className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-lg dark:border-slate-700">
      <div className="w-full border-b border-white/10 bg-[linear-gradient(90deg,rgba(220,38,38,0.12),transparent)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Archivo abierto
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Misterio SQL
            </span>
          </div>
          <EtapaBadge currentEtapa={currentEtapa} />
        </div>

        <h2 className="mt-3 font-serif text-xl font-bold tracking-tight sm:text-2xl">
          {MISTERIO_CASE_TITLE}
        </h2>
        <p className="mt-3 w-full text-base font-medium leading-relaxed text-slate-100 sm:text-lg sm:leading-8">
          {MISTERIO_CASE_NARRATIVE}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLoadFirstClue}
            className={
              firstClueLoaded
                ? 'rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-500'
                : 'rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10'
            }
          >
            {MISTERIO_QUICK_START.buttonLabel}
          </button>
          <button
            type="button"
            onClick={() => onOpenHelp('tablas')}
            className="rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Ver tablas
          </button>
          <button
            type="button"
            onClick={() => onOpenHelp('ayuda')}
            className="rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Cómo jugar
          </button>
        </div>
      </div>
    </header>
  );
}
