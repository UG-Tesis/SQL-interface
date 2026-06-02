import type { SectionId } from './Section';

export interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
  sectionId: SectionId;
}
