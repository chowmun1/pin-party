import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
// Fonts are self-hosted so the game looks right even offline at a party.
import '@fontsource/alfa-slab-one/400.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/patrick-hand/400.css';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { router } from './router';
import { APP_NAME } from './config';

document.title = APP_NAME;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
