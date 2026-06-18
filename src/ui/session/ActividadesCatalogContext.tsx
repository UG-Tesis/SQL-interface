import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ActividadCatalogEntry } from '../../domain/models/ActividadModuloGroup';
import type { ActividadModuloGroup } from '../../domain/models/ActividadModuloGroup';
import { HttpActividadesAdapter } from '../../infrastructure/adapters/HttpActividadesAdapter';

const actividadesAdapter = new HttpActividadesAdapter();

interface ActividadesCatalogContextValue {
  groups: ActividadModuloGroup[];
  entries: ActividadCatalogEntry[];
  loading: boolean;
  error: string | null;
  ensureCatalog: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  findEntryByActividadId: (actividadId: number) => ActividadCatalogEntry | undefined;
}

const ActividadesCatalogContext = createContext<ActividadesCatalogContextValue | null>(null);

export function ActividadesCatalogProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<ActividadModuloGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const hasLoadedRef = useRef(false);

  const loadCatalog = useCallback(async (force = false) => {
    if (!force && hasLoadedRef.current) return;
    if (!force && fetchPromiseRef.current) {
      await fetchPromiseRef.current;
      return;
    }

    const request = (async () => {
      setLoading(true);
      setError(null);

      try {
        const catalog = await actividadesAdapter.getActividadesCatalog();
        setGroups(
          catalog.map((group) => ({
            ...group,
            enabled: true,
          })),
        );
        hasLoadedRef.current = true;
      } catch {
        setGroups([]);
        setError('No se pudieron cargar las actividades por módulo.');
        hasLoadedRef.current = false;
      } finally {
        setLoading(false);
        fetchPromiseRef.current = null;
      }
    })();

    fetchPromiseRef.current = request;
    await request;
  }, []);

  const ensureCatalog = useCallback(async () => {
    await loadCatalog(false);
  }, [loadCatalog]);

  const refreshCatalog = useCallback(async () => {
    hasLoadedRef.current = false;
    await loadCatalog(true);
  }, [loadCatalog]);

  const entries = useMemo<ActividadCatalogEntry[]>(
    () =>
      groups.flatMap((group) =>
        group.actividades.map((actividad) => ({
          ...actividad,
          topicId: group.topicId,
          moduloOrden: group.orden,
          moduloNombre: group.nombre,
        })),
      ),
    [groups],
  );

  const entriesById = useMemo(() => {
    const map = new Map<number, ActividadCatalogEntry>();
    for (const entry of entries) {
      map.set(entry.id, entry);
    }
    return map;
  }, [entries]);

  const findEntryByActividadId = useCallback(
    (actividadId: number) => entriesById.get(actividadId),
    [entriesById],
  );

  const value = useMemo(
    () => ({
      groups,
      entries,
      loading,
      error,
      ensureCatalog,
      refreshCatalog,
      findEntryByActividadId,
    }),
    [groups, entries, loading, error, ensureCatalog, refreshCatalog, findEntryByActividadId],
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
