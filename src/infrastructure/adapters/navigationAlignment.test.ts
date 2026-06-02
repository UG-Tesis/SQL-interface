import { describe, expect, it } from 'vitest';
import { SECTION_IDS } from '../../domain/models/Section';
import { InMemorySectionAdapter } from './InMemorySectionAdapter';
import { InMemorySubNavAdapter } from './InMemorySubNavAdapter';
import { InMemoryTopicAdapter } from './InMemoryTopicAdapter';

const topicAdapter = new InMemoryTopicAdapter();
const subNavAdapter = new InMemorySubNavAdapter();
const sectionAdapter = new InMemorySectionAdapter();

describe('alineación de navegación (adaptadores en memoria)', () => {
  it('cada sección registrada tiene al menos un tema', () => {
    for (const sectionId of SECTION_IDS) {
      expect(topicAdapter.getTopicsBySectionId(sectionId).length).toBeGreaterThan(0);
    }
  });

  it('los ids de subnavegación coinciden con los temas de la misma sección', () => {
    for (const sectionId of SECTION_IDS) {
      const topics = topicAdapter.getTopicsBySectionId(sectionId);
      const subNav = subNavAdapter.getItemsBySection(sectionId);

      expect(subNav.map((item) => item.id)).toEqual(topics.map((topic) => topic.id));
      expect(subNav.map((item) => item.label)).toEqual(topics.map((topic) => topic.title));
    }
  });

  it('todos los temas pertenecen a una sección conocida', () => {
    for (const sectionId of SECTION_IDS) {
      for (const topic of topicAdapter.getTopicsBySectionId(sectionId)) {
        expect(SECTION_IDS).toContain(topic.sectionId);
        expect(topic.sectionId).toBe(sectionId);
      }
    }
  });

  it('cada id de tema es recuperable de forma global', () => {
    for (const sectionId of SECTION_IDS) {
      for (const topic of topicAdapter.getTopicsBySectionId(sectionId)) {
        expect(topicAdapter.getTopicById(topic.id)).toEqual(topic);
      }
    }
  });

  it('las secciones del catálogo usan los mismos ids que SECTION_IDS', () => {
    const catalogIds = sectionAdapter.getAllSections().map((s) => s.id);
    expect(catalogIds).toEqual([...SECTION_IDS]);
  });
});

describe('orden esperado del curso (c1–c5)', () => {
  it('mantiene la secuencia didáctica del módulo curso', () => {
    const cursoIds = subNavAdapter.getItemsBySection('curso').map((item) => item.id);
    expect(cursoIds).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
  });
});
