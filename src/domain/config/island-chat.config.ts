export type IslandChatSide = 'player' | 'other';

export interface IslandChatSpeaker {
  side: IslandChatSide;
  /** Nombre mostrado encima de la burbuja (solo para other) */
  name?: string;
}

/** Diálogo de NPC que aparece automáticamente tras la narrativa del jugador, antes de la consola SQL */
export const ISLAND_STEP_PRE_SQL_DIALOGUE: Partial<
  Record<number, { speaker: IslandChatSpeaker; text: string }>
> = {
  8: {
    speaker: { side: 'other', name: 'Ernesto Herrero' },
    text: 'Te la forjo por 150 de oro. Es lo más barato que encontrarás. ¿Cuánto oro tienes?',
  },
};

/** Respuestas tras completar cada paso (índice = stepIndex) */
export const ISLAND_STEP_ANSWERS: (string | null)[] = [
  'Hay tres pueblos: Ciudad Mono, Pueblo Pepino y Villa Cebolla.',
  '¡Hay mucha gente en esta isla!',
  '¡Aquí, que te siente bien! Y cuidado con los habitantes hostiles mientras no tengas armas: no todos son amigables.',
  null,
  null,
  '¡Mucho mejor! Visitaré a estos herreros uno por uno.',
  'Listo. Ya figuras registrado en Ciudad Mono.',
  null,
  null,
  '¡Tantas cosas útiles! ¡Genial, una taza de café!',
  null,
  null,
  null,
  '¡Gracias!',
  null,
  null,
  '¡Ah, Pablo! ¡Lo conozco!',
  null,
  null,
  null,
  '¡Aquí tienes tu nueva espada, Pedro! Ahora puedes ir a cualquier parte.',
  "Está con estado 'prisionero'.",
  null,
  '¡Lo tengo! Iré a ver a Fritz.',
  null,
  null,
  '¡Allá voy!',
  null,
  'Es demasiado poco…',
  null,
  'Entonces tendré que enfrentar a los hostiles…',
  null,
  '¡Sí! Solo falta liberar al piloto.',
  null,
  '¡Has escapado de SQL Island! Felicidades.',
];

export const ISLAND_STEP_FOLLOW_UPS: (string | null)[] = [
  null,
  null,
  null,
  null,
  null,
  null,
  '¡Oye, no me llames Extranjero! Bueno… ¿cuál es mi habitante_id?',
  null,
  '¡Maldición! Sin monedas, sin diversión. Debe haber otra forma de ganar oro sin ir a trabajar todavía. ¡Quizá pueda recoger objetos sin dueño y venderlos!',
  'Voy a recogerla.',
  null,
  '¡Genial! ¿Qué objetos tengo ahora?',
  null,
  null,
  '¡Aquí tienes un montón de oro!',
  null,
  null,
  null,
  null,
  null,
  '¡Gracias, Ernesto!',
  null,
  'Así se hace un JOIN. Ahora busca al jefe de Villa Cebolla: en pueblo.jefe está el habitante_id del jefe.',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  '¡Muchas gracias, Pedro! Te llevo a casa. Me llevo la espada, un poco de oro y algunos recuerdos. ¡Qué aventura!',
  null,
];

/**
 * Quién habla en la narrativa inicial de cada paso.
 * Regla: pensamientos/pedidos del jugador → Tú; diálogo directo de NPC → personaje.
 */
