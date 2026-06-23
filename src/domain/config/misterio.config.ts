export const MISTERIO_EXPERTO_ID = 'juego-misterio-experto';

export interface MisterioExpertBlock {
  id: string;
  title: string;
  body: string;
  defaultSql?: string;
}

export interface MisterioSchemaTable {
  tabla: string;
  descripcion: string;
  cuandoUsar: string;
}

export const MISTERIO_SCHEMA_TABLES: MisterioSchemaTable[] = [
  {
    tabla: 'informe_escena_crimen',
    descripcion: 'Informes de la policía sobre crímenes',
    cuandoUsar: 'Al inicio: busca el asesinato del 15/01/2018 en Ciudad SQL.',
  },
  {
    tabla: 'persona',
    descripcion: 'Datos de las personas (nombre, dirección, licencia)',
    cuandoUsar: 'Para identificar testigos, sospechosos o filtrar por dirección.',
  },
  {
    tabla: 'entrevista',
    descripcion: 'Lo que dijo cada persona a la policía',
    cuandoUsar: 'Después de encontrar testigos o sospechosos: lee sus declaraciones.',
  },
  {
    tabla: 'licencia_conducir',
    descripcion: 'Edad, altura, color de cabello, auto, placa',
    cuandoUsar: 'Para cruzar datos físicos del sospechoso (altura, cabello, vehículo).',
  },
  {
    tabla: 'ingreso',
    descripcion: 'Ingreso anual por número de seguro (SSN)',
    cuandoUsar: 'Para filtrar personas con mucho dinero u otros rangos de ingreso.',
  },
  {
    tabla: 'miembro_gimnasio',
    descripcion: 'Quién tiene membresía en el gimnasio',
    cuandoUsar: 'Cuando una pista mencione el gimnasio o una membresía.',
  },
  {
    tabla: 'asistencia_gimnasio',
    descripcion: 'Entradas y salidas del gimnasio por fecha/hora',
    cuandoUsar: 'Para saber quién estuvo en el gimnasio un día concreto.',
  },
  {
    tabla: 'registro_evento',
    descripcion: 'Asistencia a eventos (conciertos, etc.)',
    cuandoUsar: 'Si una entrevista menciona un evento o concierto.',
  },
  {
    tabla: 'solucion',
    descripcion: 'Entrega tu respuesta final aquí',
    cuandoUsar: 'Cuando tengas un nombre: INSERT con usuario = 1.',
  },
];

export const MISTERIO_TABLE_RELATIONS = [
  'persona.id se relaciona con entrevista.persona_id (cada entrevista es de una persona).',
  'persona.licencia_id se relaciona con licencia_conducir.id (datos del auto y apariencia).',
  'persona.ssn se relaciona con ingreso.ssn (cuánto gana esa persona).',
  'miembro_gimnasio.persona_id se relaciona con persona.id.',
  'asistencia_gimnasio.membresia_id se relaciona con miembro_gimnasio.id.',
  'registro_evento.persona_id se relaciona con persona.id.',
];

export const MISTERIO_GAME_RULES = [
  {
    title: 'Lee el caso',
    description:
      'Ocurrió un asesinato el 15 de enero de 2018 en Ciudad SQL. Tu primera tarea es encontrar el informe policial de ese crimen.',
  },
  {
    title: 'Consulta la base de datos',
    description:
      'Escribe SQL en el editor (SELECT para buscar datos). Pulsa Ejecutar consulta y revisa la tabla de resultados debajo.',
  },
  {
    title: 'Sigue las pistas',
    description:
      'Cada resultado te da información nueva: testigos, direcciones, entrevistas, registros del gimnasio… Conecta las tablas con JOIN cuando necesites combinar datos.',
  },
  {
    title: 'Entrega tu respuesta',
    description:
      'Cuando tengas un sospechoso, usa INSERT INTO solucion VALUES (1, \'Nombre Apellido\'). El sistema te mostrará si acertaste.',
  },
] as const;

