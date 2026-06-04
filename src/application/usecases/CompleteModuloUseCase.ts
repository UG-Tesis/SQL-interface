import type { InscripcionCursoProgress } from '../../domain/models/CursoModuleAccess';
import type { ModuloProgressPort } from '../../domain/ports/ModuloProgressPort';

export class CompleteModuloUseCase {
  private progressPort: ModuloProgressPort;

  constructor(progressPort: ModuloProgressPort) {
    this.progressPort = progressPort;
  }

  isCompleted(
    inscripcionId: number,
    cursoId: number,
    topicId: string,
  ): Promise<boolean> {
    return this.progressPort.isModuloCompleted(inscripcionId, cursoId, topicId);
  }

  execute(inscripcionId: number, topicId: string): Promise<InscripcionCursoProgress> {
    return this.progressPort.completeModulo(inscripcionId, topicId);
  }
}
