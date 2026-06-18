import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import type { Topic } from '../../domain/models/Topic';
import { ActividadesCatalogProvider } from '../session/ActividadesCatalogContext';
import { SectionPage } from './SectionPage';

const sampleTopics: Topic[] = [
  {
    id: 'tema-a',
    sectionId: 'curso',
    title: 'Tema uno',
    description: 'Descripción uno',
    content: 'Contenido del tema uno.',
  },
  {
    id: 'tema-b',
    sectionId: 'curso',
    title: 'Tema dos',
    description: 'Descripción dos',
    content: 'Contenido del tema dos.',
  },
];

function renderSectionPage(props: ComponentProps<typeof SectionPage>) {
  return render(
    <ActividadesCatalogProvider>
      <SectionPage {...props} />
    </ActividadesCatalogProvider>,
  );
}

describe('SectionPage', () => {
  it('muestra el primer tema cuando no hay subnavegación activa', () => {
    renderSectionPage({ sectionId: 'curso', topics: sampleTopics });
    expect(screen.getByText('Contenido del tema uno.')).toBeInTheDocument();
    expect(screen.queryByText('Contenido del tema dos.')).not.toBeInTheDocument();
  });

  it('muestra el tema indicado por activeSubNavId', () => {
    renderSectionPage({
      sectionId: 'curso',
      topics: sampleTopics,
      activeSubNavId: 'tema-b',
    });
    expect(screen.getByText('Contenido del tema dos.')).toBeInTheDocument();
    expect(screen.queryByText('Contenido del tema uno.')).not.toBeInTheDocument();
  });

  it('vuelve al primer tema si activeSubNavId no existe en la lista', () => {
    renderSectionPage({
      sectionId: 'curso',
      topics: sampleTopics,
      activeSubNavId: 'inexistente',
    });
    expect(screen.getByText('Contenido del tema uno.')).toBeInTheDocument();
  });

  it('informa cuando la sección no tiene temas', () => {
    renderSectionPage({ sectionId: 'curso', topics: [] });
    expect(screen.getByText(/no hay contenido disponible/i)).toBeInTheDocument();
  });
});
