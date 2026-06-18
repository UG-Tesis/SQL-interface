import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { SectionId } from './domain/models/Section';
import { isSectionId } from './domain/models/Section';
import { RouteLoader } from './ui/components/RouteLoader';
import { useSections } from './ui/hooks/useSections';
import { useTopics } from './ui/hooks/useTopics';

const LandingPage = lazy(() =>
  import('./ui/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const DashboardPage = lazy(() =>
  import('./ui/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const MainLayout = lazy(() =>
  import('./ui/layouts/MainLayout').then((module) => ({ default: module.MainLayout })),
);
const SectionPage = lazy(() =>
  import('./ui/pages/SectionPage').then((module) => ({ default: module.SectionPage })),
);

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
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inicio" element={<DashboardRoute />} />
        <Route path="/:sectionId" element={<SectionRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
