import { lazy, Suspense, useMemo } from 'react';
import type { SectionId } from '../../domain/models/Section';
import type { Topic } from '../../domain/models/Topic';
import { PageBackdrop } from '../components/PageBackdrop';
import { RouteLoader } from '../components/RouteLoader';
import { TopicCard } from '../components/TopicCard';

const ActividadesPracticePanel = lazy(() =>
  import('../components/ActividadesPracticePanel').then((module) => ({
    default: module.ActividadesPracticePanel,
  })),
);

const MisterioGamePanel = lazy(() =>
  import('../components/MisterioGamePanel').then((module) => ({
    default: module.MisterioGamePanel,
  })),
);

interface SectionPageProps {
  sectionId: SectionId;
  topics: Topic[];
  activeSubNavId?: string | null;
}

export function SectionPage({ sectionId, topics, activeSubNavId }: SectionPageProps) {
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
  const isJuegosLayout = sectionId === 'juegos';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageBackdrop />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-8 md:py-10">
        <div
          className={`mx-auto w-full space-y-6 ${
            isActividadesLayout || isJuegosLayout || isCursoWideLayout
              ? 'max-w-6xl xl:max-w-7xl'
              : 'max-w-3xl'
          }`}
        >
          {sectionId === 'actividad' ? (
            <Suspense fallback={<RouteLoader />}>
              <ActividadesPracticePanel activeSubNavId={activeSubNavId} />
            </Suspense>
          ) : sectionId === 'juegos' ? (
            <Suspense fallback={<RouteLoader />}>
              <MisterioGamePanel />
            </Suspense>
          ) : visibleTopics.length > 0 ? (
            visibleTopics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-slate-500">
                No hay contenido disponible aún para esta sección.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
