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
  'Vi objetos sin dueño. Lista los objetos cuyo propietario sea NULL.',
  '¿Puedo reclamar de una vez todos los objetos sin dueño?',
  '¿Qué objetos poseo ahora?',
  'Busca habitantes amigables con profesión Mercader o Comerciante.',
  'Me interesan el Anillo y la Tetera. Dame esos objetos (Helga, id 15).',
  'Helga te entrega el oro. Tu saldo aumenta en 120 monedas.',
  'Cambiaré mi nombre de Extranjero a Pedro antes de buscar trabajo.',
  'Muestra panaderos del más rico al más pobre (ORDER BY oro DESC).',
  'Pagas 150 de oro por la espada tras ganar 100 trabajando.',
  'Registra mi nueva espada como objeto que me pertenece.',
  '¿Hay algún piloto en la isla?',
  'Averigua en qué pueblo vive Dieter Sucio (JOIN pueblo y habitante).',
  '¿Cómo se llama el jefe de Villa Cebolla?',
  '¿Cuántos habitantes tiene Villa Cebolla?',
  '¿Cuántas mujeres hay en Villa Cebolla?',
  '¿Cómo se llama la única mujer de Villa Cebolla?',
  '¿Cuánto oro tienen juntos los habitantes de Pueblo Pepino?',
  '¿Cuánto oro tienen mercaderes, comerciantes y panaderos?',
  'Oro total y promedio por profesión, ordenado por promedio.',
  '¿Oro promedio por estado (amigable, hostil, prisionero)?',
  'Eliminaré a Dieter Sucio con mi espada.',
  '¡Oye! ¿Qué harás ahora, Pedro? (Dorotea Sucia)',
  'Libera al piloto cambiando su estado a amigable.',
  'Marca tu personaje como emigrado para cerrar la partida.',
];

/** Pasos que se completan solo con Continuar (sin SQL del jugador) */
export const ISLAND_AUTO_STEPS = new Set([0, 13, 16, 21, 24, 26, 28]);

const MISSION_STEP_BOUNDARIES = [4, 6, 11, 18, 24, 28, 30, 32];

export function getIslandMissionIndexForStep(stepIndex: number): number {
  for (let i = 0; i < MISSION_STEP_BOUNDARIES.length; i++) {
    if (stepIndex < MISSION_STEP_BOUNDARIES[i]) return i;
  }
  return 7;
}

export const ISLAND_TOTAL_STEPS = ISLAND_STEP_NARRATIVES.length;
