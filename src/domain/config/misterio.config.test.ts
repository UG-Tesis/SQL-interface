import { describe, expect, it } from 'vitest';
import {
  getMisterioGameMode,
  MISTERIO_EXPERTO_ID,
  MISTERIO_QUICK_START,
} from './misterio.config';

describe('misterio.config', () => {
  it('usa el modo experto como único modo de juego', () => {
    expect(getMisterioGameMode()).toBe('experto');
    expect(MISTERIO_EXPERTO_ID).toBe('juego-misterio-experto');
  });

  it('define una consulta inicial para el informe del crimen', () => {
    expect(MISTERIO_QUICK_START.sql).toMatch(/informe_escena_crimen/i);
    expect(MISTERIO_QUICK_START.sql).toMatch(/asesinato/i);
  });
});
