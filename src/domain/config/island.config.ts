export const ISLAND_GAME_ID = 'juego-sql-island';

export interface IslandSchemaTable {
  tabla: string;
  columnas: string;
}

export const ISLAND_SCHEMA_TABLES: IslandSchemaTable[] = [
  { tabla: 'pueblo', columnas: 'pueblo_id, nombre, jefe' },
  { tabla: 'habitante', columnas: 'habitante_id, nombre, pueblo_id, genero, profesion, oro, estado' },
  { tabla: 'objeto', columnas: 'nombre, propietario' },
];

export const ISLAND_MISSIONS_UI = [
  { id: 1, title: 'Explorar la isla', summary: 'SELECT y WHERE' },
  { id: 2, title: 'Buscar aliados', summary: 'AND, OR y LIKE' },
  { id: 3, title: 'Registro y objetos', summary: 'INSERT y UPDATE' },
  { id: 4, title: 'Comercio y trabajo', summary: 'ORDER BY' },
  { id: 5, title: 'Rescatar al piloto', summary: 'JOIN y COUNT' },
  { id: 6, title: 'Agregaciones', summary: 'GROUP BY y AVG' },
  { id: 7, title: 'Confrontación', summary: 'DELETE' },
  { id: 8, title: 'Escapar de la isla', summary: 'UPDATE final' },
] as const;

export const ISLAND_INTRO =
  'Sobrevives a un accidente aéreo y despiertas en SQL Island. Tu meta es escapar resolviendo misiones con SQL. Las tablas están abajo; avanza paso a paso con el botón Continuar cuando completes cada reto.';

export const ISLAND_STEP_NARRATIVES: string[] = [
  '¡Vaya! Parece que soy el único superviviente del accidente aéreo. Afortunadamente aterricé en una isla con varios pueblos. Primero quiero ver qué pueblos hay.',
  'Y también hay muchos habitantes. Muéstrame la lista completa de habitantes.',
  'Tengo mucha hambre. Busca un carnicero al que pueda pedirle un poco de comida.',
  'Gracias Erich. Entonces debo averiguar qué habitantes son amigables.',
  'En algún momento necesitaré una espada. Busca un armero amigable que pueda forjarme una.',
  'Son pocos. Quizá haya más herreros amigables. Prueba profesion LIKE \'%herrero\'.',
  'Hola forastero, soy Pablo, alcalde de Ciudad Mono. Te registraré como habitante.',
  '¿Cuál es mi habitante_id?',
  '¡Hola, Ernesto! ¿Cuánto cuesta una espada?',
  'Vi objetos sin dueño. Lista los objetos cuyo propietario sea NULL.',
  'Recoges la taza de café.',
  '¿Hay algún truco para reclamar el resto de objetos sin dueño?',
  '¿Qué objetos poseo ahora?',
  'Busca habitantes amigables con profesión Mercader o Comerciante.',
  'Me interesan el Anillo y la Tetera; el resto es chatarra. Dame esos dos objetos. Mi habitante_id es 15.',
  'Helga te entrega el oro. Tu saldo aumenta en 120 monedas.',
  'Cambiaré mi nombre de Extranjero a Pedro antes de buscar trabajo.',
  'Muestra panaderos del más rico al más pobre (ORDER BY oro DESC).',
  '¡Hola otra vez! Así que te llamas Pedro. Vi que quieres trabajar de panadero. ¡De acuerdo! Te pagaré 1 de oro por cada 100 panes.',
  '(Ocho horas después…) ¡He hecho diez mil panes! Renuncio. Debería tener oro suficiente para la espada. Veamos qué pasa con mi saldo.',
  '¡Ernesto! Aquí tienes los 150 de oro por la espada.',
  '¿Hay algún piloto en la isla?',
  '¡Dieter Sucio tiene al piloto prisionero! Averigua en qué pueblo vive Dieter (JOIN pueblo y habitante).',
  '¿Cómo se llama el jefe de Villa Cebolla?',
  '¿Cuántos habitantes tiene Villa Cebolla?',
  'Pedro, Dieter tiene al piloto en casa de su hermana. ¿Cuántas mujeres hay en Villa Cebolla?',
  'Solo una mujer. Veamos cómo se llama.',
  '¿Cuánto oro tienen juntos los habitantes de Pueblo Pepino?',
  '¿Cuánto oro tienen mercaderes, comerciantes y panaderos?',
  'Oro total y promedio por profesión, ordenado por promedio.',
  '¿Oro promedio por estado (amigable, hostil, prisionero)?',
  'Eliminaré a Dieter Sucio con mi espada.',
  '¡Oye! ¿Qué harás ahora, Pedro?',
  'Libera al piloto cambiando su estado a amigable.',
  'Marca tu personaje como emigrado para cerrar la partida.',
];

