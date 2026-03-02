import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes/router';
import { ThemeProvider } from '@app/providers/ThemeProviders'
import { AuthProvider } from '@app/providers/AuthProvider';
import { ToastProvider } from './providers/ToastProvider';
const App = () => (
  <ThemeProvider>
  <ToastProvider>
  <AuthProvider >
    <RouterProvider router={router} />
  </AuthProvider>
  </ToastProvider>
  </ThemeProvider>
);

export default App;