export interface PreguntaPractica {
  id: number;
  actividadId: number;
  pregunta: string;
  orden: number;
}

export interface ActividadPractica {
  id: number;
  moduloId: number;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  preguntas: PreguntaPractica[];
}
