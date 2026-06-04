import { useNavigate } from 'react-router-dom';
import type { Section, SectionId } from '../../domain/models/Section';
import { FadeInUp } from '../components/FadeInUp';
import { PageBackdrop } from '../components/PageBackdrop';
import { SectionCard } from '../components/SectionCard';
import { SiteHeader } from '../components/SiteHeader';
import { useSession } from '../session/SessionContext';

interface DashboardPageProps {
  sections: Section[];
  onNavigate: (id: SectionId) => void;
  onNavigateToHome: () => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(iso));
}

export function DashboardPage({ sections, onNavigate, onNavigateToHome }: DashboardPageProps) {
  const navigate = useNavigate();
  const { activeUser } = useSession();

  return (
    <div className="relative flex min-h-screen flex-col dark:bg-slate-950">
      <PageBackdrop />
      <SiteHeader
        variant="dashboard"
        onBrandClick={onNavigateToHome}
        sections={sections}
        onNavigate={onNavigate}
      />

      <main className="relative z-10 flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12 md:py-14">
        <div className="mx-auto w-full max-w-6xl">
          {activeUser ? (
            <FadeInUp delayMs={60}>
              <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-cyan-200/80 bg-cyan-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-900/50 dark:bg-cyan-950/20">
                <div>
                  <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">
                    Sesión activa
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {activeUser.nombre} {activeUser.apellido}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ID {activeUser.personaId} · Inscripción {activeUser.inscripcionId} ·{' '}
                    {formatDate(activeUser.fechaRegistro)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void navigate('/', { state: { openEntry: true } })}
                  className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-100 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-cyan-950/40"
                >
                  Cambiar usuario
                </button>
              </div>
            </FadeInUp>
          ) : null}

          <div className="mb-10 text-center md:mb-14">
            <FadeInUp delayMs={100}>
              <h1 className="text-5xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400 sm:text-6xl md:text-7xl">
                SQL
              </h1>
            </FadeInUp>
            <FadeInUp delayMs={200}>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                Plataforma interactiva de aprendizaje de sentencias SQL para estudiantes de 5to semestre
                universitario.
              </p>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-3 md:gap-8">
            {sections.map((section, index) => (
              <FadeInUp key={section.id} delayMs={280 + index * 100}>
                <SectionCard section={section} onNavigate={onNavigate} />
              </FadeInUp>
            ))}
          </div>

          <FadeInUp delayMs={280 + sections.length * 100 + 120} className="mt-12 text-center md:mt-16">
            <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona una sección para comenzar tu aprendizaje</p>
          </FadeInUp>
        </div>
      </main>
    </div>
  );
}
