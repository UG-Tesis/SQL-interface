import type { Section, SectionId } from '../../domain/models/Section';

interface HeaderProps {
  sections: Section[];
  activeSection: SectionId | null;
  onNavigate: (id: SectionId) => void;
  onNavigateToDashboard: () => void;
}

export function Header({
  sections,
  activeSection,
  onNavigate,
  onNavigateToDashboard,
}: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
      <button
        type="button"
        onClick={onNavigateToDashboard}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-slate-800 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        SQL
      </button>

      <nav className="flex items-center gap-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="w-[60px]" aria-hidden />
    </header>
  );
}
