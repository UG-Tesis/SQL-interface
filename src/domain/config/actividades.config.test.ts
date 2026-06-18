import { describe, expect, it } from 'vitest';
import {
  getEditorPlaceholder,
  getExpectedSqlKeyword,
  getPracticeInstruction,
  isReadyForLiveValidation,
} from './actividades.config';

describe('actividades.config · validación en vivo', () => {
  it('módulo 2 espera INSERT, UPDATE, INSERT (inscripción) y DELETE según la actividad', () => {
    expect(getExpectedSqlKeyword(2, 1)).toBe('INSERT');
    expect(getExpectedSqlKeyword(2, 2)).toBe('UPDATE');
    expect(getExpectedSqlKeyword(2, 3)).toBe('INSERT');
    expect(getExpectedSqlKeyword(2, 4)).toBe('DELETE');
  });

  it('módulos 3+ esperan SELECT', () => {
    expect(getExpectedSqlKeyword(3, 1)).toBe('SELECT');
    expect(getExpectedSqlKeyword(5, 11)).toBe('SELECT');
  });

  it('no valida en vivo hasta detectar la palabra clave esperada', () => {
    expect(isReadyForLiveValidation('sel', 3, 1)).toBe(false);
    expect(isReadyForLiveValidation('SELECT nombre', 3, 1)).toBe(true);
    expect(isReadyForLiveValidation('UPDATE practica', 2, 2)).toBe(true);
    expect(isReadyForLiveValidation('INSERT INTO', 2, 1)).toBe(true);
  });

  it('provee instrucciones y placeholders distintos por módulo', () => {
    expect(getPracticeInstruction(2)).toMatch(/DML/i);
    expect(getPracticeInstruction(4)).toMatch(/GROUP BY|LIMIT/i);
    expect(getEditorPlaceholder(2, 3)).toMatch(/practica_inscripciones/i);
    expect(getEditorPlaceholder(4, 1)).toMatch(/SELECT/i);
  });
});
