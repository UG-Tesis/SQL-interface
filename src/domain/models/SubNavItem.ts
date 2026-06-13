export interface SubNavItem {
  id: string;
  label: string;
  enabled?: boolean;
  completed?: boolean;
  porcentaje?: number;
  isGroupHeader?: boolean;
  /** Agrupa actividades bajo un encabezado de módulo (sidebar acordeón). */
  moduleGroupId?: string;
}
