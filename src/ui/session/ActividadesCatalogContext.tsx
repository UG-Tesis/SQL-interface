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
import { apiRequest } from '../../infrastructure/api/apiClient';

const actividadesAdapter = new HttpActividadesAdapter();

interface CursoResponse {
  id: number;
}

interface ActividadesCatalogContextValue {
  groups: ActividadModuloGroup[];
  entries: ActividadCatalogEntry[];
  loading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
  findEntryByActividadId: (actividadId: number) => ActividadCatalogEntry | undefined;
}

const ActividadesCatalogContext = createContext<ActividadesCatalogContextValue | null>(null);

async function resolveDefaultCursoId(): Promise<number> {
  const cursos = await apiRequest<CursoResponse[]>('/cursos');
  if (cursos.length === 0) {
    throw new Error('No hay cursos disponibles.');
  }
  return cursos[0].id;
}

export function ActividadesCatalogProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<ActividadModuloGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cursoId = await resolveDefaultCursoId();
      const catalog = await actividadesAdapter.getActividadesCatalog(cursoId);
      setGroups(
        catalog.map((group) => ({
          ...group,
          enabled: true,
        })),
      );
    } catch {
      setGroups([]);
      setError('No se pudieron cargar las actividades por módulo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

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

  const findEntryByActividadId = useCallback(
    (actividadId: number) => entries.find((entry) => entry.id === actividadId),
    [entries],
  );

  const value = useMemo(
    () => ({
      groups,
      entries,
      loading,
      error,
      refreshCatalog,
      findEntryByActividadId,
    }),
    [groups, entries, loading, error, refreshCatalog, findEntryByActividadId],
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
