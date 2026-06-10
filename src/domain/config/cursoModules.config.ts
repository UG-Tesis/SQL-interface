export interface CursoModuleDefinition {
  topicId: string;
  orden: number;
  nombre: string;
  descripcion: string;
}

export const CURSO_MODULE_DEFINITIONS: CursoModuleDefinition[] = [
  {
    topicId: 'c1',
    orden: 1,
    nombre: 'Lenguaje de Definición y Control de Datos',
    descripcion: 'DDL y DCL: CREATE, ALTER, DROP, GRANT y REVOKE.',
  },
  {
    topicId: 'c3',
    orden: 2,
    nombre: 'Lenguaje de Consulta de Datos – Nivel Básico',
    descripcion: 'DQL: SELECT, FROM, WHERE. Comandos básicos del SELECT: *, columnas específicas y operadores matemáticos.',
  },
  {
    topicId: 'c2',
    orden: 3,
    nombre: 'Lenguaje de Manipulación de Datos',
    descripcion: 'DML: INSERT, UPDATE y DELETE.',
  },
  {
    topicId: 'c4',
    orden: 4,
    nombre: 'Lenguaje de Consulta de Datos – Nivel Avanzado',
    descripcion: 'DQL avanzado: ORDER BY, GROUP BY y LIMIT. Agregación: COUNT, SUM, AVG, MAX y MIN.',
  },
  {
    topicId: 'c5',
    orden: 5,
    nombre: 'Lenguaje de Consulta de Datos – Uniones y Filtros',
    descripcion: 'FROM avanzado: JOIN. WHERE avanzado: =, <, >, !=, AND, OR, NOT, BETWEEN, IN y LIKE.',
  },
];

export function isCursoTopicId(topicId: string): boolean {
  return CURSO_MODULE_DEFINITIONS.some((module) => module.topicId === topicId);
}

export function getCursoModuleByTopicId(topicId: string): CursoModuleDefinition | undefined {
  return CURSO_MODULE_DEFINITIONS.find((module) => module.topicId === topicId);
}
