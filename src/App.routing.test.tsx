import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { ThemeProvider } from './ui/theme/ThemeContext';

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('rutas de la aplicación', () => {
  it('redirige secciones inválidas al panel de inicio', async () => {
    renderApp('/seccion-desconocida');
    expect(
      await screen.findByText(/plataforma interactiva de aprendizaje de sentencias sql/i)
    ).toBeInTheDocument();
  });

  it('muestra el primer tema del curso en /curso', async () => {
    renderApp('/curso');
    expect(
      await screen.findByRole('heading', { name: /lenguaje de definición de datos \(ddl\)/i })
    ).toBeInTheDocument();
  });

  it('muestra actividades en /actividad', async () => {
    renderApp('/actividad');
    expect(await screen.findByRole('heading', { name: /práctica select/i })).toBeInTheDocument();
  });
});
