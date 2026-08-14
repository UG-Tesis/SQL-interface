const CLAUSE_LABELS: Record<string, string> = {
  'field list': 'la lista de columnas',
  'where clause': 'el WHERE',
  'order clause': 'el ORDER BY',
  'group statement': 'el GROUP BY',
  'having clause': 'el HAVING',
  'on clause': 'el ON',
};

function stripSchema(identifier: string): string {
  const cleaned = identifier.replace(/`/g, '').trim();
  const parts = cleaned.split('.');
  return parts[parts.length - 1] ?? cleaned;
}

function translateKnownSqlError(text: string): string | null {
  const tableMissing = text.match(/Table ['`]([^'`]+)['`] doesn't exist/i);
  if (tableMissing) {
    return `La tabla '${stripSchema(tableMissing[1])}' no existe.`;
  }

  const unknownTable = text.match(/Unknown table ['`]([^'`]+)['`]/i);
  if (unknownTable) {
    return `La tabla '${stripSchema(unknownTable[1])}' no existe.`;
  }

  const unknownColumn = text.match(
    /Unknown column ['`]([^'`]+)['`] in ['`]([^'`]+)['`]/i,
  );
  if (unknownColumn) {
    const column = unknownColumn[1];
    const place = unknownColumn[2].toLowerCase();
    if (place === 'where clause') {
      return `No existe la columna '${column}' en el WHERE. Si es un texto, escríbelo entre comillas: '${column}'.`;
    }
    const placeEs = CLAUSE_LABELS[place] ?? `'${unknownColumn[2]}'`;
    return `No existe la columna '${column}' en ${placeEs}.`;
  }

  const ambiguous = text.match(
    /Column ['`]([^'`]+)['`] in (?:field list|where clause) is ambiguous/i,
  );
  if (ambiguous) {
    return `La columna '${ambiguous[1]}' es ambigua: indica la tabla, por ejemplo tabla.${ambiguous[1]}.`;
  }

  const syntax = text.match(
    /You have an error in your SQL syntax[\s\S]*near ['`]([\s\S]*?)['`] at line (\d+)/i,
  );
  if (syntax) {
    return `Hay un error de sintaxis SQL cerca de '${syntax[1]}' (línea ${syntax[2]}).`;
  }

  const syntaxGeneric = /You have an error in your SQL syntax/i.test(text);
  if (syntaxGeneric) {
    return 'Hay un error de sintaxis en la consulta SQL.';
  }

  const columnCount = text.match(
    /Column count doesn't match value count at row (\d+)/i,
  );
  if (columnCount) {
    return `El número de columnas no coincide con el número de valores (fila ${columnCount[1]}).`;
  }

  const duplicate = text.match(/Duplicate entry ['`]([^'`]+)['`] for key ['`]([^'`]+)['`]/i);
  if (duplicate) {
    return `El valor '${duplicate[1]}' ya existe (clave '${stripSchema(duplicate[2])}').`;
  }

  const cannotNull = text.match(/Column ['`]([^'`]+)['`] cannot be null/i);
  if (cannotNull) {
    return `La columna '${cannotNull[1]}' no puede ser NULL.`;
  }

  const noDefault = text.match(/Field ['`]([^'`]+)['`] doesn't have a default value/i);
  if (noDefault) {
    return `La columna '${noDefault[1]}' no tiene un valor por defecto. Debes indicarla en el INSERT.`;
  }

  const incorrectValue = text.match(
    /Incorrect (\w+) value: ['`]([^'`]+)['`] for column ['`]([^'`]+)['`] at row (\d+)/i,
  );
  if (incorrectValue) {
    return `Valor '${incorrectValue[2]}' incorrecto para la columna '${incorrectValue[3]}' (fila ${incorrectValue[4]}).`;
  }

  const truncated = text.match(
    /Data truncated for column ['`]([^'`]+)['`] at row (\d+)/i,
  );
  if (truncated) {
    return `El valor de la columna '${truncated[1]}' es demasiado largo o no es válido (fila ${truncated[2]}).`;
  }

  const outOfRange = text.match(
    /Out of range value for column ['`]([^'`]+)['`] at row (\d+)/i,
  );
  if (outOfRange) {
    return `El valor de la columna '${outOfRange[1]}' está fuera de rango (fila ${outOfRange[2]}).`;
  }

  if (/Operand should contain 1 column\(s\)/i.test(text)) {
    return 'La subconsulta debe devolver una sola columna.';
  }

  if (/Subquery returns more than 1 row/i.test(text)) {
    return 'La subconsulta devolvió más de una fila.';
  }

  if (/Every derived table must have its own alias/i.test(text)) {
    return 'Cada subconsulta en el FROM debe tener un alias, por ejemplo: FROM (...) AS t.';
  }

  const notUnique = text.match(/Not unique table\/alias: ['`]([^'`]+)['`]/i);
  if (notUnique) {
    return `El alias o nombre de tabla '${notUnique[1]}' está repetido.`;
  }

  const unknownFunction = text.match(/FUNCTION (?:[\w.]+\.)?(\w+) does not exist/i);
  if (unknownFunction) {
    return `La función '${unknownFunction[1]}' no existe.`;
  }

  if (/The used SELECT statements have a different number of columns/i.test(text)) {
    return 'Los SELECT del UNION no tienen el mismo número de columnas.';
  }

  if (/Cannot add or update a child row: a foreign key constraint fails/i.test(text)) {
    return 'No se puede insertar o actualizar: el valor no existe en la tabla relacionada (clave foránea).';
  }

  if (/Cannot delete or update a parent row: a foreign key constraint fails/i.test(text)) {
    return 'No se puede borrar o actualizar: hay filas relacionadas en otra tabla (clave foránea).';
  }

  const targetTable = text.match(
    /You can't specify target table ['`]([^'`]+)['`] for update in FROM clause/i,
  );
  if (targetTable) {
    return `No puedes modificar la tabla '${stripSchema(targetTable[1])}' y leerla a la vez en el FROM.`;
  }

  if (/Query was empty/i.test(text)) {
    return 'La consulta está vacía.';
  }

  return null;
}

export function translateSqlError(message: string): string {
  const text = message.trim();
  if (!text) return message;

  const translated = translateKnownSqlError(text);
  if (translated) return translated;

  return text;
}
