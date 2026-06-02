import type { SectionId } from '../../domain/models/Section';
import type { Topic } from '../../domain/models/Topic';
import type { TopicPort } from '../../domain/ports/TopicPort';

export class GetTopicsUseCase {
  private topicRepository: TopicPort;

  constructor(topicRepository: TopicPort) {
    this.topicRepository = topicRepository;
  }

  getBySectionId(sectionId: SectionId): Topic[] {
    return this.topicRepository.getTopicsBySectionId(sectionId);
  }

  getById(id: string): Topic | undefined {
    return this.topicRepository.getTopicById(id);
  }
}
