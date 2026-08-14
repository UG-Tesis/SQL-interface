import { describe, expect, it } from 'vitest';
import { translateSqlError } from './translateSqlError';

describe('translateSqlError', () => {
  it('traduce tabla inexistente y oculta el esquema de sesión', () => {
    expect(
      translateSqlError(
        "Table 'tesis_island_091e3c4b95651ee902d277c816317daf.habitantes' doesn't exist",
      ),
    ).toBe("La tabla 'habitantes' no existe.");
  });

  it('traduce columna desconocida en el WHERE y recuerda las comillas', () => {
    expect(translateSqlError("Unknown column 'carnicero' in 'where clause'")).toBe(
      "No existe la columna 'carnicero' en el WHERE. Si es un texto, escríbelo entre comillas: 'carnicero'.",
    );
  });

  it('traduce columna desconocida en la lista de campos', () => {
    expect(translateSqlError("Unknown column 'nombrex' in 'field list'")).toBe(
      "No existe la columna 'nombrex' en la lista de columnas.",
    );
  });

  it('traduce errores de sintaxis con el fragmento cercano', () => {
    expect(
      translateSqlError(
        "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'FROM' at line 1",
      ),
    ).toBe("Hay un error de sintaxis SQL cerca de 'FROM' (línea 1).");
  });

  it('deja intactos los mensajes que ya están en español', () => {
    expect(translateSqlError('La consulta no resuelve este paso.')).toBe(
      'La consulta no resuelve este paso.',
    );
  });
});
