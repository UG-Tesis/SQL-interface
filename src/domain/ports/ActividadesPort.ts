import type { ActividadPractica } from '../models/ActividadPractica';
import type { ActividadModuloGroup } from '../models/ActividadModuloGroup';

export interface ActividadesPort {
  getActividadesByModuloId(moduloId: number): Promise<ActividadPractica[]>;
  getActividadesCatalog(cursoId: number): Promise<ActividadModuloGroup[]>;
  resolveModuloIdByOrden(cursoId: number, orden: number): Promise<number | null>;
}
