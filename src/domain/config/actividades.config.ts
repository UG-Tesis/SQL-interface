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
