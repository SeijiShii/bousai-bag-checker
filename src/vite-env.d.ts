/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly VITE_BACKEND?: 'memory' | 'http';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
