import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes/router';
import { ThemeProvider } from '@app/providers/ThemeProvider';
import { AuthProvider } from '@app/providers/AuthProvider';
import { SetupProvider } from '@app/providers/SetupProvider';
import { CurrentCompanyProvider } from '@app/providers/CurrentCompanyProvider';
import { CurrentRecruiterProvider } from '@app/providers/CurrentRecruiterProvider';
import { NotificationsProvider } from '@app/providers/NotificationsProvider';
import { AtsWakeLoaderSurface } from '@shared/components/AtsWakeLoaderSurface';
import { isAtsWakeRoute } from '@shared/config/backendWakeRoutes';
import { useBackendWakeIndicator } from '@shared/hooks/useBackendWakeIndicator';
import { ToastProvider } from './providers/ToastProvider';
import { ConfirmationProvider } from '@shared/hooks/useConfirmation';

const InitialAtsWakeGate = () => {
  const [isInitialAtsRoute, setIsInitialAtsRoute] = useState(() =>
    typeof window !== 'undefined' ? isAtsWakeRoute(window.location.pathname) : false,
  );
  const { isBackendWarm, isVisible } = useBackendWakeIndicator(isInitialAtsRoute);

  useEffect(() => {
    if (isInitialAtsRoute && isBackendWarm) {
      setIsInitialAtsRoute(false);
    }
  }, [isBackendWarm, isInitialAtsRoute]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]">
      <AtsWakeLoaderSurface fullPage />
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <SetupProvider>
          <CurrentCompanyProvider>
            <CurrentRecruiterProvider>
              <NotificationsProvider>
                <ConfirmationProvider>
                  <InitialAtsWakeGate />
                  <RouterProvider router={router} />
                </ConfirmationProvider>
              </NotificationsProvider>
            </CurrentRecruiterProvider>
          </CurrentCompanyProvider>
        </SetupProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
