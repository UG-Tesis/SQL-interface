import { CURSO_MODULE_DEFINITIONS } from './cursoModules.config';

export function actividadSubNavId(actividadId: number): string {
  return `act-${actividadId}`;
}

export function moduloActividadHeaderId(topicId: string): string {
  return `mod-header-${topicId}`;
}

export function parseActividadSubNavId(id: string | null | undefined): number | null {
  if (!id?.startsWith('act-')) return null;
  const parsed = Number(id.slice(4));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function isModuloActividadHeaderId(id: string): boolean {
  return id.startsWith('mod-header-');
}

export function getTopicIdFromModuloOrden(orden: number): string | undefined {
  return CURSO_MODULE_DEFINITIONS.find((module) => module.orden === orden)?.topicId;
}

export type ActividadPracticeMode = 'validate_only' | 'validate_and_execute';

/** Módulo 1: solo validación. Módulo 2+: validar y ejecutar en sandbox. */
export function getActividadPracticeMode(
  moduloOrden: number,
  _actividadOrden: number,
): ActividadPracticeMode {
  if (moduloOrden === 1) return 'validate_only';
  return 'validate_and_execute';
}

export const SANDBOX_DML_TABLE = 'practica_alumnos';
export const SANDBOX_DQL_TABLE = 'practica_alumnos';

export function getExpectedSqlKeyword(
  moduloOrden: number,
  actividadOrden: number,
): string | null {
  if (moduloOrden === 2) {
    if (actividadOrden === 1 || actividadOrden === 3) return 'INSERT';
    if (actividadOrden === 2) return 'UPDATE';
    if (actividadOrden === 4) return 'DELETE';
    return null;
  }
  if (moduloOrden >= 3) return 'SELECT';
  return null;
}

export function isReadyForLiveValidation(
  sql: string,
  moduloOrden: number,
  actividadOrden: number,
): boolean {
  const trimmed = sql.trim();
  if (trimmed.length < 8) return false;

  const keyword = getExpectedSqlKeyword(moduloOrden, actividadOrden);
  if (!keyword) return false;

  return new RegExp(`\\b${keyword}\\b`, 'i').test(trimmed);
}

export function getPracticeInstruction(moduloOrden: number): string {
  if (moduloOrden === 1) {
    return 'Escribe la sentencia SQL que cumpla la orden y presiona Validar consulta. No se ejecutará en el servidor.';
  }
  if (moduloOrden === 2) {
    return 'Escribe tu sentencia DML (INSERT, UPDATE o DELETE). Verás sugerencias al redactar; luego presiona Realizar consulta para ejecutarla en la sandbox.';
  }
  if (moduloOrden === 3) {
    return 'Escribe tu consulta SELECT básica. Las sugerencias aparecen mientras escribes; usa Realizar consulta para ver el resultado.';
  }
  if (moduloOrden === 4) {
    return 'Construye tu consulta con ORDER BY, GROUP BY, LIMIT o funciones de agregación. Revisa las sugerencias y ejecuta cuando esté lista.';
  }
  return 'Escribe tu consulta con JOIN, operadores de filtro o condiciones avanzadas. Las sugerencias te guían mientras redactas.';
}

export function getEditorPlaceholder(moduloOrden: number, actividadOrden: number): string {
  if (moduloOrden === 2) {
    if (actividadOrden === 1) {
      return 'INSERT INTO practica_alumnos (nombre, email, edad) VALUES (...);';
    }
    if (actividadOrden === 2) {
      return 'UPDATE practica_alumnos SET edad = ... WHERE id = ...;';
    }
    if (actividadOrden === 3) {
      return "INSERT INTO practica_inscripciones (alumno_id, materia) VALUES (..., 'Bases de Datos');";
    }
    if (actividadOrden === 4) {
      return 'DELETE FROM practica_alumnos WHERE id = ...;';
    }
  }
  if (moduloOrden >= 3) {
    return 'SELECT ... FROM practica_alumnos ...;';
  }
  return 'Escribe aquí la sentencia SQL que cumple la orden...';
}

export function getSandboxEditorLabel(moduloOrden: number): string {
  if (moduloOrden === 2) {
    return `DML · tesis_sandbox · tabla ${SANDBOX_DML_TABLE}`;
  }
  if (moduloOrden === 3) {
    return `DQL básico · tesis_sandbox · tabla ${SANDBOX_DQL_TABLE}`;
  }
  if (moduloOrden === 4) {
    return `DQL avanzado · tesis_sandbox · tabla ${SANDBOX_DQL_TABLE}`;
  }
  return `DQL uniones y filtros · tesis_sandbox · tabla ${SANDBOX_DQL_TABLE}`;
}

export function getLiveFeedbackTitle(
  moduloOrden: number,
  correct: boolean,
  feedbackMode: 'live' | 'execute',
): string {
  if (correct) {
    return feedbackMode === 'live' ? '¡Vas bien!' : 'Consulta correcta';
  }
  if (feedbackMode === 'live') {
    if (moduloOrden === 2) return 'Sugerencia DML';
    return 'Sugerencia SELECT';
  }
  return 'Revisa la orden';
}
