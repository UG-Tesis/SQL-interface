import type { ActividadPractica } from './ActividadPractica';

export interface ActividadModuloGroup {
  topicId: string;
  orden: number;
  moduloId: number;
  nombre: string;
  enabled: boolean;
  actividades: ActividadPractica[];
}

export interface ActividadCatalogEntry extends ActividadPractica {
  topicId: string;
  moduloOrden: number;
  moduloNombre: string;
}
