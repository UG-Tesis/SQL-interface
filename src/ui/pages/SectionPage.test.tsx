import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Topic } from '../../domain/models/Topic';
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

describe('SectionPage', () => {
  it('muestra el primer tema cuando no hay subnavegación activa', () => {
    render(<SectionPage topics={sampleTopics} />);
    expect(screen.getByText('Contenido del tema uno.')).toBeInTheDocument();
    expect(screen.queryByText('Contenido del tema dos.')).not.toBeInTheDocument();
  });

  it('muestra el tema indicado por activeSubNavId', () => {
    render(<SectionPage topics={sampleTopics} activeSubNavId="tema-b" />);
    expect(screen.getByText('Contenido del tema dos.')).toBeInTheDocument();
    expect(screen.queryByText('Contenido del tema uno.')).not.toBeInTheDocument();
  });

  it('vuelve al primer tema si activeSubNavId no existe en la lista', () => {
    render(<SectionPage topics={sampleTopics} activeSubNavId="inexistente" />);
    expect(screen.getByText('Contenido del tema uno.')).toBeInTheDocument();
  });

  it('informa cuando la sección no tiene temas', () => {
    render(<SectionPage topics={[]} />);
    expect(screen.getByText(/no hay contenido disponible/i)).toBeInTheDocument();
  });
});
