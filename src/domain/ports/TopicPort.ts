import type { SectionId } from '../models/Section';
import type { Topic } from '../models/Topic';

export interface TopicPort {
  getTopicsBySectionId(sectionId: SectionId): Topic[];
  getTopicById(id: string): Topic | undefined;
}
