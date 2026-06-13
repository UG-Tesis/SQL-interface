import {
  CURSO_MODULE_DEFINITIONS,
  getCursoModuleByTopicId,
} from '../../domain/config/cursoModules.config';
import {
  computeCursoModuleAccess,
  type ModuleProgressSnapshot,
} from '../../domain/logic/computeCursoModuleAccess';
import type { InscripcionCursoProgress } from '../../domain/models/CursoModuleAccess';
import type { ModuloProgressPort } from '../../domain/ports/ModuloProgressPort';
import { apiRequest } from '../api/apiClient';

interface ModuloResponse {
  id: number;
  curso_id: number;
  nombre: string;
  orden: number;
}

interface ModuloEstadoResponse {
  id: number;
  inscripcion_id: number;
  modulo_id: number;
  finalizado: boolean | null;
  porcentaje: string | number | null;
  modulos?: ModuloResponse;
}

interface ProgresoModuloResponse {
  id: number;
  inscripcion_id: number;
  modulo_id: number;
  modulo_estado_id: number | null;
  estado: 'pendiente' | 'en_progreso' | 'completado' | null;
  porcentaje: number | null;
}

interface InscripcionDetailResponse {
  id: number;
  curso_id: number;
  porcentaje_avance: string | number | null;
  modulo_estado: ModuloEstadoResponse[];
  progreso_modulos?: ProgresoModuloResponse[];
}

