import { supabase } from './supabase';

/**
 * Enregistre une inscription landing page dans Supabase.
 * Table : landing_signups (email text primary key, source text, created_at timestamptz default now())
 * Si la table n'existe pas encore, l'appel échoue silencieusement mais ne bloque pas l'UX.
 */
export async function registerLandingSignup(
  email: string,
  source: string = 'landing'
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'Email invalide' };
  }

  try {
    // ON CONFLICT DO NOTHING : un email déjà inscrit ne déclenche ni erreur
    // ni mise à jour (la policy RLS n'autorise que l'insertion)
    const { error } = await supabase
      .from('landing_signups')
      .upsert(
        { email: trimmed, source },
        { onConflict: 'email', ignoreDuplicates: true }
      );

    if (error) {
      // Table possiblement non créée — on conserve l'email en local pour secours
      console.warn('[landingSignup] Supabase error:', error.message);
      try {
        const existing = JSON.parse(localStorage.getItem('lokadia_landing_signups') || '[]');
        existing.push({ email: trimmed, source, at: Date.now() });
        localStorage.setItem('lokadia_landing_signups', JSON.stringify(existing));
      } catch {
        // localStorage indisponible : le lead est perdu, l'UX reste fluide
      }
      return { ok: true }; // on dit OK pour l'UX — fallback local est fait
    }

    return { ok: true };
  } catch (e: unknown) {
    console.error('[landingSignup]', e);
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
