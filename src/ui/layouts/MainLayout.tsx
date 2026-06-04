import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { Section, SectionId } from '../../domain/models/Section';
import { CURSO_MODULE_DEFINITIONS } from '../../domain/config/cursoModules.config';
import { SiteHeader } from '../components/SiteHeader';
import { FixedSidebar } from '../components/FixedSidebar';
import { useSubNav } from '../hooks/useSubNav';
import { useActividadSubNav } from '../hooks/useActividadSubNav';
import { useCursoProgress } from '../session/CursoProgressContext';
import { APP_STORAGE_KEYS } from '../../infrastructure/storage/browserStorage';

const SIDEBAR_COLLAPSED_KEY = APP_STORAGE_KEYS.sidebarCollapsed;

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
  const isActividadSection = activeSection === 'actividad';
  const { items: actividadSubNavItems, firstItemId: firstActividadId } =
    useActividadSubNav(isActividadSection);
  const baseSubNavItems = isActividadSection ? actividadSubNavItems : subNavItems;
  const { getModuleAccess, progress, completingTopicId } = useCursoProgress();
  const prevCompletingTopicId = useRef<string | null>(null);
  const enrichedSubNavItems = useMemo(
    () =>
      activeSection === 'curso'
        ? baseSubNavItems.map((item) => {
            const access = getModuleAccess(item.id);
            return {
              ...item,
              enabled: access?.enabled ?? item.id === 'c1',
              completed: access?.completed ?? false,
              porcentaje: access?.porcentaje ?? 0,
            };
          })
        : baseSubNavItems,
    [activeSection, baseSubNavItems, getModuleAccess],
  );
  const [selectionBySection, setSelectionBySection] = useState<Partial<Record<SectionId, string>>>({});
  const [mobileSubNavOpen, setMobileSubNavOpen] = useState(false);
  const [sidebarDesktopCollapsed, setSidebarDesktopCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const activeSubNavId =
    activeSection != null
      ? (selectionBySection[activeSection] ??
        (isActividadSection ? firstActividadId : null) ??
        enrichedSubNavItems.find((item) => item.enabled !== false)?.id ??
        enrichedSubNavItems[0]?.id ??
        null)
      : null;

  useEffect(() => {
    if (
      isActividadSection &&
      firstActividadId &&
      !selectionBySection.actividad &&
      actividadSubNavItems.length > 0
    ) {
      setSelectionBySection((prev) => ({ ...prev, actividad: firstActividadId }));
    }
  }, [isActividadSection, firstActividadId, actividadSubNavItems.length, selectionBySection.actividad]);

  useEffect(() => {
    if (!isActividadSection || enrichedSubNavItems.length === 0) return;

    const currentId = selectionBySection.actividad ?? firstActividadId;
    const currentItem = enrichedSubNavItems.find((item) => item.id === currentId);
    if (currentItem?.enabled === false || currentItem?.isGroupHeader) {
      const firstEnabled = enrichedSubNavItems.find(
        (item) => !item.isGroupHeader && item.enabled !== false && !item.id.endsWith('-empty'),
      );
      if (firstEnabled) {
        setSelectionBySection((prev) => ({ ...prev, actividad: firstEnabled.id }));
      }
    }
  }, [isActividadSection, enrichedSubNavItems, selectionBySection.actividad, firstActividadId]);

  useEffect(() => {
    if (activeSection !== 'curso' || enrichedSubNavItems.length === 0) return;

    const currentId = selectionBySection.curso ?? enrichedSubNavItems[0]?.id;
    const currentItem = enrichedSubNavItems.find((item) => item.id === currentId);
    if (currentItem?.enabled === false) {
      const firstEnabled = enrichedSubNavItems.find((item) => item.enabled !== false);
      if (firstEnabled) {
        setSelectionBySection((prev) => ({ ...prev, curso: firstEnabled.id }));
      }
    }
  }, [activeSection, enrichedSubNavItems, selectionBySection.curso]);

  useEffect(() => {
    if (activeSection !== 'curso' || !progress) return;

    const justFinished = prevCompletingTopicId.current;
    if (justFinished && !completingTopicId) {
      const completedIndex = CURSO_MODULE_DEFINITIONS.findIndex(
        (module) => module.topicId === justFinished,
      );
      const nextDefinition = CURSO_MODULE_DEFINITIONS[completedIndex + 1];
      if (nextDefinition) {
        const nextAccess = progress.modules.find(
          (module) => module.topicId === nextDefinition.topicId,
        );
        if (nextAccess?.enabled) {
          setSelectionBySection((prev) => ({ ...prev, curso: nextDefinition.topicId }));
        }
      }
    }

    prevCompletingTopicId.current = completingTopicId;
  }, [activeSection, completingTopicId, progress]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarDesktopCollapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [sidebarDesktopCollapsed]);

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
    if (activeSection === 'curso') {
      const target = enrichedSubNavItems.find((item) => item.id === id);
      if (target?.enabled === false) return;
    }
    if (activeSection === 'actividad') {
      const target = enrichedSubNavItems.find((item) => item.id === id);
      if (target?.isGroupHeader || target?.enabled === false || target?.id.endsWith('-empty')) {
        return;
      }
    }
    if (activeSection != null) {
      setSelectionBySection((prev) => ({ ...prev, [activeSection]: id }));
    }
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
      ? { activeSubNavId, sectionId: activeSection }
      : {};

  const showSidebar = Boolean(activeSection);
  const mainPadMd = showSidebar ? (sidebarDesktopCollapsed ? 'md:pl-6' : 'md:pl-72') : '';

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        variant="app"
        sections={sections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onBrandClick={handleNavigateToDashboard}
        showModuleSubNavTrigger={Boolean(activeSection)}
        moduleSubNavOpen={mobileSubNavOpen}
        onModuleSubNavTriggerClick={() => setMobileSubNavOpen((o) => !o)}
      />
      {showSidebar ? (
        <FixedSidebar
          key={activeSection}
          items={enrichedSubNavItems}
          activeId={activeSubNavId}
          onActiveIdChange={handleSubNavChange}
          mobileOpen={mobileSubNavOpen}
          onMobileOpenChange={setMobileSubNavOpen}
          desktopCollapsed={sidebarDesktopCollapsed}
        />
      ) : null}

      {showSidebar ? (
        <button
          type="button"
          onClick={() => setSidebarDesktopCollapsed((c) => !c)}
          className={`fixed z-[48] hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200/95 bg-white text-slate-600 shadow-lg shadow-slate-300/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-300 hover:text-cyan-600 hover:shadow-cyan-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:shadow-black/40 dark:hover:border-cyan-600 dark:hover:text-cyan-300 md:flex top-[5.25rem] ${
            sidebarDesktopCollapsed ? 'left-3' : 'left-[calc(18rem-1.25rem)]'
          }`}
          aria-expanded={!sidebarDesktopCollapsed}
          aria-controls="module-subnav"
          aria-label={
            sidebarDesktopCollapsed ? 'Mostrar navegación de contenidos' : 'Ocultar navegación de contenidos'
          }
        >
          {sidebarDesktopCollapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ) : null}

      <main
        className={`flex min-h-0 flex-1 flex-col pt-16 transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mainPadMd}`}
      >
        {isValidElement(children)
          ? cloneElement(children as ReactElement<Record<string, unknown>>, sectionPageProps)
          : children}
      </main>
    </div>
  );
}
