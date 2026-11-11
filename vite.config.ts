/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from https://<user>.github.io/<repo>/.
// Change this ONE value if the repo is renamed (use '/' for a custom domain).
export const BASE_PATH = '/pin-party/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  // Main bundle is React + Leaflet (~155 kB gzipped); fine for this app.
  build: { chunkSizeWarningLimit: 700 },
  test: {
    environment: 'node',
  },
});
