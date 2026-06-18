export interface SubNavItem {
  id: string;
  label: string;
  enabled?: boolean;
  isGroupHeader?: boolean;
  /** Agrupa actividades bajo un encabezado de módulo (sidebar acordeón). */
  moduleGroupId?: string;
}
