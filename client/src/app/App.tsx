import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from '@app/providers/session-store';
import { router } from '@app/routes/router';
import { ThemeProvider } from '@app/providers/ThemeProviders'

const App = () => (
  <ThemeProvider>
  <SessionProvider>
    <RouterProvider router={router} />
  </SessionProvider>
  </ThemeProvider>
);

export default App;