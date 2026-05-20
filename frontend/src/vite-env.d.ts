/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_ENABLED?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.geojson' {
  const value: GeoJSON.FeatureCollection;
  export default value;
}
