import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@app/App';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <App/>
  </StrictMode>,
)
