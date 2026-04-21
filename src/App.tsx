import { MainLayout } from './ui/layouts/MainLayout';
import { DashboardPage } from './ui/pages/DashboardPage';
import { LandingPage } from './ui/pages/LandingPage';
import { SectionPage } from './ui/pages/SectionPage';
import { useNavigation } from './ui/hooks/useNavigation';
import { useSections } from './ui/hooks/useSections';
import { useTopics } from './ui/hooks/useTopics';
import { useState } from 'react';

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const { activeSection, navigateTo, navigateToDashboard } = useNavigation();
  const { sections } = useSections();
  const { topics } = useTopics(activeSection);

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
  }

  if (!activeSection) {
    return <DashboardPage sections={sections} onNavigate={navigateTo} />;
  }

  return (
    <MainLayout
      sections={sections}
      activeSection={activeSection}
      onNavigate={navigateTo}
      onNavigateToDashboard={navigateToDashboard}
    >
      <SectionPage topics={topics} />
    </MainLayout>
  );
}

export default App;
