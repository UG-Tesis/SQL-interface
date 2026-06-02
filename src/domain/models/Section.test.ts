import { describe, expect, it } from 'vitest';
import { isSectionId, SECTION_IDS } from './Section';

describe('isSectionId', () => {
  it.each(SECTION_IDS)('acepta el id de sección válido "%s"', (id) => {
    expect(isSectionId(id)).toBe(true);
  });

  it('rechaza ids desconocidos o vacíos', () => {
    expect(isSectionId('curso-extra')).toBe(false);
    expect(isSectionId('')).toBe(false);
    expect(isSectionId(undefined)).toBe(false);
  });
});
