import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SwapForm } from './SwapForm';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SwapForm />
  </StrictMode>,
);
