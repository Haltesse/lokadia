import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Marque blanche — couleur d'accent et nom affiché de l'organisation.
 *
 * Volontairement limité à ce qui est tenable : une couleur et un libellé,
 * appliqués au back-office. Pas de remplacement du logo Lokadia ni de
 * domaine personnalisé : les promettre supposerait un hébergement dédié et
 * un contrat de niveau de service qui n'existent pas encore.
 *
 * La couleur est validée avant d'être stockée (`#rrggbb`) : une valeur
 * libre injectée dans une variable CSS finirait dans le style de la page.
 */

export interface OrgBranding {
  accent?: string;
  displayName?: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function readBranding(settings: unknown): OrgBranding {
  if (!settings || typeof settings !== 'object') return {};
  const branding = (settings as { branding?: unknown }).branding;
  if (!branding || typeof branding !== 'object') return {};
  const { accent, displayName } = branding as OrgBranding;
  return {
    accent: typeof accent === 'string' && HEX.test(accent) ? accent : undefined,
    displayName: typeof displayName === 'string' ? displayName : undefined,
  };
}

export function BrandingPanel({
  orgId,
  settings,
  isAdmin,
  onSaved,
}: {
  orgId: string;
  settings: unknown;
  isAdmin: boolean;
  onSaved: () => Promise<void> | void;
}) {
  const initial = readBranding(settings);
  const [accent, setAccent] = useState(initial.accent ?? '#0F4C81');
  const [displayName, setDisplayName] = useState(initial.displayName ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAdmin) {
    return (
      <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
        Seul un administrateur peut modifier la marque de l'organisation.
      </p>
    );
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!HEX.test(accent)) {
      setMessage('La couleur doit être un code hexadécimal à six chiffres (ex. #0F4C81).');
      return;
    }
    setBusy(true);
    try {
      const base = (settings && typeof settings === 'object' ? settings : {}) as Record<string, unknown>;
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: { ...base, branding: { accent, displayName: displayName.trim() || undefined } },
        })
        .eq('id', orgId);
      if (error) throw error;
      setMessage('Marque enregistrée.');
      await onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
          Nom affiché dans le back-office
        </label>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Ex. Direction des relations internationales"
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--lokadia-gray-200)' }}
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
          Couleur d'accent
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="color"
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
            className="h-10 w-14 cursor-pointer rounded-lg border"
            style={{ borderColor: 'var(--lokadia-gray-200)' }}
            aria-label="Couleur d'accent"
          />
          <code className="font-mono text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
            {accent}
          </code>
        </div>
      </div>

      <p className="text-xs leading-5" style={{ color: 'var(--lokadia-gray-500)' }}>
        Le logo Lokadia et le domaine restent les nôtres : une marque blanche
        complète suppose un hébergement dédié et un engagement de service que
        nous ne pouvons pas encore tenir.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="lk-btn rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        style={{ background: 'var(--lokadia-primary)' }}
      >
        Enregistrer
      </button>

      {message && (
        <p className="text-sm" role="status" style={{ color: 'var(--lokadia-gray-600)' }}>
          {message}
        </p>
      )}
    </form>
  );
}
