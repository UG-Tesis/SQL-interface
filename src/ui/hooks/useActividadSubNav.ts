import { useEffect, useMemo } from 'react';
import {
  actividadSubNavId,
  moduloActividadHeaderId,
} from '../../domain/config/actividades.config';
import type { SubNavItem } from '../../domain/models/SubNavItem';
import { useActividadesCatalog } from '../session/useActividadesCatalog';

export function useActividadSubNav(enabled: boolean) {
  const { groups, loading, error, ensureCatalog } = useActividadesCatalog();

  useEffect(() => {
    if (!enabled) return;
    void ensureCatalog();
  }, [enabled, ensureCatalog]);

  const items = useMemo<SubNavItem[]>(() => {
    if (!enabled) return [];

    const navItems: SubNavItem[] = [];

    for (const group of groups) {
      navItems.push({
        id: moduloActividadHeaderId(group.topicId),
        label: `Módulo ${group.orden} · ${group.nombre}`,
        isGroupHeader: true,
      });

      if (group.actividades.length === 0) {
        navItems.push({
          id: `${moduloActividadHeaderId(group.topicId)}-empty`,
          label: 'Sin actividades registradas',
          enabled: false,
          moduleGroupId: moduloActividadHeaderId(group.topicId),
        });
        continue;
      }

      for (const actividad of group.actividades) {
        navItems.push({
          id: actividadSubNavId(actividad.id),
          label: actividad.nombre,
          moduleGroupId: moduloActividadHeaderId(group.topicId),
        });
      }
    }

    return navItems;
  }, [enabled, groups]);

  const firstItemId = useMemo(
    () => items.find((item) => !item.isGroupHeader && item.enabled !== false)?.id ?? null,
    [items],
  );

  return { items, loading, error, firstItemId };
}
