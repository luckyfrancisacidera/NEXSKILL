/* =========================================
   APP COMPOSITION
   Composes the provider tree, boot loaders, and root router for the client.
========================================= */

import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes/router';
import { ThemeProvider } from '@app/providers/ThemeProvider';
import { AuthProvider } from '@app/providers/AuthProvider';
import { SetupProvider } from '@app/providers/SetupProvider';
import { CurrentCompanyProvider } from '@app/providers/CurrentCompanyProvider';
import { CurrentRecruiterProvider } from '@app/providers/CurrentRecruiterProvider';
import { NotificationsProvider } from '@app/providers/NotificationsProvider';
import { AtsWakeLoaderSurface } from '@shared/pages/AtsWakeLoaderSurface';
import { isAtsWakeRoute } from '@shared/config/backendWakeRoutes';
import { useBackendWakeIndicator } from '@shared/hooks/useBackendWakeIndicator';
import { ToastProvider } from './providers/ToastProvider';
import { ConfirmationProvider } from '@shared/hooks/useConfirmation';
import { AppLoadingScreen } from '@shared/components/feedback/AppLoadingScreen';
import { useAuth } from '@app/providers/AuthProvider';
import { useSetup } from '@app/providers/SetupProvider';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Analytics } from "@vercel/analytics/react"

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/signup',
  '/company-account-request',
  '/terms',
  '/privacy',
  '/forgot-password',
  '/reset-password',
]);

/* =========================================
   BOOTSTRAP LOADERS
========================================= */

const AppLoadingBoundary = () => {
  const { isAuthenticated, isHydrating, isAppTransitioning } = useAuth();
  const { isLoading: isSetupLoading } = useSetup();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  // Keep protected routes visually blocked until auth and setup state agree on
  // the user's initial destination, otherwise route flashes can occur on boot.
  const shouldShowBootstrapLoader = !isPublicRoute && (isHydrating || (isAuthenticated && isSetupLoading));

  if (!isAppTransitioning && !shouldShowBootstrapLoader) {
    return null;
  }

  return <AppLoadingScreen />;
};

const InitialAtsWakeGate = () => {
  const [isInitialAtsRoute, setIsInitialAtsRoute] = useState(() =>
    typeof window !== 'undefined' ? isAtsWakeRoute(window.location.pathname) : false,
  );
  const { isBackendWarm, isVisible } = useBackendWakeIndicator(isInitialAtsRoute);

  useEffect(() => {
    // The wake surface is only meant for the first ATS-sensitive route load;
    // once the backend is confirmed warm, it does not re-show it on this visit.
    if (isInitialAtsRoute && isBackendWarm) {
      setIsInitialAtsRoute(false);
    }
  }, [isBackendWarm, isInitialAtsRoute]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-120">
      <AtsWakeLoaderSurface fullPage />
    </div>
  );
};

/* =========================================
   PROVIDER TREE
========================================= */

const App = () => (
  <ThemeProvider>
    <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" borderRadius="1rem">
      <ToastProvider>
        <AuthProvider>
          <SetupProvider>
            <CurrentCompanyProvider>
              <CurrentRecruiterProvider>
                <NotificationsProvider>
                  <ConfirmationProvider>
                    <InitialAtsWakeGate />
                    <AppLoadingBoundary />
                    <Analytics />
                    <RouterProvider router={router} />
                  </ConfirmationProvider>
                </NotificationsProvider>
              </CurrentRecruiterProvider>
            </CurrentCompanyProvider>
          </SetupProvider>
        </AuthProvider>
      </ToastProvider>
    </SkeletonTheme>
  </ThemeProvider>
);

export default App;
