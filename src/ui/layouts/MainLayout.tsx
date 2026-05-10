import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { Section, SectionId } from '../../domain/models/Section';
import { Header } from '../components/Header';
import { FixedSidebar } from '../components/FixedSidebar';
import { useSubNav } from '../hooks/useSubNav';

interface MainLayoutProps {
  children: ReactNode;
  sections: Section[];
  activeSection: SectionId | null;
  onNavigate: (id: SectionId) => void;
  onNavigateToDashboard: () => void;
}

export function MainLayout({
  children,
  sections,
  activeSection,
  onNavigate,
  onNavigateToDashboard,
}: MainLayoutProps) {
  const subNavItems = useSubNav(activeSection);
  const [activeSubNavId, setActiveSubNavId] = useState<string | null>(null);
  const [mobileSubNavOpen, setMobileSubNavOpen] = useState(false);

  useEffect(() => {
    setActiveSubNavId(subNavItems[0]?.id ?? null);
  }, [activeSection, subNavItems]);

  useEffect(() => {
    if (!mobileSubNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSubNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSubNavOpen]);

  useEffect(() => {
    if (!mobileSubNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSubNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setMobileSubNavOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleSubNavChange = (id: string) => {
    setActiveSubNavId(id);
    setMobileSubNavOpen(false);
  };

  const handleNavigate = (id: SectionId) => {
    setMobileSubNavOpen(false);
    onNavigate(id);
  };

  const handleNavigateToDashboard = () => {
    setMobileSubNavOpen(false);
    onNavigateToDashboard();
  };

  const sectionPageProps =
    activeSection != null && isValidElement(children)
      ? { sectionId: activeSection, activeSubNavId }
      : {};

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        sections={sections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onNavigateToDashboard={handleNavigateToDashboard}
        showModuleSubNavTrigger={Boolean(activeSection)}
        moduleSubNavOpen={mobileSubNavOpen}
        onModuleSubNavTriggerClick={() => setMobileSubNavOpen((o) => !o)}
      />
      {activeSection && (
        <FixedSidebar
          key={activeSection}
          items={subNavItems}
          activeId={activeSubNavId}
          onActiveIdChange={handleSubNavChange}
          mobileOpen={mobileSubNavOpen}
          onMobileOpenChange={setMobileSubNavOpen}
        />
      )}
      <main
        className={`flex min-h-0 flex-1 flex-col pt-16 ${activeSection ? 'md:pl-72' : ''}`}
      >
        {isValidElement(children)
          ? cloneElement(children as ReactElement<Record<string, unknown>>, sectionPageProps)
          : children}
      </main>
    </div>
  );
}
