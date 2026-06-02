import { useMemo } from 'react';
import type { Topic } from '../../domain/models/Topic';
import { FadeInUp } from '../components/FadeInUp';
import { PageBackdrop } from '../components/PageBackdrop';
import { TopicCard } from '../components/TopicCard';

interface SectionPageProps {
  topics: Topic[];
  activeSubNavId?: string | null;
}

export function SectionPage({ topics, activeSubNavId }: SectionPageProps) {
  const visibleTopics = useMemo(() => {
    if (topics.length === 0) return [];
    const id = activeSubNavId ?? topics[0].id;
    const match = topics.find((t) => t.id === id);
    return match ? [match] : [topics[0]];
  }, [activeSubNavId, topics]);

  const wideCursoTopicIds = new Set(['c1', 'c2', 'c3']);
  const isCursoWideLayout =
    visibleTopics.length === 1 && wideCursoTopicIds.has(visibleTopics[0]?.id ?? '');

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageBackdrop />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-8 md:py-10">
        <div
          className={`mx-auto w-full space-y-6 ${isCursoWideLayout ? 'max-w-6xl xl:max-w-7xl' : 'max-w-3xl'}`}
        >
          {visibleTopics.length > 0 ? (
            visibleTopics.map((topic, index) => (
              <FadeInUp key={topic.id} delayMs={120 + index * 110}>
                <TopicCard topic={topic} />
              </FadeInUp>
            ))
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
