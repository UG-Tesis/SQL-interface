import type { Section, SectionId } from '../../domain/models/Section';
import { FadeInUp } from '../components/FadeInUp';
import { PageBackdrop } from '../components/PageBackdrop';
import { SectionCard } from '../components/SectionCard';
import { SiteHeader } from '../components/SiteHeader';

interface DashboardPageProps {
  sections: Section[];
  onNavigate: (id: SectionId) => void;
  onNavigateToHome: () => void;
}

export function DashboardPage({ sections, onNavigate, onNavigateToHome }: DashboardPageProps) {
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
