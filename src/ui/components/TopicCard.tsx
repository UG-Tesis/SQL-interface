import { lazy, Suspense } from 'react';
import type { Topic } from '../../domain/models/Topic';
import { RouteLoader } from './RouteLoader';
import { TopicArticle } from './TopicArticle';

const DclTopicBody = lazy(() =>
  import('./DclTopicBody').then((module) => ({ default: module.DclTopicBody })),
);
const DdlTopicBody = lazy(() =>
  import('./DdlTopicBody').then((module) => ({ default: module.DdlTopicBody })),
);
const DmlTopicBody = lazy(() =>
  import('./DmlTopicBody').then((module) => ({ default: module.DmlTopicBody })),
);
const DqlAdvancedTopicBody = lazy(() =>
  import('./DqlAdvancedTopicBody').then((module) => ({ default: module.DqlAdvancedTopicBody })),
);
const DqlJoinFiltersTopicBody = lazy(() =>
  import('./DqlJoinFiltersTopicBody').then((module) => ({
    default: module.DqlJoinFiltersTopicBody,
  })),
);
const DqlTopicBody = lazy(() =>
  import('./DqlTopicBody').then((module) => ({ default: module.DqlTopicBody })),
);

interface TopicCardProps {
  topic: Topic;
}

function TopicBodyFallback() {
  return <RouteLoader />;
}

function topicBody(topic: Topic) {
  if (topic.id === 'c2') {
    return (
      <Suspense fallback={<TopicBodyFallback />}>
        <DmlTopicBody />
      </Suspense>
    );
  }
  if (topic.id === 'c3') {
    return (
      <Suspense fallback={<TopicBodyFallback />}>
        <DqlTopicBody />
      </Suspense>
    );
  }
  if (topic.id === 'c4') {
    return (
      <Suspense fallback={<TopicBodyFallback />}>
        <DqlAdvancedTopicBody />
      </Suspense>
    );
  }
  if (topic.id === 'c5') {
    return (
      <Suspense fallback={<TopicBodyFallback />}>
        <DqlJoinFiltersTopicBody />
      </Suspense>
    );
  }
  if (topic.content) {
    return (
      <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
        {topic.content}
      </div>
    );
  }
  return null;
}

/**
 * Tarjeta de tema: un article por bloque; el tema c1 muestra DDL y DCL por separado.
 */
export function TopicCard({ topic }: TopicCardProps) {
  if (topic.id === 'c1') {
    return (
      <div className="space-y-6">
        <TopicArticle
          title="Lenguaje de Definición de Datos (DDL)"
          description="Define y modifica la estructura de bases de datos, tablas e índices con CREATE, ALTER, DROP y TRUNCATE."
        >
          <Suspense fallback={<TopicBodyFallback />}>
            <DdlTopicBody />
          </Suspense>
        </TopicArticle>
        <TopicArticle
          title="Lenguaje de Control de Datos (DCL)"
          description="Administra permisos sobre objetos y esquemas con GRANT y REVOKE."
        >
          <Suspense fallback={<TopicBodyFallback />}>
            <DclTopicBody />
          </Suspense>
        </TopicArticle>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TopicArticle title={topic.title} description={topic.description || undefined}>
        {topicBody(topic)}
      </TopicArticle>
    </div>
  );
}
