import type { InscripcionCursoProgress } from '../../domain/models/CursoModuleAccess';
import type { ModuloProgressPort } from '../../domain/ports/ModuloProgressPort';

export class GetCursoProgressUseCase {
  private progressPort: ModuloProgressPort;

  constructor(progressPort: ModuloProgressPort) {
    this.progressPort = progressPort;
  }

  execute(inscripcionId: number): Promise<InscripcionCursoProgress> {
    return this.progressPort.getCursoProgress(inscripcionId);
  }
}
