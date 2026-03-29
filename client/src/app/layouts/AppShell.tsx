/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';

import { useAuth } from '@app/providers/AuthProvider';
import { AtsWakeLoaderSurface } from '@shared/components/AtsWakeLoaderSurface';
import { RouteNavigationFeedback } from '@shared/components/RouteNavigationFeedback';
import { Sidebar } from '@shared/components/Sidebar';
import { Topbar } from '@shared/components/Topbar';
import { isAtsWakeRoute } from '@shared/config/backendWakeRoutes';
import { useBackendWakeIndicator } from '@shared/hooks/useBackendWakeIndicator';
import { usePermissions } from '@shared/hooks/usePermissions';
import {
  getNavigationContext,
  getNavigationPageTitle,
  resolveNavigationSection,
} from '@shared/config/appNavigation';

export const AppShell = () => {
  const location = useLocation();
  const navigation = useNavigation();
  const { clearAppTransition } = useAuth();
  const { isSuperAdmin, isCompanyAdmin, isRecruiter } = usePermissions();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarHovered, setIsDesktopSidebarHovered] = useState(false);

  const section = resolveNavigationSection({ isSuperAdmin, isCompanyAdmin, isRecruiter });
  const navigationContext = getNavigationContext(section);
  const pageTitle = getNavigationPageTitle(location.pathname, navigationContext);
  const isDesktopSidebarExpanded = isDesktopSidebarHovered;
  const wakeTargetPath = navigation.location?.pathname ?? location.pathname;
  const shouldUseWakeLoader = isAtsWakeRoute(wakeTargetPath);
  const { isVisible: showWakeLoader } = useBackendWakeIndicator(shouldUseWakeLoader);

  useEffect(() => {
    clearAppTransition();
  }, [clearAppTransition, location.pathname, location.search]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 1024;

    if (!isMobileSidebarOpen || !isMobileViewport) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="relative min-h-screen bg-zinc-50 font-inter text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <RouteNavigationFeedback />
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden ${
          isMobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        isDesktopExpanded={isDesktopSidebarExpanded}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onDesktopHoverChange={setIsDesktopSidebarHovered}
      />

      <div className="relative min-h-screen min-w-0 lg:pl-20">
        <div className="min-w-0 flex min-h-screen flex-col">
          <Topbar onMenuToggle={() => setIsMobileSidebarOpen(true)} pageTitle={pageTitle} />
          <main className="min-w-0 flex-1 bg-zinc-50 p-4 transition-colors duration-300 sm:p-6 lg:p-8 dark:bg-zinc-950">
            {/* Shared delayed wake-up affordance for ATS-heavy routes. */}
            {showWakeLoader ? <AtsWakeLoaderSurface /> : null}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
