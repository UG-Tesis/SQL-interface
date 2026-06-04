import { useEffect, useState } from 'react';
import type { SubNavItem } from '../../domain/models/SubNavItem';
import { FadeInUp } from './FadeInUp';
import { ThemeToggle } from './ThemeToggle';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

interface FixedSidebarProps {
  items: SubNavItem[];
  activeId: string | null;
  onActiveIdChange: (id: string) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  /** Solo ≥md: panel lateral oculto para ganar espacio al contenido */
  desktopCollapsed?: boolean;
}

export function FixedSidebar({
  items,
  activeId,
  onActiveIdChange,
  mobileOpen,
  onMobileOpenChange,
  desktopCollapsed = false,
}: FixedSidebarProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isVisible = isDesktop ? !desktopCollapsed : mobileOpen;

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú de contenido"
          className="fixed inset-x-0 top-16 bottom-0 z-[44] bg-slate-900/45 backdrop-blur-[2px] md:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      <aside
        id="module-subnav"
        className={`fixed left-0 top-16 bottom-0 z-[45] flex w-[min(100vw,18rem)] max-w-[18rem] flex-col overflow-y-auto border-r border-white/10 shadow-[6px_0_32px_rgba(0,0,0,0.2)] transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:w-72 md:max-w-none ${
          mobileOpen ? 'translate-x-0' : 'max-md:-translate-x-full'
        } ${desktopCollapsed ? 'md:pointer-events-none md:-translate-x-full md:opacity-0' : 'md:translate-x-0 md:opacity-100'}`}
        style={{ background: 'linear-gradient(180deg, var(--app-navy) 0%, var(--app-navy-mid) 55%, #0a1628 100%)' }}
        aria-label="Contenido del módulo"
        aria-hidden={!isVisible}
        inert={!isVisible}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3 md:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200/90">Contenido</p>
          <div className="flex shrink-0 items-center gap-0.5">
            <ThemeToggle className="text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-cyan-400" />
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Cerrar panel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-3 py-5 md:px-4">
          <FadeInUp delayMs={40}>
            <div className="mb-4 hidden border-b border-white/10 pb-3 text-center md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Contenido</p>
            </div>
          </FadeInUp>
          <nav className="flex flex-col gap-1.5">
            {items.map((item, index) => {
              if (item.isGroupHeader) {
                const moduleEnabled = item.enabled !== false;
                return (
                  <FadeInUp key={item.id} delayMs={90 + index * 40}>
                    <div
                      className={`rounded-xl border px-3 py-2.5 ${
                        moduleEnabled
                          ? 'border-cyan-500/25 bg-white/5'
                          : 'border-transparent bg-white/[0.02] opacity-80'
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300/90">
                        {item.label}
                      </p>
                      {!moduleEnabled ? (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Completa el módulo en Curso para habilitar
                        </p>
                      ) : null}
                    </div>
                  </FadeInUp>
                );
              }

              const isActive = activeId === item.id;
              const isEnabled = item.enabled !== false;
              const isPlaceholder = item.id.endsWith('-empty');

              if (isPlaceholder) {
                return (
                  <FadeInUp key={item.id} delayMs={90 + index * 40}>
                    <p className="px-3 py-1 text-xs text-slate-500">{item.label}</p>
                  </FadeInUp>
                );
              }

              return (
                <FadeInUp key={item.id} delayMs={90 + index * 55}>
                  <button
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => {
                      if (isEnabled) onActiveIdChange(item.id);
                    }}
                    className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                      !isEnabled
                        ? 'cursor-not-allowed border-transparent text-slate-500/70 opacity-70'
                        : isActive
                          ? 'border-cyan-400/35 bg-sky-500/15 text-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                          : 'border-transparent text-slate-300 hover:border-cyan-500/20 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-colors ${
                        !isEnabled
                          ? 'bg-white/5 text-slate-600'
                          : isActive
                            ? 'bg-cyan-500/30 text-cyan-100 ring-1 ring-cyan-400/40'
                            : 'bg-white/5 text-slate-500 group-hover:bg-cyan-500/15 group-hover:text-cyan-200'
                      }`}
                    >
                      {!isEnabled ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                        </svg>
                      ) : (
                        String(index + 1).padStart(2, '0')
                      )}
                    </span>
                    <span className="leading-snug">
                      {item.label}
                      {item.completed ? (
                        <span className="mt-1 block text-[11px] font-medium text-emerald-300/90">
                          Completado · 100%
                        </span>
                      ) : !isEnabled ? (
                        <span className="mt-1 block text-[11px] font-medium text-slate-500">
                          Completa el módulo anterior
                        </span>
                      ) : (item.porcentaje ?? 0) > 0 ? (
                        <span className="mt-1 block text-[11px] font-medium text-cyan-300/80">
                          Avance {item.porcentaje}%
                        </span>
                      ) : null}
                    </span>
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
