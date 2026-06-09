import { useMemo } from 'react';
import {
  actividadSubNavId,
  moduloActividadHeaderId,
} from '../../domain/config/actividades.config';
import type { SubNavItem } from '../../domain/models/SubNavItem';
import { useActividadesCatalog } from '../session/ActividadesCatalogContext';

export function useActividadSubNav(enabled: boolean) {
  const { groups, loading, error, isActividadFinalized } = useActividadesCatalog();

  const items = useMemo<SubNavItem[]>(() => {
    if (!enabled) return [];

    const navItems: SubNavItem[] = [];

    for (const group of groups) {
      navItems.push({
        id: moduloActividadHeaderId(group.topicId),
        label: `Módulo ${group.orden} · ${group.nombre}`,
        isGroupHeader: true,
        enabled: group.enabled,
      });

      if (group.actividades.length === 0) {
        navItems.push({
          id: `${moduloActividadHeaderId(group.topicId)}-empty`,
          label: group.enabled
            ? 'Sin actividades registradas'
            : 'Disponible al completar el módulo anterior',
          enabled: false,
          moduleGroupId: moduloActividadHeaderId(group.topicId),
        });
        continue;
      }

      for (const actividad of group.actividades) {
        navItems.push({
          id: actividadSubNavId(actividad.id),
          label: actividad.nombre,
          enabled: group.enabled,
          completed: isActividadFinalized(actividad.id),
          moduleGroupId: moduloActividadHeaderId(group.topicId),
        });
      }
    }

    return navItems;
  }, [enabled, groups, isActividadFinalized]);

  const firstItemId = useMemo(
    () => items.find((item) => !item.isGroupHeader && item.enabled !== false)?.id ?? null,
    [items],
  );

  return { items, loading, error, firstItemId };
}
