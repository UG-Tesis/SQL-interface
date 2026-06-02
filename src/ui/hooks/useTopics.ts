import { useMemo } from 'react';
import { GetTopicsUseCase } from '../../application/usecases/GetTopicsUseCase';
import type { SectionId } from '../../domain/models/Section';
import { InMemoryTopicAdapter } from '../../infrastructure/adapters/InMemoryTopicAdapter';

const topicAdapter = new InMemoryTopicAdapter();
const getTopicsUseCase = new GetTopicsUseCase(topicAdapter);

export function useTopics(sectionId: SectionId | null) {
  const topics = useMemo(
    () => (sectionId ? getTopicsUseCase.getBySectionId(sectionId) : []),
    [sectionId]
  );

  return { topics };
}
