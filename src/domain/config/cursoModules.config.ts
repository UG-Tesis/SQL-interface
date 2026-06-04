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
    topicId: 'c2',
    orden: 2,
    nombre: 'Lenguaje de Manipulación de Datos',
    descripcion: 'DML: INSERT, UPDATE y DELETE.',
  },
  {
    topicId: 'c3',
    orden: 3,
    nombre: 'Lenguaje de Consulta de Datos – Nivel Básico',
    descripcion: 'DQL: SELECT, FROM, WHERE y listado de datos.',
  },
  {
    topicId: 'c4',
    orden: 4,
    nombre: 'Lenguaje de Consulta de Datos – Nivel Avanzado',
    descripcion: 'ORDER BY, GROUP BY, LIMIT y funciones en consultas.',
  },
  {
    topicId: 'c5',
    orden: 5,
    nombre: 'Lenguaje de Consulta de Datos – Uniones, Filtros y Vistas',
    descripcion: 'JOIN, UNION, filtros avanzados y CREATE VIEW.',
  },
];

export function isCursoTopicId(topicId: string): boolean {
  return CURSO_MODULE_DEFINITIONS.some((module) => module.topicId === topicId);
}

export function getCursoModuleByTopicId(topicId: string): CursoModuleDefinition | undefined {
  return CURSO_MODULE_DEFINITIONS.find((module) => module.topicId === topicId);
}
