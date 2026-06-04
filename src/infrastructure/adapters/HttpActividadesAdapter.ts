import { CURSO_MODULE_DEFINITIONS } from '../../domain/config/cursoModules.config';
import type { ActividadModuloGroup } from '../../domain/models/ActividadModuloGroup';
import type { ActividadPractica, PreguntaPractica } from '../../domain/models/ActividadPractica';
import type { ActividadesPort, ActividadProgressPort } from '../../domain/ports/ActividadesPort';
import { apiRequest } from '../api/apiClient';

interface ModuloResponse {
  id: number;
  curso_id: number;
  orden: number;
  nombre: string;
}

interface PreguntaResponse {
  id: number;
  actividad_id: number;
  pregunta: string;
  orden: number;
}

interface ActividadResponse {
  id: number;
  modulo_id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean | null;
  preguntas?: PreguntaResponse[];
}

interface AvanceActividadResponse {
  id: number;
  inscripcion_id: number;
  actividad_id: number;
  finalizado: boolean | null;
  porcentaje: string | number | null;
}

export class HttpActividadesAdapter implements ActividadesPort, ActividadProgressPort {
  async resolveModuloIdByOrden(cursoId: number, orden: number): Promise<number | null> {
    const modulos = await apiRequest<ModuloResponse[]>(`/modulos?cursoId=${cursoId}`);
    const modulo = modulos.find((item) => item.orden === orden);
    return modulo?.id ?? null;
  }

  async getActividadesByModuloId(moduloId: number): Promise<ActividadPractica[]> {
    const actividades = await apiRequest<ActividadResponse[]>(
      `/actividades?moduloId=${moduloId}`,
    );

    return actividades
      .filter((item) => item.activo !== false)
      .sort((a, b) => a.orden - b.orden)
      .map((item) => this.mapActividad(item));
  }

  async getActividadesCatalog(cursoId: number): Promise<ActividadModuloGroup[]> {
    const modulos = await apiRequest<ModuloResponse[]>(`/modulos?cursoId=${cursoId}`);
    const groups: ActividadModuloGroup[] = [];

    for (const moduleDef of CURSO_MODULE_DEFINITIONS) {
      const modulo =
        modulos.find((item) => item.orden === moduleDef.orden) ??
        modulos.find((item) => item.nombre === moduleDef.nombre);

      if (!modulo) {
        groups.push({
          topicId: moduleDef.topicId,
          orden: moduleDef.orden,
          moduloId: 0,
          nombre: moduleDef.nombre,
          enabled: moduleDef.orden === 1,
          actividades: [],
        });
        continue;
      }

      const actividades = await this.getActividadesByModuloId(modulo.id);
      groups.push({
        topicId: moduleDef.topicId,
        orden: moduleDef.orden,
        moduloId: modulo.id,
        nombre: moduleDef.nombre,
        enabled: false,
        actividades,
      });
    }

    return groups;
  }

  async isActividadFinalizada(inscripcionId: number, actividadId: number): Promise<boolean> {
    const avances = await apiRequest<AvanceActividadResponse[]>(
      `/progreso/actividades?inscripcionId=${inscripcionId}`,
    );
    const avance = avances.find((item) => item.actividad_id === actividadId);
    if (!avance) return false;
    const porcentaje = Number(avance.porcentaje ?? 0);
    return Boolean(avance.finalizado) || porcentaje >= 100;
  }

  async finalizeActividad(
    inscripcionId: number,
    actividadId: number,
    totalPreguntas: number,
  ): Promise<void> {
    const avances = await apiRequest<AvanceActividadResponse[]>(
      `/progreso/actividades?inscripcionId=${inscripcionId}`,
    );
    const existing = avances.find((item) => item.actividad_id === actividadId);

    const payload = {
      finalizado: true,
      totalPreguntas,
      preguntasRespondidas: totalPreguntas,
      porcentaje: 100,
    };

    if (existing) {
      await apiRequest(`/progreso/actividades/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return;
    }

    await apiRequest('/progreso/actividades', {
      method: 'POST',
      body: JSON.stringify({
        inscripcionId,
        actividadId,
        ...payload,
      }),
    });
  }

  private mapActividad(item: ActividadResponse): ActividadPractica {
    const preguntas: PreguntaPractica[] = (item.preguntas ?? [])
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((pregunta) => ({
        id: pregunta.id,
        actividadId: pregunta.actividad_id,
        pregunta: pregunta.pregunta,
        orden: pregunta.orden,
      }));

    return {
      id: item.id,
      moduloId: item.modulo_id,
      nombre: item.nombre,
      descripcion: item.descripcion?.trim() ?? '',
      orden: item.orden,
      activo: item.activo !== false,
      preguntas,
    };
  }
}
