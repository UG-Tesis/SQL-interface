import type { SectionId } from '../../domain/models/Section';
import type { Topic } from '../../domain/models/Topic';
import type { TopicPort } from '../../domain/ports/TopicPort';

const TOPICS: Topic[] = [
  // Curso (ids alineados con subnavegación c1–c5)
  {
    id: 'c1',
    sectionId: 'curso',
    title: 'Lenguaje de Definición y Control de Datos',
    description: '',
    content: '',
  },
  {
    id: 'c3',
    sectionId: 'curso',
    title: 'Lenguaje de Consulta de Datos',
    description: 'DQL: SELECT, FROM, WHERE. Comandos básicos del SELECT: *, columnas específicas y operadores matemáticos (+, -, *, /).',
    content: '',
  },
  {
    id: 'c2',
    sectionId: 'curso',
    title: 'Lenguaje de Manipulación de Datos',
    description: '',
    content: '',
  },
  {
    id: 'c4',
    sectionId: 'curso',
    title: 'Lenguaje de Consulta de Datos – Nivel Avanzado',
    description:
      'DQL avanzado: ORDER BY, GROUP BY y LIMIT. Agregación: COUNT, SUM, AVG, MAX y MIN.',
    content: '',
  },
  {
    id: 'c5',
    sectionId: 'curso',
    title: 'Lenguaje de Consulta de Datos – Uniones y Filtros',
    description:
      'FROM avanzado: JOIN. WHERE avanzado: =, <, >, !=, AND, OR, NOT, BETWEEN, IN y LIKE (%, _).',
    content: '',
  },
  // Actividades
  {
    id: 'actividad-1',
    sectionId: 'actividad',
    title: 'Práctica SELECT',
    description: 'Escribe consultas SELECT para obtener datos.',
    content:
      'Ejercicio: Escribe una consulta que devuelva todos los nombres de la tabla "productos" cuyo precio sea mayor a 100.',
  },
  {
    id: 'actividad-2',
    sectionId: 'actividad',
    title: 'Práctica INSERT',
    description: 'Practica la inserción de datos en tablas.',
    content:
      'Ejercicio: Inserta un nuevo registro en la tabla "clientes" con nombre "Carlos" y ciudad "Guayaquil".',
  },
  {
    id: 'actividad-3',
    sectionId: 'actividad',
    title: 'Práctica WHERE',
    description: 'Practica el uso de filtros con WHERE.',
    content:
      'Ejercicio: Selecciona los empleados cuyo salario sea mayor a 1500 y que pertenezcan al departamento "Ventas".',
  },
  // Evaluaciones
  {
    id: 'evaluacion-1',
    sectionId: 'evaluacion',
    title: 'Evaluación - Consultas básicas',
    description: 'Demuestra tus conocimientos en SELECT y WHERE.',
    content:
      'Pregunta 1: ¿Cuál es la sintaxis correcta para seleccionar todas las columnas de una tabla llamada "empleados"?\n\nA) SELECT empleados\nB) SELECT * FROM empleados\nC) GET * FROM empleados\nD) SELECT ALL empleados',
  },
  {
    id: 'evaluacion-2',
    sectionId: 'evaluacion',
    title: 'Evaluación - Manipulación de datos',
    description: 'Evalúa tus habilidades con INSERT, UPDATE y DELETE.',
    content:
      'Pregunta 1: ¿Cuál sentencia se usa para agregar nuevos registros?\n\nA) ADD INTO\nB) INSERT INTO\nC) CREATE ROW\nD) NEW RECORD',
  },
];

export class InMemoryTopicAdapter implements TopicPort {
  getTopicsBySectionId(sectionId: SectionId): Topic[] {
    return TOPICS.filter((t) => t.sectionId === sectionId);
  }

  getTopicById(id: string): Topic | undefined {
    return TOPICS.find((t) => t.id === id);
  }
}
