import type { NewUserInput, RegisteredUser } from '../../domain/models/RegisteredUser';
import type { UserRegistrationPort } from '../../domain/ports/UserRegistrationPort';
import { apiRequest } from '../api/apiClient';

interface PersonaResponse {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string | null;
  fecha_registro: string;
}

interface CursoResponse {
  id: number;
  nombre: string;
}

interface InscripcionResponse {
  id: number;
  persona_id: number;
  curso_id: number;
  fecha_inscripcion: string;
}

const DEFAULT_CURSO = {
  nombre: 'Fundamentos de SQL',
  descripcion: 'Curso introductorio de sentencias SQL para estudiantes universitarios',
  duracionHoras: 40,
  activo: true,
};

export class HttpUserRegistrationAdapter implements UserRegistrationPort {
  async registerUser(input: NewUserInput): Promise<RegisteredUser> {
    const persona = await apiRequest<PersonaResponse>('/personas', {
      method: 'POST',
      body: JSON.stringify({
        cedula: input.cedula,
        nombre: input.nombre,
        apellido: input.apellido,
        email: input.email || undefined,
      }),
    });

    const cursoId = await this.resolveCursoId();

    const inscripcion = await apiRequest<InscripcionResponse>('/inscripciones', {
      method: 'POST',
      body: JSON.stringify({
        personaId: persona.id,
        cursoId,
      }),
    });

    return {
      personaId: persona.id,
      inscripcionId: inscripcion.id,
      cursoId,
      nombre: persona.nombre,
      apellido: persona.apellido,
      cedula: persona.cedula,
      email: persona.email,
      fechaRegistro: persona.fecha_registro ?? inscripcion.fecha_inscripcion,
    };
  }

  private async resolveCursoId(): Promise<number> {
    const cursos = await apiRequest<CursoResponse[]>('/cursos');
    if (cursos.length > 0) {
      return cursos[0].id;
    }

    const curso = await apiRequest<CursoResponse>('/cursos', {
      method: 'POST',
      body: JSON.stringify(DEFAULT_CURSO),
    });
    return curso.id;
  }
}