export const MISTERIO_INVESTIGATION_PHASES = [
  {
    etapa: 1,
    title: 'Encuentra al asesino',
    description:
      'Usa el informe del crimen, identifica a los testigos, lee sus entrevistas y revisa quién estuvo en el gimnasio el 9 de enero de 2018.',
    hint: 'Anabel vio al asesino en el gimnasio ese día.',
  },
  {
    etapa: 2,
    title: 'Encuentra a la mente criminal',
    description:
      'El asesino no actuó solo. Lee la entrevista del culpable: describe a la persona que lo contrató (altura, cabello, auto, eventos).',
    hint: 'Busca en licencia_conducir, ingreso y registro_evento.',
  },
] as const;

export const MISTERIO_QUICK_START = {
  explanation:
    'Esta consulta busca el informe del asesinato en Ciudad SQL. Es el punto de partida del caso: en la descripción encontrarás pistas sobre los testigos.',
  buttonLabel: 'Cargar mi primera consulta',
  sql: `SELECT fecha, tipo, descripcion, ciudad
FROM informe_escena_crimen
WHERE tipo = 'asesinato'
  AND ciudad = 'Ciudad SQL'
  AND fecha = 20180115`,
} as const;

export function getMisterioGameMode(): 'experto' {
  return 'experto';
}

export const MISTERIO_INTRO =
  '¡Ha ocurrido un asesinato en Ciudad SQL! Eres el detective: toda la evidencia está en tablas de MySQL. Usa consultas SQL para investigar y descubrir quién cometió el crimen y quién lo planeó.';

export const MISTERIO_CASE_TITLE = 'Asesinato en Ciudad SQL';

export const MISTERIO_CASE_NARRATIVE =
  'Se ha cometido un crimen y el detective necesita tu ayuda. El detective te entregó el informe de la escena del crimen, pero de alguna manera lo perdiste. Recuerdas vagamente que el crimen fue un asesinato que ocurrió el 15 de enero de 2018 en Ciudad SQL. Empieza recuperando el informe correspondiente de la escena del crimen en la base de datos del departamento de policía.';

export const MISTERIO_INVESTIGATION_FLOW = [
  {
    step: 1,
    label: 'Informe policial',
    table: 'informe_escena_crimen',
    description:
      'Busca el asesinato del 15/01/2018 en Ciudad SQL. En la descripción encontrarás pistas sobre los testigos.',
  },
  {
    step: 2,
    label: 'Testigos',
    table: 'persona',
    description:
      'Identifica a los testigos por nombre y dirección (Anabel en Franklin Ave, otro en Northwestern Dr).',
  },
  {
    step: 3,
    label: 'Entrevistas y registros',
    table: 'entrevista',
    description:
      'Lee las declaraciones y cruza con el gimnasio (9/01/2018) u otras tablas según las pistas.',
  },
  {
    step: 4,
    label: 'Verificar sospechoso',
    table: 'solucion',
    description:
      'Cuando tengas un nombre, entrega tu respuesta con INSERT INTO solucion VALUES (1, \'Nombre Apellido\').',
  },
] as const;

export const MISTERIO_EXPERT_BLOCKS: MisterioExpertBlock[] = [
  {
    id: 'explorar-tablas',
    title: 'Ver todas las tablas disponibles',
    body: 'Si no sabes por dónde empezar, esta consulta lista las tablas del caso.',
    defaultSql: `SELECT TABLE_NAME AS tabla
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'tesis_misterio'
ORDER BY TABLE_NAME`,
  },
  {
    id: 'columnas-informe',
    title: 'Ver columnas del informe policial',
    body: 'Lista las columnas de informe_escena_crimen (fecha, tipo, descripcion, ciudad).',
    defaultSql: `SELECT COLUMN_NAME AS columna, DATA_TYPE AS tipo
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'tesis_misterio'
  AND TABLE_NAME = 'informe_escena_crimen'
ORDER BY ORDINAL_POSITION`,
  },
];
