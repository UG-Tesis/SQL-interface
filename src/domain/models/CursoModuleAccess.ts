export interface CursoModuleAccess {
  topicId: string;
  orden: number;
  nombre: string;
  enabled: boolean;
  completed: boolean;
  porcentaje: number;
}

export interface InscripcionCursoProgress {
  inscripcionId: number;
  cursoId: number;
  porcentajeAvance: number;
  modules: CursoModuleAccess[];
}
