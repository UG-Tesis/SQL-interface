import type { SectionId } from '../../domain/models/Section';
import type { SubNavItem } from '../../domain/models/SubNavItem';
import type { SubNavPort } from '../../domain/ports/SubNavPort';
import { InMemoryTopicAdapter } from './InMemoryTopicAdapter';

const topicAdapter = new InMemoryTopicAdapter();

export class InMemorySubNavAdapter implements SubNavPort {
  getItemsBySection(sectionId: SectionId): SubNavItem[] {
    return topicAdapter.getTopicsBySectionId(sectionId).map((topic) => ({
      id: topic.id,
      label: topic.title,
    }));
  }
}