function parsePercentage(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function isModuleCompleted(
  finalizado: boolean | null | undefined,
  porcentaje: number,
  estado?: ProgresoModuloResponse['estado'],
): boolean {
  return Boolean(finalizado) || porcentaje >= 100 || estado === 'completado';
}

export class HttpModuloProgressAdapter implements ModuloProgressPort {
  private moduloCache = new Map<number, Map<string, number>>();

  async getCursoProgress(inscripcionId: number): Promise<InscripcionCursoProgress> {
    const inscripcion = await apiRequest<InscripcionDetailResponse>(
      `/inscripciones/${inscripcionId}`,
    );
    const cursoId = inscripcion.curso_id;
    const topicMap = await this.ensureTopicMap(cursoId);

    const progresos =
      inscripcion.progreso_modulos ??
      (await apiRequest<ProgresoModuloResponse[]>(
        `/progreso/modulos?inscripcionId=${inscripcionId}`,
      ));

    const progressByTopic = new Map<string, ModuleProgressSnapshot>();

    for (const definition of CURSO_MODULE_DEFINITIONS) {
      const moduloId = topicMap.get(definition.topicId);
      const estado = inscripcion.modulo_estado.find((item) => item.modulo_id === moduloId);
      const progreso = progresos.find((item) => item.modulo_id === moduloId);

      const porcentajeEstado = parsePercentage(estado?.porcentaje);
      const porcentajeProgreso = parsePercentage(progreso?.porcentaje);
      const porcentaje = Math.max(porcentajeEstado, porcentajeProgreso);
      const completed = isModuleCompleted(estado?.finalizado, porcentaje, progreso?.estado);

      progressByTopic.set(definition.topicId, { porcentaje, completed });
    }

    return {
      inscripcionId,
      cursoId,
      porcentajeAvance: parsePercentage(inscripcion.porcentaje_avance),
      modules: computeCursoModuleAccess(progressByTopic),
    };
  }

  async isModuloCompleted(
    inscripcionId: number,
    cursoId: number,
    topicId: string,
  ): Promise<boolean> {
    const progress = await this.getCursoProgress(inscripcionId);
    if (progress.cursoId !== cursoId) {
      const moduloId = await this.resolveModuloId(cursoId, topicId);
      const estados = await apiRequest<ModuloEstadoResponse[]>(
        `/progreso/modulos-estado?inscripcionId=${inscripcionId}`,
      );
      const estado = estados.find((item) => item.modulo_id === moduloId);
      return isModuleCompleted(estado?.finalizado, parsePercentage(estado?.porcentaje));
    }

    const module = progress.modules.find((item) => item.topicId === topicId);
    return module?.completed ?? false;
  }

  async completeModulo(
    inscripcionId: number,
    topicId: string,
  ): Promise<InscripcionCursoProgress> {
    const inscripcion = await apiRequest<InscripcionDetailResponse>(
      `/inscripciones/${inscripcionId}`,
    );
    const cursoId = inscripcion.curso_id;
    const moduloId = await this.resolveModuloId(cursoId, topicId);

    const estados = await apiRequest<ModuloEstadoResponse[]>(
      `/progreso/modulos-estado?inscripcionId=${inscripcionId}`,
    );
    const existingEstado = estados.find((item) => item.modulo_id === moduloId);

    const moduloEstado = existingEstado
      ? await apiRequest<ModuloEstadoResponse>(`/progreso/modulos-estado/${existingEstado.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ finalizado: true, porcentaje: 100 }),
        })
      : await apiRequest<ModuloEstadoResponse>('/progreso/modulos-estado', {
          method: 'POST',
          body: JSON.stringify({
            inscripcionId,
            moduloId,
            finalizado: true,
            porcentaje: 100,
          }),
        });

    const progresos = await apiRequest<ProgresoModuloResponse[]>(
      `/progreso/modulos?inscripcionId=${inscripcionId}`,
    );
    const existingProgreso = progresos.find((item) => item.modulo_id === moduloId);

    if (existingProgreso) {
      await apiRequest(`/progreso/modulos/${existingProgreso.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          moduloEstadoId: moduloEstado.id,
          estado: 'completado',
          porcentaje: 100,
        }),
      });
    } else {
      await apiRequest('/progreso/modulos', {
        method: 'POST',
        body: JSON.stringify({
          inscripcionId,
          moduloId,
          moduloEstadoId: moduloEstado.id,
          estado: 'completado',
          porcentaje: 100,
        }),
      });
    }

    await this.updateInscripcionAvance(inscripcionId);

    return this.getCursoProgress(inscripcionId);
  }

  private async resolveModuloId(cursoId: number, topicId: string): Promise<number> {
    const topicMap = await this.ensureTopicMap(cursoId);
    const moduloId = topicMap.get(topicId);
    if (!moduloId) {
      throw new Error(`No se encontró el módulo del tema ${topicId}`);
    }
    return moduloId;
  }

  private async ensureTopicMap(cursoId: number): Promise<Map<string, number>> {
    const cached = this.moduloCache.get(cursoId);
    if (cached) return cached;

    let modulos = await apiRequest<ModuloResponse[]>(`/modulos?cursoId=${cursoId}`);

    for (const moduleDef of CURSO_MODULE_DEFINITIONS) {
      const exists = modulos.some(
        (modulo) => modulo.orden === moduleDef.orden || modulo.nombre === moduleDef.nombre,
      );
      if (!exists) {
        const created = await apiRequest<ModuloResponse>('/modulos', {
          method: 'POST',
          body: JSON.stringify({
            cursoId,
            nombre: moduleDef.nombre,
            descripcion: moduleDef.descripcion,
            orden: moduleDef.orden,
          }),
        });
        modulos = [...modulos, created];
      }
    }

    modulos = await apiRequest<ModuloResponse[]>(`/modulos?cursoId=${cursoId}`);

    const topicMap = new Map<string, number>();
    for (const moduleDef of CURSO_MODULE_DEFINITIONS) {
      const definition = getCursoModuleByTopicId(moduleDef.topicId);
      if (!definition) continue;

      const modulo =
        modulos.find((item) => item.orden === definition.orden) ??
        modulos.find((item) => item.nombre === definition.nombre);
      if (modulo) {
        topicMap.set(definition.topicId, modulo.id);
      }
    }

    this.moduloCache.set(cursoId, topicMap);
    return topicMap;
  }

  private async updateInscripcionAvance(inscripcionId: number): Promise<void> {
    const estados = await apiRequest<ModuloEstadoResponse[]>(
      `/progreso/modulos-estado?inscripcionId=${inscripcionId}`,
    );
    const totalModulos = CURSO_MODULE_DEFINITIONS.length;
    const completados = estados.filter((item) =>
      isModuleCompleted(item.finalizado, parsePercentage(item.porcentaje)),
    ).length;
    const porcentajeAvance = Math.round((completados / totalModulos) * 100);

    await apiRequest(`/inscripciones/${inscripcionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        porcentajeAvance,
        estado: porcentajeAvance >= 100 ? 'completado' : 'activo',
      }),
    });
  }
}
