/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOKADIA_SUPABASE_PROJECT_ID?: string;
  readonly VITE_LOKADIA_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
