import { useContext } from 'react';
import { ActividadesCatalogContext } from './ActividadesCatalogContext';

export function useActividadesCatalog() {
  const context = useContext(ActividadesCatalogContext);
  if (!context) {
    throw new Error('useActividadesCatalog debe usarse dentro de ActividadesCatalogProvider');
  }
  return context;
}