/** Pasos que se completan solo con Continuar (sin SQL del jugador) */
export const ISLAND_AUTO_STEPS = new Set([0, 6, 10, 15, 18, 19, 20, 22, 24, 27, 29, 31]);

/** Aviso en el chat al llegar a un paso automático */
export const ISLAND_AUTO_STEP_PROMPTS: Partial<Record<number, string>> = {
  0: 'Pulsa Continuar para consultar los pueblos de la isla.',
  6: 'Pablo te registra como habitante. Pulsa Continuar para que ejecute el INSERT.',
  10: 'Recoges la taza de café. Pulsa Continuar.',
  15: 'Helga te entrega el oro. Pulsa Continuar.',
  18: 'Pablo te contrata como panadero. Pulsa Continuar.',
  19: 'Terminas el turno en la panadería. Pulsa Continuar.',
  20: 'Pagas la espada a Ernesto y se registra en tu inventario. Pulsa Continuar.',
  22: 'Se localiza el pueblo de Dieter Sucio con JOIN. Pulsa Continuar.',
  24: 'Se cuenta cuántos habitantes tiene Villa Cebolla. Pulsa Continuar.',
  27: 'Se suma el oro de todos los habitantes de Pueblo Pepino. Pulsa Continuar.',
  29: 'Se calcula oro total y promedio por profesión. Pulsa Continuar.',
  31: 'Tu personaje elimina a Dieter Sucio con la espada. Pulsa Continuar.',
};

export type IslandSqlTaskKind = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export interface IslandSqlTask {
  kind: IslandSqlTaskKind;
  instruction: string;
}

/** Orden SQL que debe escribir el jugador en cada paso (null = paso automático) */
export const ISLAND_STEP_SQL_TASKS: (IslandSqlTask | null)[] = [
  null,
  { kind: 'SELECT', instruction: 'Lista todos los habitantes.' },
  { kind: 'SELECT', instruction: 'Busca un carnicero.' },
  { kind: 'SELECT', instruction: 'Lista habitantes con estado amigable.' },
  { kind: 'SELECT', instruction: 'Busca un armero amigable (usa AND).' },
  { kind: 'SELECT', instruction: 'Busca herreros amigables con LIKE.' },
  null,
  { kind: 'SELECT', instruction: 'Obtén tu habitante_id (nombre Extranjero).' },
  { kind: 'SELECT', instruction: 'Consulta cuánto oro tienes (nombre Extranjero).' },
  { kind: 'SELECT', instruction: 'Lista objetos sin dueño (propietario IS NULL).' },
  null,
  {
    kind: 'UPDATE',
    instruction: 'Reclama el resto de objetos sin dueño (propietario = 20).',
  },
  { kind: 'SELECT', instruction: 'Lista los objetos que te pertenecen.' },
  {
    kind: 'SELECT',
    instruction: 'Mercader o Comerciante, solo amigables (OR y paréntesis).',
  },
  {
    kind: 'UPDATE',
    instruction: 'Helga pidió Anillo y Tetera. Transfiérelos a habitante_id 15.',
  },
  null,
  { kind: 'UPDATE', instruction: 'Cambia tu nombre de Extranjero a Pedro.' },
  {
    kind: 'SELECT',
    instruction: 'Lista panaderos del más rico al más pobre (ORDER BY oro DESC).',
  },
  null,
  null,
  null,
  { kind: 'SELECT', instruction: '¿Hay algún piloto en la isla?' },
  null,
  {
    kind: 'SELECT',
    instruction: 'JOIN: nombre del jefe de Villa Cebolla.',
  },
  null,
  {
    kind: 'SELECT',
    instruction: 'Cuenta mujeres en Villa Cebolla (genero = f).',
  },
  { kind: 'SELECT', instruction: 'Nombre de la única mujer de Villa Cebolla.' },
  null,
  {
    kind: 'SELECT',
    instruction: 'Suma el oro de mercaderes, comerciantes y panaderos.',
  },
  null,
  { kind: 'SELECT', instruction: 'Promedio de oro por estado (GROUP BY estado).' },
  null,
  { kind: 'DELETE', instruction: 'Elimina a Dorotea Sucia.' },
  { kind: 'UPDATE', instruction: 'Libera al piloto (estado amigable).' },
  { kind: 'UPDATE', instruction: 'Marca tu personaje como emigrado.' },
];

