import type { Section, SectionId } from '../../domain/models/Section';

interface HeaderProps {
  sections: Section[];
  activeSection: SectionId | null;
  onNavigate: (id: SectionId) => void;
  onNavigateToDashboard: () => void;
  /** Solo móvil: mostrar botón para abrir el submenú del módulo */
  showModuleSubNavTrigger?: boolean;
  moduleSubNavOpen?: boolean;
  onModuleSubNavTriggerClick?: () => void;
}

export function Header({
  sections,
  activeSection,
  onNavigate,
  onNavigateToDashboard,
  showModuleSubNavTrigger = false,
  moduleSubNavOpen = false,
  onModuleSubNavTriggerClick,
}: HeaderProps) {
  return (
    <header className="relative flex h-16 min-w-0 shrink-0 items-center border-b border-slate-800/80 bg-slate-900 px-3 text-white shadow-sm shadow-black/20 sm:px-5 md:gap-4 md:px-8">
      <div className="relative z-20 flex shrink-0 items-center gap-1.5">
        {showModuleSubNavTrigger ? (
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 md:hidden"
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
        <button
          type="button"
          onClick={onNavigateToDashboard}
          className="hidden shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-slate-800 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 md:inline-flex"
        >
          SQL
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:pointer-events-auto md:static md:inset-auto md:min-w-0 md:flex-1">
        <nav
          className="pointer-events-auto flex w-full max-w-[calc(100%-5.75rem)] items-center justify-center gap-0.5 overflow-x-hidden md:max-w-none md:gap-2"
          aria-label="Secciones del curso"
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigate(section.id)}
                className={`flex min-h-0 min-w-0 flex-1 basis-0 items-center justify-center rounded-lg px-0.5 py-2 text-[11px] font-medium leading-tight transition-colors sm:px-1 sm:text-xs md:flex-none md:basis-auto md:px-4 md:text-sm ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="inline-flex min-w-0 max-w-full items-center gap-px md:gap-2">
                  <span className="flex shrink-0 items-center justify-center [&>svg]:size-3.5 sm:[&>svg]:size-4 md:[&>svg]:size-[1.125rem]">
                    {section.icon}
                  </span>
                  <span className="min-w-0 truncate md:whitespace-nowrap">{section.title}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={onNavigateToDashboard}
        className="relative z-20 ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-cyan-400 transition-colors hover:bg-slate-800 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 md:hidden"
        aria-label="Ir al panel principal"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      </button>
    </header>
  );
}
