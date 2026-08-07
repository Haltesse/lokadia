/**
 * ProSettingsScreen — réglages de l'organisation (Lot P1, volet minimal).
 *
 * Affiche l'offre, le pilote, les plafonds et le rôle du membre.
 * Les invitations d'équipe et le journal d'audit arrivent au Lot P2
 * (annoncés honnêtement, pas simulés).
 */
import { useMemo, useState, type FormEvent } from 'react';
import { Building2, Users, ShieldCheck, Clock } from 'lucide-react';
import { useOrg } from '../OrgContext';
import { supabase } from '../../lib/supabase';
import { TIER_PRICING } from '../entitlements';

export default function ProSettingsScreen() {
  const { org, membership, entitlements, pilotDays, refresh } = useOrg();
  const isAdmin = membership?.role === 'admin';
  const [name, setName] = useState(org?.name ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const pilotEnd = useMemo(
    () => (org?.pilot_ends_at ? new Date(org.pilot_ends_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null),
    [org?.pilot_ends_at],
  );

  if (!org) return null;

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (!org || name.trim().length < 2) return;
    setStatus('saving');
    const { error } = await supabase.from('organizations').update({ name: name.trim() }).eq('id', org.id);
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('saved');
      await refresh();
    }
  }

  const pricing = TIER_PRICING[entitlements.tier];

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Réglages</h1>

      {/* Organisation */}
      <section className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={17} style={{ color: 'var(--lokadia-primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Organisation</h2>
        </div>
        {isAdmin ? (
          <form onSubmit={saveName} className="flex flex-wrap items-end gap-3">
            <label className="block flex-1">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Nom</span>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setStatus('idle'); }}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              />
            </label>
            <button type="submit" disabled={status === 'saving' || name.trim() === org.name} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ background: 'var(--lokadia-primary)' }}>
              {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {status === 'saved' && <p className="text-sm font-semibold" style={{ color: '#059669' }}>Nom mis à jour.</p>}
            {status === 'error' && <p className="text-sm font-semibold text-red-600">{errorMsg}</p>}
          </form>
        ) : (
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-700)' }}>{org.name}</p>
        )}
      </section>

      {/* Offre & pilote */}
      <section className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={17} style={{ color: 'var(--lokadia-primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Offre</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Formule</p>
            <p className="mt-0.5 text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{entitlements.label}</p>
            <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>{pricing.price}{pricing.unit} · {pricing.scope}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Plafond effectif</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>
              {entitlements.maxTravelers ?? 'Illimité'}
            </p>
          </div>
          {pilotDays !== null && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Pilote gratuit</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-lg font-bold tabular-nums" style={{ color: 'var(--lokadia-primary)' }}>
                <Clock size={16} /> {pilotDays} j restants
              </p>
              {pilotEnd && <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>Fin le {pilotEnd}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Équipe */}
      <section className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
        <div className="mb-3 flex items-center gap-2">
          <Users size={17} style={{ color: 'var(--lokadia-primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Équipe & rôles</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
          Votre rôle : <strong style={{ color: 'var(--lokadia-gray-900)' }}>
            {{ admin: 'Administrateur', manager: 'Gestionnaire', viewer: 'Lecture seule', dept_lead: 'Référent département' }[membership?.role ?? 'viewer']}
          </strong>.
          Les invitations de collègues (gestionnaires, lecture seule, référents de département)
          arrivent au prochain lot, avec le journal d'audit des actions.
        </p>
      </section>
    </div>
  );
}
