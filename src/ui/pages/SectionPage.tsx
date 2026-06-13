import { useMemo } from 'react';
import type { SectionId } from '../../domain/models/Section';
import type { Topic } from '../../domain/models/Topic';
import { isCursoTopicId } from '../../domain/config/cursoModules.config';
import { ActividadesPracticePanel } from '../components/ActividadesPracticePanel';
import { FadeInUp } from '../components/FadeInUp';
import { PageBackdrop } from '../components/PageBackdrop';
import { TopicCard } from '../components/TopicCard';
import { useCursoProgress } from '../session/CursoProgressContext';

interface SectionPageProps {
  sectionId: SectionId;
  topics: Topic[];
  activeSubNavId?: string | null;
}

function LockedModuleMessage({ topicTitle }: { topicTitle: string }) {
  return (
    <FadeInUp delayMs={120}>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{topicTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Este módulo aún no está habilitado. Completa el módulo anterior y marca tu avance para
          desbloquearlo.
        </p>
      </div>
    </FadeInUp>
  );
}

export function SectionPage({ sectionId, topics, activeSubNavId }: SectionPageProps) {
  const { isModuleEnabled, loading } = useCursoProgress();

  const visibleTopics = useMemo(() => {
    if (topics.length === 0) return [];
    const id = activeSubNavId ?? topics[0].id;
    const match = topics.find((t) => t.id === id);
    return match ? [match] : [topics[0]];
  }, [activeSubNavId, topics]);

  const wideCursoTopicIds = new Set(['c1', 'c2', 'c3', 'c4', 'c5']);
  const isCursoWideLayout =
    sectionId === 'curso' &&
    visibleTopics.length === 1 &&
    wideCursoTopicIds.has(visibleTopics[0]?.id ?? '');
  const isActividadesLayout = sectionId === 'actividad';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageBackdrop />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-8 md:py-10">
        <div
          className={`mx-auto w-full space-y-6 ${
            isActividadesLayout || isCursoWideLayout ? 'max-w-6xl xl:max-w-7xl' : 'max-w-3xl'
          }`}
        >
          {sectionId === 'actividad' ? (
            <ActividadesPracticePanel activeSubNavId={activeSubNavId} />
          ) : visibleTopics.length > 0 ? (
            visibleTopics.map((topic, index) => {
              const isCursoTopic = isCursoTopicId(topic.id);
              const moduleLocked = isCursoTopic && !loading && !isModuleEnabled(topic.id);

              if (moduleLocked) {
                return <LockedModuleMessage key={topic.id} topicTitle={topic.title} />;
              }

              return (
                <FadeInUp key={topic.id} delayMs={120 + index * 110}>
                  <TopicCard topic={topic} />
                </FadeInUp>
              );
            })
          ) : (
            <FadeInUp delayMs={120} className="py-16 text-center">
              <p className="text-lg text-slate-500">
                No hay contenido disponible aún para esta sección.
              </p>
            </FadeInUp>
          )}
        </div>
      </div>
    </div>
  );
}
