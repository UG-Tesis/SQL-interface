import { CURSO_MODULE_DEFINITIONS } from '../config/cursoModules.config';
import type { CursoModuleAccess } from '../models/CursoModuleAccess';

export interface ModuleProgressSnapshot {
  porcentaje: number;
  completed: boolean;
}

export function computeCursoModuleAccess(
  progressByTopic: ReadonlyMap<string, ModuleProgressSnapshot>,
): CursoModuleAccess[] {
  const completedCount = CURSO_MODULE_DEFINITIONS.filter((module) => {
    const snapshot = progressByTopic.get(module.topicId);
    return snapshot?.completed ?? false;
  }).length;

  const unlockedCount = Math.min(
    CURSO_MODULE_DEFINITIONS.length,
    Math.max(1, completedCount + 1),
  );

  return CURSO_MODULE_DEFINITIONS.map((definition) => {
    const snapshot = progressByTopic.get(definition.topicId);
    const porcentaje = snapshot?.porcentaje ?? 0;
    const completed = snapshot?.completed ?? false;

    return {
      topicId: definition.topicId,
      orden: definition.orden,
      nombre: definition.nombre,
      enabled: definition.orden <= unlockedCount,
      completed,
      porcentaje: completed ? 100 : porcentaje,
    };
  });
}
