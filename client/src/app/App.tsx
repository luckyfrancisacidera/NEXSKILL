import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes/router';
import { ThemeProvider } from '@app/providers/ThemeProvider';
import { AuthProvider } from '@app/providers/AuthProvider';
import { SetupProvider } from '@app/providers/SetupProvider';
import { CurrentCompanyProvider } from '@app/providers/CurrentCompanyProvider';
import { CurrentRecruiterProvider } from '@app/providers/CurrentRecruiterProvider';
import { ToastProvider } from './providers/ToastProvider';
import { ConfirmationProvider } from '@shared/hooks/useConfirmation';

const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <SetupProvider>
          <CurrentCompanyProvider>
            <CurrentRecruiterProvider>
              <ConfirmationProvider>
                <RouterProvider router={router} />
              </ConfirmationProvider>
            </CurrentRecruiterProvider>
          </CurrentCompanyProvider>
        </SetupProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
