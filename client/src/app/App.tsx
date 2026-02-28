import { RouterProvider } from 'react-router-dom';
import { router } from '@app/routes/router';
import { ThemeProvider } from '@app/providers/ThemeProviders'
import { AuthProvider } from '@app/providers/AuthProvider';

const App = () => (
  <ThemeProvider>
  <AuthProvider >
    <RouterProvider router={router} />
  </AuthProvider>
  </ThemeProvider>
);

export default App;