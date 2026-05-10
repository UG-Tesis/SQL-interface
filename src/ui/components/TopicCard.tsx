import type { Topic } from '../../domain/models/Topic';
import { DdlTopicBody } from './DdlTopicBody';
import { DmlTopicBody } from './DmlTopicBody';

interface TopicCardProps {
  topic: Topic;
}

/**
 * Tarjeta de tema para la vista de sección (estilo alineado con el fondo animado).
 */
export function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
      <h4
        className={`text-lg font-semibold text-slate-800 ${topic.id === 'c1' || topic.id === 'c2' ? 'text-center' : ''}`}
      >
        {topic.title}
      </h4>
      {topic.description ? (
        <p className="mt-1 text-sm text-slate-500">{topic.description}</p>
      ) : null}
      {topic.id === 'c1' ? (
        <DdlTopicBody />
      ) : topic.id === 'c2' ? (
        <DmlTopicBody />
      ) : topic.content ? (
        <div className="mt-5 border-t border-slate-200/80 pt-5 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
          {topic.content}
        </div>
      ) : null}
    </div>
  );
}
