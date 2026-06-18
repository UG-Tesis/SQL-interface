import type { ActividadModuloGroup } from '../models/ActividadModuloGroup';

export interface ActividadesPort {
  getActividadesCatalog(): Promise<ActividadModuloGroup[]>;
}