export function getIslandSqlTaskForStep(stepIndex: number): IslandSqlTask | null {
  if (ISLAND_AUTO_STEPS.has(stepIndex)) return null;
  return ISLAND_STEP_SQL_TASKS[stepIndex] ?? null;
}

/** Tras cuántos intentos fallidos se muestra la pista automática */
export const ISLAND_HINT_AFTER_FAILURES = 3;

/** Pistas escalonadas por paso (null = paso automático o sin pista) */
export const ISLAND_STEP_HINTS: (string | null)[] = [
  null,
  'Usa SELECT * FROM habitante para ver toda la tabla.',
  "Filtra con WHERE profesion = 'Carnicero'.",
  "Filtra con WHERE estado = 'amigable'.",
  "Combina profesion = 'Armero' AND estado = 'amigable'.",
  "Prueba profesion LIKE '%herrero' AND estado = 'amigable'.",
  null,
  "SELECT habitante_id FROM habitante WHERE nombre = 'Extranjero'.",
  "SELECT oro FROM habitante WHERE nombre = 'Extranjero'.",
  'Usa WHERE propietario IS NULL en la tabla objeto.',
  null,
  'UPDATE objeto SET propietario = 20 WHERE propietario IS NULL.',
  'SELECT * FROM objeto WHERE propietario = 20.',
  "Usa paréntesis: (profesion = 'Mercader' OR profesion = 'Comerciante') AND estado = 'amigable'.",
  "UPDATE objeto SET propietario = 15 WHERE nombre = 'Tetera' OR nombre = 'Anillo'.",
  null,
  "UPDATE habitante SET nombre = 'Pedro' WHERE habitante_id = 20.",
  "SELECT * FROM habitante WHERE profesion = 'Panadero' ORDER BY oro DESC.",
  null,
  null,
  null,
  "SELECT * FROM habitante WHERE profesion = 'Piloto'.",
  null,
  "Une pueblo.jefe con habitante.habitante_id; filtra pueblo.nombre = 'Villa Cebolla'.",
  null,
  "COUNT(*) con JOIN a pueblo, Villa Cebolla y genero = 'f'.",
  "SELECT habitante.nombre con JOIN, Villa Cebolla y genero = 'f'.",
  null,
  "SUM(habitante.oro) con OR para Mercader, Comerciante y Panadero.",
  null,
  'SELECT estado, AVG(habitante.oro) FROM habitante GROUP BY estado.',
  null,
  "DELETE FROM habitante WHERE nombre = 'Dorotea Sucia'.",
  "UPDATE habitante SET estado = 'amigable' WHERE profesion = 'Piloto'.",
  "UPDATE habitante SET estado = 'emigrado' WHERE habitante_id = 20.",
];

export function getIslandHintForStep(stepIndex: number): string | null {
  if (ISLAND_AUTO_STEPS.has(stepIndex)) return null;
  return ISLAND_STEP_HINTS[stepIndex] ?? null;
}

const MISSION_STEP_BOUNDARIES = [4, 6, 13, 21, 27, 31, 33, 35];

export function getIslandMissionIndexForStep(stepIndex: number): number {
  for (let i = 0; i < MISSION_STEP_BOUNDARIES.length; i++) {
    if (stepIndex < MISSION_STEP_BOUNDARIES[i]) return i;
  }
  return 7;
}

export const ISLAND_TOTAL_STEPS = ISLAND_STEP_NARRATIVES.length;
