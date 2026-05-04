import type { SubNavItem } from '../../domain/models/SubNavItem';
import { FadeInUp } from './FadeInUp';

interface FixedSidebarProps {
  items: SubNavItem[];
  activeId: string | null;
  onActiveIdChange: (id: string) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function FixedSidebar({
  items,
  activeId,
  onActiveIdChange,
  mobileOpen,
  onMobileOpenChange,
}: FixedSidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú de contenido"
          className="fixed inset-x-0 top-16 bottom-0 z-[44] bg-black/55 backdrop-blur-[2px] md:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      <aside
        id="module-subnav"
        className={`fixed left-0 top-16 bottom-0 z-[45] flex w-[min(100vw,18rem)] max-w-[18rem] flex-col overflow-y-auto border-r border-slate-700/90 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-[8px_0_24px_rgba(0,0,0,0.35)] transition-[transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : 'max-md:-translate-x-full'
        }`}
        aria-label="Contenido del módulo"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 px-3 py-3 md:hidden">
          <p className="text-xs font-medium text-slate-500">Contenido</p>
          <button
            type="button"
            onClick={() => onMobileOpenChange(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Cerrar panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-5">
          <FadeInUp delayMs={40}>
            <div className="mb-4 hidden border-b border-slate-700/80 pb-4 text-center md:block">
              <p className="text-xs font-medium text-slate-500">Contenido</p>
            </div>
          </FadeInUp>
        <nav className="flex flex-col gap-1">
          {items.map((item, index) => {
            const isActive = activeId === item.id;
            return (
              <FadeInUp key={item.id} delayMs={90 + index * 55}>
                <button
                  type="button"
                  onClick={() => onActiveIdChange(item.id)}
                  className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.12)] hover:border-cyan-400/70 hover:shadow-cyan-500/15'
                      : 'border-transparent text-slate-400 hover:border-cyan-400/45 hover:bg-slate-800/70 hover:text-slate-100 hover:shadow-slate-900/40'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums transition-transform duration-300 group-hover:scale-110 ${
                      isActive
                        ? 'bg-cyan-500/25 text-cyan-300'
                        : 'bg-slate-800 text-slate-500 group-hover:text-cyan-300/90'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug">{item.label}</span>
                </button>
              </FadeInUp>
            );
          })}
        </nav>
      </div>
    </aside>
    </>
  );
}
