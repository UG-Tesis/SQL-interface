import type { InscripcionCursoProgress } from '../models/CursoModuleAccess';

export interface ModuloProgressPort {
  getCursoProgress(inscripcionId: number): Promise<InscripcionCursoProgress>;
  isModuloCompleted(
    inscripcionId: number,
    cursoId: number,
    topicId: string,
  ): Promise<boolean>;
  completeModulo(
    inscripcionId: number,
    topicId: string,
  ): Promise<InscripcionCursoProgress>;
}
