/**
 * ProSettingsScreen — réglages de l'organisation (Lot P1, volet minimal).
 *
 * Affiche l'offre, le pilote, les plafonds et le rôle du membre.
 * Les invitations d'équipe et le journal d'audit arrivent au Lot P2
 * (annoncés honnêtement, pas simulés).
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Building2, Users, ShieldCheck, Clock, UserPlus, Copy, Plug, Palette } from 'lucide-react';
import { useOrg } from '../OrgContext';
import { supabase } from '../../lib/supabase';
import { fetchDepartments, fetchMembers, inviteMember, type Department, type OrgMember } from '../proService';
import { TIER_PRICING, hasFeature } from '../entitlements';
import { IntegrationsPanel } from '../components/IntegrationsPanel';
import { BrandingPanel } from '../components/BrandingPanel';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur', manager: 'Gestionnaire',
  viewer: 'Lecture seule', dept_lead: 'Référent département',
};

const ROLE_HELP: Record<string, string> = {
  admin: 'Gère l\'organisation, les membres et toutes les données.',
  manager: 'Crée et modifie l\'effectif, les missions et les briefings.',
  viewer: 'Consulte sans rien modifier.',
  dept_lead: 'Ne voit que les personnes de son département.',
};

export default function ProSettingsScreen() {
  const { org, membership, entitlements, pilotDays, refresh } = useOrg();
  const isAdmin = membership?.role === 'admin';
  const [name, setName] = useState(org?.name ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Invitations
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [invite, setInvite] = useState({ email: '', role: 'viewer', departmentId: '' });
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ kind: 'ok' | 'error'; text: string; link?: string } | null>(null);

  useEffect(() => {
    if (!org) return;
    let cancelled = false;
    (async () => {
      try {
        const [m, d] = await Promise.all([fetchMembers(org.id), fetchDepartments(org.id)]);
        if (cancelled) return;
        setMembers(m);
        setDepartments(d);
      } catch {
        // Liste indisponible : la section affiche l'état vide, l'invitation reste possible
      }
    })();
    return () => { cancelled = true; };
  }, [org]);

  async function submitInvite(e: FormEvent) {
    e.preventDefault();
    if (!org) return;
    setInviteMsg(null);
    setInviting(true);
    try {
      const res = await inviteMember(
        org.id,
        invite.email.trim(),
        invite.role,
        invite.role === 'dept_lead' ? (invite.departmentId || null) : null,
      );
      setInviteMsg(
        res.actionLink
          ? {
              kind: 'ok',
              text: `${invite.email} a été rattaché à l'organisation, mais l'email n'a pas pu être envoyé (SMTP non configuré sur le projet). Transmettez-lui ce lien de connexion :`,
              link: res.actionLink,
            }
          : {
              kind: 'ok',
              text: res.status === 'invited'
                ? `Invitation envoyée à ${invite.email}.`
                : `${invite.email} a été ajouté à l'organisation (compte existant).`,
            },
      );
      setInvite({ email: '', role: 'viewer', departmentId: '' });
      setMembers(await fetchMembers(org.id));
    } catch (err) {
      setInviteMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Invitation impossible.' });
    } finally {
      setInviting(false);
    }
  }

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
        <p className="mb-4 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
          Votre rôle : <strong style={{ color: 'var(--lokadia-gray-900)' }}>{ROLE_LABELS[membership?.role ?? 'viewer']}</strong>.
          {' '}{members.length} membre{members.length > 1 ? 's' : ''} dans l'organisation.
        </p>

        {members.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style={{ background: 'var(--lokadia-gray-50, #FAFAFA)' }}>
                <span style={{ color: 'var(--lokadia-gray-700)' }}>
                  {m.user_id === membership?.user_id ? 'Vous' : `Membre ${m.user_id.slice(0, 8)}…`}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </span>
              </li>
            ))}
          </ul>
        )}

        {isAdmin ? (
          <form onSubmit={submitInvite} className="rounded-xl p-4" style={{ background: 'var(--lokadia-info-bg)' }}>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--lokadia-primary)' }}>
              <UserPlus size={14} /> Inviter un collègue
            </p>
            <div className="grid gap-2.5 md:grid-cols-3">
              <input
                type="email"
                value={invite.email}
                onChange={(e) => { setInvite({ ...invite, email: e.target.value }); setInviteMsg(null); }}
                placeholder="prenom.nom@etablissement.fr"
                autoComplete="off"
                className="w-full rounded-lg border px-3 py-2.5 text-sm md:col-span-2"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              />
              <select
                value={invite.role}
                onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              >
                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            {invite.role === 'dept_lead' && (
              <select
                value={invite.departmentId}
                onChange={(e) => setInvite({ ...invite, departmentId: e.target.value })}
                className="mt-2.5 w-full rounded-lg border px-3 py-2.5 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              >
                <option value="">Département visible (tous si non précisé)</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}

            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
              {ROLE_HELP[invite.role]}
            </p>

            <button
              type="submit"
              disabled={inviting || invite.email.trim().length === 0}
              className="mt-3 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              {inviting ? 'Envoi…' : 'Envoyer l\'invitation'}
            </button>

            {inviteMsg && (
              <div className="mt-3">
                <p className="text-sm font-semibold" style={{ color: inviteMsg.kind === 'ok' ? 'var(--lokadia-success)' : '#DC2626' }}>
                  {inviteMsg.text}
                </p>
                {inviteMsg.link && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(inviteMsg.link as string)}
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold"
                    style={{ color: 'var(--lokadia-primary)', border: '1px solid var(--lokadia-gray-200)' }}
                  >
                    <Copy size={12} /> Copier le lien de connexion
                  </button>
                )}
              </div>
            )}
          </form>
        ) : (
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            Seul un administrateur peut inviter de nouveaux membres.
          </p>
        )}
      </section>

      {/* Marque blanche — Enterprise */}
      {org && hasFeature(org.tier, "api") && (
        <section className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--lokadia-gray-100)" }}>
          <div className="mb-4 flex items-center gap-2">
            <Palette size={17} style={{ color: "var(--lokadia-primary)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--lokadia-gray-900)" }}>Marque</h2>
          </div>
          <BrandingPanel orgId={org.id} settings={org.settings} isAdmin={isAdmin} onSaved={refresh} />
        </section>
      )}

      {/* Intégrations — API et webhooks */}
      {org && (
        <section className="rounded-2xl bg-white p-5" style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--lokadia-gray-100)" }}>
          <div className="mb-4 flex items-center gap-2">
            <Plug size={17} style={{ color: "var(--lokadia-primary)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--lokadia-gray-900)" }}>Intégrations</h2>
          </div>
          {hasFeature(org.tier, "api") ? (
            <IntegrationsPanel orgId={org.id} isAdmin={isAdmin} />
          ) : (
            <p className="text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
              L’API et les webhooks font partie de l’offre Enterprise. Ils exposent
              en lecture les missions, l’effectif, les alertes de veille et les
              évaluations de risque.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
