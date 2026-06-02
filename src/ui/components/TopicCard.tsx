import type { Topic } from '../../domain/models/Topic';
import { DclTopicBody } from './DclTopicBody';
import { DdlTopicBody } from './DdlTopicBody';
import { DmlTopicBody } from './DmlTopicBody';
import { DqlTopicBody } from './DqlTopicBody';
import { TopicArticle } from './TopicArticle';

interface TopicCardProps {
  topic: Topic;
}

function topicBody(topic: Topic) {
  if (topic.id === 'c2') return <DmlTopicBody />;
  if (topic.id === 'c3') return <DqlTopicBody />;
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
          <DdlTopicBody />
        </TopicArticle>
        <TopicArticle
          title="Lenguaje de Control de Datos (DCL)"
          description="Administra permisos sobre objetos y esquemas con GRANT y REVOKE."
        >
          <DclTopicBody />
        </TopicArticle>
      </div>
    );
  }

  return (
    <TopicArticle title={topic.title} description={topic.description || undefined}>
      {topicBody(topic)}
    </TopicArticle>
  );
}
