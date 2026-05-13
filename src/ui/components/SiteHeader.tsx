import type { Section, SectionId } from '../../domain/models/Section';
import { BrandMark } from './BrandMark';
import { NavIconHome, SectionNavIcon } from './NavOutlineIcons';
import { ThemeToggle } from './ThemeToggle';

export type SiteHeaderVariant = 'landing' | 'dashboard' | 'app';

interface SiteHeaderProps {
  variant: SiteHeaderVariant;
  /** Landing: opcional. Dashboard / app: ir al panel inicio. */
  onBrandClick?: () => void;
  sections?: Section[];
  onNavigate?: (id: SectionId) => void;
  /** Solo variant `app`: sección del curso activa (resalta en la navegación). */
  activeSection?: SectionId | null;
  /** Solo app, con sección activa: abrir/cerrar subnavegación del módulo (móvil). */
  showModuleSubNavTrigger?: boolean;
  moduleSubNavOpen?: boolean;
  onModuleSubNavTriggerClick?: () => void;
}

const navLink =
  'rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-3 sm:text-sm';

const navInactiveApp =
  'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';
const navActiveApp =
  'bg-blue-50 font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100/90 dark:bg-blue-950/45 dark:text-blue-300 dark:ring-blue-800/60';

const headerSurface =
  'border-b border-slate-200/90 bg-white/90 shadow-sm shadow-slate-200/35 backdrop-blur-md dark:border-slate-700/90 dark:bg-slate-900/90 dark:shadow-black/25 dark:text-slate-100';

export function SiteHeader({
  variant,
  onBrandClick,
  sections = [],
  onNavigate,
  activeSection = null,
  showModuleSubNavTrigger = false,
  moduleSubNavOpen = false,
  onModuleSubNavTriggerClick,
}: SiteHeaderProps) {
  const showDashboardNav = variant === 'dashboard' && onNavigate;
  const isApp = variant === 'app';

  if (isApp && onNavigate && onBrandClick) {
    return (
      <header className={`fixed inset-x-0 top-0 z-[50] flex h-16 min-w-0 shrink-0 items-center px-3 text-slate-800 sm:px-5 md:px-8 ${headerSurface}`}>
        <div className="relative z-20 mx-auto grid w-full max-w-6xl min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 sm:gap-x-4 md:gap-x-6">
          <div className="flex shrink-0 items-center justify-self-start gap-1.5">
            {showModuleSubNavTrigger ? (
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
                onClick={onModuleSubNavTriggerClick}
                aria-expanded={moduleSubNavOpen}
                aria-controls="module-subnav"
                aria-label={moduleSubNavOpen ? 'Cerrar menú de contenido' : 'Abrir menú de contenido'}
              >
                {moduleSubNavOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            ) : null}
            <div className="hidden shrink-0 md:flex md:items-center">
              <BrandMark size="sm" onClick={onBrandClick} aria-label="Ir al inicio" />
            </div>
          </div>

          <nav
            className="flex min-w-0 w-full max-w-full flex-nowrap items-center justify-evenly gap-2 overflow-hidden sm:gap-2 md:justify-center md:gap-2 lg:gap-3"
            aria-label="Secciones del curso"
          >
            <button
              type="button"
              onClick={onBrandClick}
              className={`hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors sm:px-2.5 sm:text-xs md:inline-flex md:px-3 md:text-sm ${navInactiveApp}`}
            >
              <NavIconHome className="size-[18px] shrink-0 sm:size-5" />
              <span>Inicio</span>
            </button>
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  aria-label={section.title}
                  onClick={() => onNavigate(section.id)}
                  className={`flex shrink-0 items-center justify-center gap-1 rounded-lg font-medium leading-tight transition-colors max-md:h-10 max-md:w-10 max-md:gap-0 max-md:px-0 max-md:py-0 md:min-h-0 md:gap-1.5 md:px-3 md:py-2 md:text-sm ${
                    isActive ? navActiveApp : navInactiveApp
                  }`}
                >
                  <SectionNavIcon sectionId={section.id} className="size-[18px] shrink-0 md:size-5" />
                  <span className="hidden min-w-0 truncate md:inline md:whitespace-nowrap">{section.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="relative z-20 flex shrink-0 items-center justify-self-end gap-1">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={onBrandClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-cyan-600 transition-colors hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-cyan-400 dark:hover:bg-slate-800 md:hidden"
              aria-label="Ir al panel principal"
            >
              <NavIconHome className="size-[22px]" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-30 ${headerSurface}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        {onBrandClick ? (
          <BrandMark onClick={onBrandClick} aria-label="Ir al inicio" />
        ) : (
          <BrandMark />
        )}

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          {showDashboardNav ? (
            <nav className="flex min-w-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5" aria-label="Navegación principal">
              <span className="hidden items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100/90 dark:bg-blue-950/45 dark:text-blue-300 dark:ring-blue-800/50 sm:px-2.5 sm:text-sm md:inline-flex">
                <NavIconHome className="size-4 shrink-0" />
                Inicio
              </span>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onNavigate(section.id)}
                  className={`hidden items-center gap-1.5 md:inline-flex ${navLink}`}
                >
                  <SectionNavIcon sectionId={section.id} className="size-4 shrink-0" />
                  {section.title}
                </button>
              ))}
            </nav>
          ) : (
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              Aprende SQL paso a paso
            </p>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
