import type { ActividadPractica } from '../models/ActividadPractica';
import type { ActividadModuloGroup } from '../models/ActividadModuloGroup';

export interface ActividadesPort {
  getActividadesByModuloId(moduloId: number): Promise<ActividadPractica[]>;
  getActividadesCatalog(cursoId: number): Promise<ActividadModuloGroup[]>;
  resolveModuloIdByOrden(cursoId: number, orden: number): Promise<number | null>;
}

export interface ActividadProgressPort {
  finalizeActividad(inscripcionId: number, actividadId: number, totalPreguntas: number): Promise<void>;
  isActividadFinalizada(inscripcionId: number, actividadId: number): Promise<boolean>;
}
