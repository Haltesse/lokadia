/**
 * ProAppLayout — coque du back-office Lokadia Pro.
 *
 * Desktop-first : sidebar de navigation + zone de contenu dense.
 * Gère : authentification requise, absence d'organisation (onboarding
 * de création), bannière de pilote, sélecteur d'organisation.
 */
import { useState, type FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { Navigate, Outlet, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, Plane, Settings, ShieldCheck, ArrowLeft, Building2,
  FileText, FileCheck2, Siren, Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OrgProvider, useOrg } from '../OrgContext';
import { createOrganization } from '../proService';
import { TIER_PRICING, type OrgTier } from '../entitlements';

const NAV = [
  { to: '/pro/app', end: true, label: 'Tableau de bord', Icon: LayoutDashboard },
  { to: '/pro/app/people', end: false, label: 'Effectif', Icon: Users },
  { to: '/pro/app/missions', end: false, label: 'Missions', Icon: Plane },
  { to: '/pro/app/briefings', end: false, label: 'Briefings', Icon: FileText },
  { to: '/pro/app/compliance', end: false, label: 'Conformité', Icon: FileCheck2 },
  { to: '/pro/app/crisis', end: false, label: 'Crise', Icon: Siren },
  { to: '/pro/app/watch', end: false, label: 'Veille', Icon: Eye },
  { to: '/pro/app/settings', end: false, label: 'Réglages', Icon: Settings },
];

function CreateOrgScreen() {
  const { refresh } = useOrg();
  const [name, setName] = useState('');
  const [tier, setTier] = useState<OrgTier>('starter');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Donnez un nom à votre organisation (2 caractères minimum).');
      setStatus('error');
      return;
    }
    setStatus('saving');
    try {
      await createOrganization(name.trim(), tier);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La création a échoué. Réessayez dans un instant.');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--lokadia-background)' }}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 lk-fade-in-up" style={{ boxShadow: 'var(--shadow-xl)' }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--lokadia-primary)' }}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Créer votre espace organisation</h1>
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>Pilote gratuit de 3 mois, sans engagement.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>Nom de l'organisation</span>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder="Université de Montpellier — DRI"
              autoComplete="organization"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
              style={{ border: '1px solid var(--lokadia-gray-200)' }}
            />
          </label>

          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>Offre visée après le pilote</legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TIER_PRICING) as OrgTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  aria-pressed={tier === t}
                  className="rounded-xl border p-3 text-left transition-all"
                  style={{
                    borderColor: tier === t ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                    background: tier === t ? 'rgba(15,76,129,0.06)' : 'white',
                  }}
                >
                  <p className="text-sm font-bold capitalize" style={{ color: 'var(--lokadia-gray-900)' }}>{t}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--lokadia-primary)' }}>
                    {TIER_PRICING[t].price}{TIER_PRICING[t].unit}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{TIER_PRICING[t].scope}</p>
                </button>
              ))}
            </div>
          </fieldset>

          {status === 'error' && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white"
            style={{ background: 'var(--lokadia-primary)', opacity: status === 'saving' ? 0.7 : 1 }}
          >
            {status === 'saving' ? 'Création…' : 'Démarrer le pilote gratuit'}
          </button>
        </form>
      </div>
    </div>
  );
}

function LayoutInner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, org, organizations, membership, entitlements, pilotDays, selectOrg, refresh } = useOrg();

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ background: 'var(--lokadia-background)' }} aria-busy="true">
        <div className="lk-skeleton mb-6 h-8 w-56 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="lk-skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--lokadia-background)' }}>
        <div className="text-center max-w-md">
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--lokadia-gray-900)' }}>Impossible de charger votre espace</p>
          <p className="text-sm mb-5" style={{ color: 'var(--lokadia-gray-600)' }}>{error}</p>
          <button onClick={() => refresh()} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!org) return <CreateOrgScreen />;

  const roleLabel: Record<string, string> = {
    admin: 'Admin', manager: 'Gestionnaire', viewer: 'Lecture seule', dept_lead: 'Référent département',
  };

  return (
    <div className="min-h-screen lg:flex" style={{ background: 'var(--lokadia-background)' }}>
      {/* Sidebar */}
      <aside className="flex flex-col border-b bg-white lg:h-screen lg:w-60 lg:border-b-0 lg:border-r lg:sticky lg:top-0" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <div className="flex items-center gap-2.5 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--lokadia-primary)' }}>
            <ShieldCheck className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight" style={{ color: 'var(--lokadia-gray-900)' }}>Lokadia Pro</p>
            <p className="truncate text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{entitlements.label}</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0" aria-label="Navigation Lokadia Pro">
          {NAV.map(({ to, end, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors"
              style={({ isActive }) => ({
                color: isActive ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)',
                background: isActive ? 'rgba(15,76,129,0.08)' : 'transparent',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden space-y-3 p-4 lg:block">
          {pilotDays !== null && (
            <div className="rounded-2xl p-3.5" style={{ background: 'var(--lokadia-info-bg)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--lokadia-primary)' }}>
                Pilote gratuit — {pilotDays} jour{pilotDays > 1 ? 's' : ''} restant{pilotDays > 1 ? 's' : ''}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
                Aucune carte demandée pendant le pilote.
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/global-home')}
            className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold"
            style={{ color: 'var(--lokadia-gray-500)' }}
          >
            <ArrowLeft size={14} /> Retour à l'app voyageur
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-6 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
          {organizations.length > 1 ? (
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>Organisation</span>
              <select
                value={org.id}
                onChange={(e) => selectOrg(e.target.value)}
                className="rounded-lg border px-2.5 py-1.5 text-sm font-semibold"
                style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-900)' }}
              >
                {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
          ) : (
            <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{org.name}</p>
          )}

          <div className="flex items-center gap-3">
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}>
              {roleLabel[membership?.role ?? 'viewer']}
            </span>
            <span className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>{user?.email}</span>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function ProAppLayout() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <OrgProvider>
      <LayoutInner />
    </OrgProvider>
  );
}
