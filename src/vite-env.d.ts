/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ArcGIS Location Platform API key for English-label map tiles (optional). */
  readonly VITE_ARCGIS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
