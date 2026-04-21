import { useState } from 'react';
import type { SectionId } from '../../domain/models/Section';

export function useNavigation(initial: SectionId | null = null) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(initial);

  const navigateTo = (sectionId: SectionId) => {
    setActiveSection(sectionId);
  };

  const navigateToDashboard = () => {
    setActiveSection(null);
  };

  return { activeSection, navigateTo, navigateToDashboard };
}
