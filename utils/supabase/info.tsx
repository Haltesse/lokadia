/**
 * Point d'entrée canonique de la configuration Supabase côté front.
 *
 * Les valeurs viennent des variables d'env Vite (`VITE_LOKADIA_*`,
 * cf. .env.example). Le repli sur les valeurs du projet permet aux
 * environnements sans .env (préviews) de fonctionner : la clé `anon`
 * est publique par conception et protégée par les policies RLS —
 * la clé `service_role`, elle, ne doit JAMAIS apparaître ici.
 */

export const projectId: string =
  import.meta.env.VITE_LOKADIA_SUPABASE_PROJECT_ID ?? "yprdlcqwloydwzxihepw";

export const publicAnonKey: string =
  import.meta.env.VITE_LOKADIA_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcmRsY3F3bG95ZHd6eGloZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTk4NzcsImV4cCI6MjA4NzYzNTg3N30.8doZFPPL64Un6pnFgTp7L_x9xBht8YnkKrilgmYMhS4";
