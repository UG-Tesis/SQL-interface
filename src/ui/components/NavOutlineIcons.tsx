import type { SectionId } from '../../domain/models/Section';

const stroke = 1.75;

function iconProps(className?: string) {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };
}

/** Casa — Inicio */
export function NavIconHome({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

/** Libro abierto — Curso */
export function NavIconBookOpen({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/** Lápiz — Actividad */
export function NavIconPencil({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/** Control / juegos */
export function NavIconGamepad({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 11h4M8 9v4" />
      <path d="M15 12h.01" />
      <path d="M18 10h.01" />
      <rect x="2" y="6" width="20" height="12" rx="4" />
    </svg>
  );
}

export function SectionNavIcon({ sectionId, className }: { sectionId: SectionId; className?: string }) {
  switch (sectionId) {
    case 'curso':
      return <NavIconBookOpen className={className} />;
    case 'actividad':
      return <NavIconPencil className={className} />;
    case 'juegos':
      return <NavIconGamepad className={className} />;
    default:
      return null;
  }
}
