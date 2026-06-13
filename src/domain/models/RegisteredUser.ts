export interface RegisteredUser {
  personaId: number;
  inscripcionId: number;
  cursoId: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email?: string | null;
  fechaRegistro: string;
}

export interface NewUserInput {
  nombre: string;
  apellido: string;
  cedula: string;
  email?: string;
}
