import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { SectionId } from './domain/models/Section';
import { isSectionId } from './domain/models/Section';
import { MainLayout } from './ui/layouts/MainLayout';
import { DashboardPage } from './ui/pages/DashboardPage';
import { LandingPage } from './ui/pages/LandingPage';
import { SectionPage } from './ui/pages/SectionPage';
import { useSections } from './ui/hooks/useSections';
import { useTopics } from './ui/hooks/useTopics';

function DashboardRoute() {
  const { sections } = useSections();
  const navigate = useNavigate();
  return (
    <DashboardPage
      sections={sections}
      onNavigate={(id) => void navigate(`/${id}`)}
      onNavigateToHome={() => void navigate('/inicio')}
    />
  );
}

function SectionRoute() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { sections } = useSections();
  const active: SectionId | null = isSectionId(sectionId) ? sectionId : null;
  const { topics } = useTopics(active);

  if (!active) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <MainLayout
      sections={sections}
      activeSection={active}
      onNavigate={(id) => void navigate(`/${id}`)}
      onNavigateToDashboard={() => void navigate('/inicio')}
    >
      <SectionPage sectionId={active} topics={topics} />
    </MainLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/inicio" element={<DashboardRoute />} />
      <Route path="/:sectionId" element={<SectionRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
