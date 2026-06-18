import { CURSO_MODULE_DEFINITIONS } from '../../domain/config/cursoModules.config';
import type { ActividadModuloGroup } from '../../domain/models/ActividadModuloGroup';
import type { ActividadPractica, PreguntaPractica } from '../../domain/models/ActividadPractica';
import type { ActividadesPort } from '../../domain/ports/ActividadesPort';
import { ApiError, apiRequest } from '../api/apiClient';

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

interface CursoSummaryResponse {
  id: number;
}

interface CursoCatalogResponse {
  id: number;
  modulos: (ModuloResponse & { actividades: ActividadResponse[] })[];
}

export class HttpActividadesAdapter implements ActividadesPort {
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

  async getActividadesCatalog(): Promise<ActividadModuloGroup[]> {
    try {
      const curso = await apiRequest<CursoCatalogResponse>('/cursos/catalog');
      return this.buildGroupsFromModulos(curso.modulos);
    } catch (error) {
      // Railway u otros entornos sin desplegar /cursos/catalog interpretan "catalog" como :id → 400.
      if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
        return this.getActividadesCatalogFallback();
      }
      throw error;
    }
  }

  private async getActividadesCatalogFallback(): Promise<ActividadModuloGroup[]> {
    const cursos = await apiRequest<CursoSummaryResponse[]>('/cursos');
    if (cursos.length === 0) {
      throw new Error('No hay cursos disponibles.');
    }

    const curso = await apiRequest<CursoCatalogResponse>(`/cursos/${cursos[0].id}`);
    return this.buildGroupsFromModulos(curso.modulos);
  }

  private buildGroupsFromModulos(modulos: (ModuloResponse & { actividades: ActividadResponse[] })[]) {
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
          enabled: true,
          actividades: [],
        });
        continue;
      }

      const actividades = modulo.actividades
        .filter((item) => item.activo !== false)
        .sort((a, b) => a.orden - b.orden)
        .map((item) => this.mapActividad(item));

      groups.push({
        topicId: moduleDef.topicId,
        orden: moduleDef.orden,
        moduloId: modulo.id,
        nombre: moduleDef.nombre,
        enabled: true,
        actividades,
      });
    }

    return groups;
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