export const ISLAND_STEP_NARRATIVE_SPEAKERS: IslandChatSpeaker[] = [
  { side: 'player' }, // 0 accidente / ver pueblos
  { side: 'player' }, // 1 listar habitantes
  { side: 'player' }, // 2 buscar carnicero
  { side: 'player' }, // 3 gracias Erich / amigables
  { side: 'player' }, // 4 armero
  { side: 'player' }, // 5 herreros LIKE
  { side: 'other', name: 'Pablo Panadero' }, // 6 registro
  { side: 'player' }, // 7 habitante_id
  { side: 'player' }, // 8 Ernesto / consultar oro
  { side: 'player' }, // 9 objetos NULL
  { side: 'player' }, // 10 recoger taza (automático)
  { side: 'player' }, // 11 reclamar resto
  { side: 'player' }, // 12 mis objetos
  { side: 'player' }, // 13 mercaderes
  { side: 'other', name: 'Helga Césped' }, // 14 Helga pide Anillo y Tetera
  { side: 'other', name: 'Narrador' }, // 15 Helga entrega oro (automático)
  { side: 'player' }, // 16 cambiar nombre
  { side: 'player' }, // 17 panaderos ORDER BY
  { side: 'other', name: 'Pablo Panadero' }, // 18 Pablo contrata
  { side: 'player' }, // 19 turno en panadería (automático)
  { side: 'player' }, // 20 pago espada a Ernesto (automático)
  { side: 'player' }, // 21 buscar piloto
  { side: 'other', name: 'Guía' }, // 22 JOIN Dieter (automático)
  { side: 'player' }, // 23 jefe Villa Cebolla
  { side: 'player' }, // 24 contar habitantes (automático)
  { side: 'other', name: 'Fritz Poeta' }, // 25 Dieter / mujeres en Villa Cebolla
  { side: 'player' }, // 26 nombre de la mujer
  { side: 'player' }, // 27 oro Pueblo Pepino (automático)
  { side: 'player' }, // 28 SUM comerciantes
  { side: 'player' }, // 29 GROUP BY profesión (automático)
  { side: 'player' }, // 30 AVG por estado
  { side: 'player' }, // 31 eliminar Dieter (automático)
  { side: 'other', name: 'Dorotea Sucia' }, // 32 confrontación
  { side: 'player' }, // 33 liberar piloto
  { side: 'player' }, // 34 emigrar
];

/** Quién dice cada respuesta (answer) tras completar un paso */
export const ISLAND_STEP_ANSWER_SPEAKERS: (IslandChatSpeaker | null)[] = [
  { side: 'player' }, // 0 resumen pueblos
  { side: 'player' }, // 1 mucha gente
  { side: 'other', name: 'Erich Césped' }, // 2 carnicero
  null,
  null,
  { side: 'player' }, // 5 herreros
  { side: 'other', name: 'Pablo Panadero' }, // 6 registrado
  null,
  null,
  { side: 'player' }, // 9 cosas útiles / taza
  null,
  null,
  null,
  null,
  { side: 'other', name: 'Helga Césped' }, // 14 gracias
  null,
  null,
  { side: 'player' }, // 17 conozco a Pablo
  null,
  null,
  { side: 'other', name: 'Ernesto Herrero' }, // 20 entrega la espada
  { side: 'player' }, // 21 piloto prisionero
  null,
  { side: 'player' }, // 23 ir a ver a Fritz
  null,
  null,
  { side: 'player' }, // 26 allá voy
  null,
  { side: 'player' }, // 28 demasiado poco
  null,
  { side: 'player' }, // 30 enfrentar hostiles
  null,
  { side: 'player' }, // 32 liberar piloto
  null,
  { side: 'other', name: 'Narrador' }, // 34 victoria
];

/** Quién dice cada follow-up (antes del siguiente paso) */
export const ISLAND_STEP_FOLLOW_UP_SPEAKERS: (IslandChatSpeaker | null)[] = [
  null,
  null,
  null,
  null,
  null,
  null,
  { side: 'player' }, // 6 no me llames Extranjero
  null,
  { side: 'player' }, // 8 sin monedas
  { side: 'player' }, // 9 voy a recogerla
  null,
  { side: 'player' }, // 11 qué objetos tengo
  null,
  null,
  { side: 'other', name: 'Helga Césped' }, // 14 montón de oro
  null,
  null,
  null,
  null,
  null,
  { side: 'player' }, // 20 gracias Ernesto
  null,
  { side: 'other', name: 'Guía' }, // 22 explicación JOIN
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  { side: 'other', name: 'Arturo Piloto' }, // 33 gracias / escapar
  null,
];
