import type { Section, SectionId } from '../../domain/models/Section';
import { AnimatedBackdrop } from '../components/AnimatedBackdrop';
import { FadeInUp } from '../components/FadeInUp';
import { GradientTitle } from '../components/GradientTitle';
import { SectionCard } from '../components/SectionCard';

interface DashboardPageProps {
  sections: Section[];
  onNavigate: (id: SectionId) => void;
}

export function DashboardPage({ sections, onNavigate }: DashboardPageProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-8 py-8">
      <AnimatedBackdrop />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-12">
          <GradientTitle>SQL</GradientTitle>
          <FadeInUp delayMs={180}>
            <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-slate-600">
              Plataforma interactiva de aprendizaje de sentencias SQL para
              estudiantes de 5to semestre universitario
            </p>
          </FadeInUp>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {sections.map((section, index) => (
            <FadeInUp key={section.id} delayMs={320 + index * 110}>
              <SectionCard section={section} onNavigate={onNavigate} />
            </FadeInUp>
          ))}
        </div>

        <FadeInUp delayMs={320 + sections.length * 110 + 80} className="mt-16">
          <p className="text-sm text-slate-400">
            Selecciona una sección para comenzar tu aprendizaje
          </p>
        </FadeInUp>
      </div>
    </div>
  );
}
