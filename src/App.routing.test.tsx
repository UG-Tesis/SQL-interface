import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { ActividadesCatalogProvider } from './ui/session/ActividadesCatalogContext';
import { ThemeProvider } from './ui/theme/ThemeContext';

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <ActividadesCatalogProvider>
          <App />
        </ActividadesCatalogProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('rutas de la aplicación', () => {
  it('redirige secciones inválidas al panel de inicio', async () => {
    renderApp('/seccion-desconocida');
    expect(
      await screen.findByText(/Selecciona una sección para comenzar tu aprendizaje/i),
    ).toBeInTheDocument();
  });

  it('muestra el primer tema del curso en /curso', async () => {
    renderApp('/curso');
    expect(
      await screen.findByRole('heading', { name: /lenguaje de definición de datos \(ddl\)/i }),
    ).toBeInTheDocument();
  });

  it('muestra la sección de actividades en /actividad', async () => {
    renderApp('/actividad');
    expect(await screen.findByLabelText(/Abrir menú de contenido/i)).toBeInTheDocument();
  });
});
