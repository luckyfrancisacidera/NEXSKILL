import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from '@app/providers/session-store';
import { router } from '@app/routes/router';

const App = () => (
  <SessionProvider>
    <RouterProvider router={router} />
  </SessionProvider>
);

export default App;