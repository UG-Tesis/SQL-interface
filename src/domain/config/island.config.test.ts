import { describe, expect, it } from 'vitest';
import {
  ISLAND_AUTO_STEPS,
  ISLAND_STEP_NARRATIVES,
  ISLAND_STEP_SOLUTIONS,
  ISLAND_TOTAL_STEPS,
  getIslandSqlTemplateForStep,
} from './island.config';

describe('island.config · soluciones y plantillas', () => {
  it('tiene 35 pasos narrativos y 35 entradas de solución', () => {
    expect(ISLAND_TOTAL_STEPS).toBe(35);
    expect(ISLAND_STEP_NARRATIVES).toHaveLength(35);
    expect(ISLAND_STEP_SOLUTIONS).toHaveLength(35);
  });

  it('genera plantilla abstracta en cada paso con SQL del jugador', () => {
    const playerStepIndexes = ISLAND_STEP_SOLUTIONS.map((solution, index) => ({
      index,
      solution,
    })).filter(({ index, solution }) => solution != null && !ISLAND_AUTO_STEPS.has(index));

    expect(playerStepIndexes).toHaveLength(23);

    for (const { index } of playerStepIndexes) {
      const template = getIslandSqlTemplateForStep(index);
      expect(template, `paso ${index}`).toBeTruthy();
      expect(template!).toMatch(/___/);
      expect(template!).toMatch(/;$/);
      expect(template!.toLowerCase()).not.toContain('habitante');
      expect(template!.toLowerCase()).not.toContain('pueblo');
      expect(template!.toLowerCase()).not.toContain('objeto');
    }
  });

  it('no genera plantilla en pasos automáticos', () => {
    for (const index of ISLAND_AUTO_STEPS) {
      expect(getIslandSqlTemplateForStep(index)).toBeNull();
    }
  });
});
