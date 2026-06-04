import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ActividadCatalogEntry } from '../../domain/models/ActividadModuloGroup';
import type { ActividadModuloGroup } from '../../domain/models/ActividadModuloGroup';
import { HttpActividadesAdapter } from '../../infrastructure/adapters/HttpActividadesAdapter';
import { useCursoProgress } from './CursoProgressContext';
import { useSession } from './SessionContext';

const actividadesAdapter = new HttpActividadesAdapter();

interface ActividadesCatalogContextValue {
  groups: ActividadModuloGroup[];
  entries: ActividadCatalogEntry[];
  loading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
  findEntryByActividadId: (actividadId: number) => ActividadCatalogEntry | undefined;
  isActividadEnabled: (actividadId: number) => boolean;
  isActividadFinalized: (actividadId: number) => boolean;
  markActividadFinalized: (actividadId: number) => void;
}

const ActividadesCatalogContext = createContext<ActividadesCatalogContextValue | null>(null);

export function ActividadesCatalogProvider({ children }: { children: ReactNode }) {
  const { activeUser } = useSession();
  const { progress, isModuleEnabled } = useCursoProgress();
  const [rawGroups, setRawGroups] = useState<ActividadModuloGroup[]>([]);
  const [finalizedIds, setFinalizedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursoId = progress?.cursoId ?? activeUser?.cursoId ?? null;

  const refreshCatalog = useCallback(async () => {
    if (!activeUser || !cursoId) {
      setRawGroups([]);
      setFinalizedIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const catalog = await actividadesAdapter.getActividadesCatalog(cursoId);
      const finalized = new Set<number>();

      await Promise.all(
        catalog.flatMap((group) =>
          group.actividades.map(async (actividad) => {
            const done = await actividadesAdapter.isActividadFinalizada(
              activeUser.inscripcionId,
              actividad.id,
            );
            if (done) finalized.add(actividad.id);
          }),
        ),
      );

      setRawGroups(catalog);
      setFinalizedIds(finalized);
    } catch {
      setRawGroups([]);
      setFinalizedIds(new Set());
      setError('No se pudieron cargar las actividades por módulo.');
    } finally {
      setLoading(false);
    }
  }, [activeUser, cursoId]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const groups = useMemo(
    () =>
      rawGroups.map((group) => ({
        ...group,
        enabled: isModuleEnabled(group.topicId),
      })),
    [rawGroups, isModuleEnabled],
  );

  const entries = useMemo<ActividadCatalogEntry[]>(
    () =>
      groups.flatMap((group) =>
        group.actividades.map((actividad) => ({
          ...actividad,
          topicId: group.topicId,
          moduloOrden: group.orden,
          moduloNombre: group.nombre,
          moduloEnabled: group.enabled,
          finalized: finalizedIds.has(actividad.id),
        })),
      ),
    [groups, finalizedIds],
  );

  const findEntryByActividadId = useCallback(
    (actividadId: number) => entries.find((entry) => entry.id === actividadId),
    [entries],
  );

  const isActividadEnabled = useCallback(
    (actividadId: number) => findEntryByActividadId(actividadId)?.moduloEnabled ?? false,
    [findEntryByActividadId],
  );

  const isActividadFinalized = useCallback(
    (actividadId: number) => finalizedIds.has(actividadId),
    [finalizedIds],
  );

  const markActividadFinalized = useCallback((actividadId: number) => {
    setFinalizedIds((prev) => new Set(prev).add(actividadId));
  }, []);

  const value = useMemo(
    () => ({
      groups,
      entries,
      loading,
      error,
      refreshCatalog,
      findEntryByActividadId,
      isActividadEnabled,
      isActividadFinalized,
      markActividadFinalized,
    }),
    [
      groups,
      entries,
      loading,
      error,
      refreshCatalog,
      findEntryByActividadId,
      isActividadEnabled,
      isActividadFinalized,
      markActividadFinalized,
    ],
  );

  return (
    <ActividadesCatalogContext.Provider value={value}>{children}</ActividadesCatalogContext.Provider>
  );
}

export function useActividadesCatalog() {
  const context = useContext(ActividadesCatalogContext);
  if (!context) {
    throw new Error('useActividadesCatalog debe usarse dentro de ActividadesCatalogProvider');
  }
  return context;
}
