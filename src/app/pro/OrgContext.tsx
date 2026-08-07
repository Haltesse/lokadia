/**
 * OrgContext — organisation courante du back-office Pro.
 *
 * Charge les organisations du membre connecté, mémorise la sélection
 * (localStorage), expose le rôle du membre et les entitlements de
 * l'offre. Les écrans Pro consomment ce contexte, jamais supabase
 * directement pour l'org courante.
 */
import {
  createContext, useContext, useCallback, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchMyOrganizations, fetchMyMembership,
  type Organization, type OrgMember,
} from './proService';
import { getEntitlements, pilotDaysLeft, type Entitlements } from './entitlements';

const STORAGE_KEY = 'lokadia_pro_current_org';

interface OrgContextValue {
  loading: boolean;
  error: string | null;
  organizations: Organization[];
  org: Organization | null;
  membership: OrgMember | null;
  entitlements: Entitlements;
  /** Jours restants du pilote (null si pas de pilote) */
  pilotDays: number | null;
  selectOrg: (orgId: string) => void;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const [membership, setMembership] = useState<OrgMember | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setOrganizations([]); setMembership(null); setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const orgs = await fetchMyOrganizations();
      setOrganizations(orgs);
      const chosen = orgs.find((o) => o.id === currentId) ?? orgs[0] ?? null;
      if (chosen) {
        setCurrentId(chosen.id);
        const m = await fetchMyMembership(chosen.id, user.id);
        setMembership(m);
      } else {
        setMembership(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger vos organisations. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  }, [user, currentId]);

  useEffect(() => { refresh(); }, [refresh]);

  const selectOrg = useCallback((orgId: string) => {
    setCurrentId(orgId);
    try { localStorage.setItem(STORAGE_KEY, orgId); } catch { /* stockage plein/privé : sélection non persistée */ }
  }, []);

  const org = useMemo(
    () => organizations.find((o) => o.id === currentId) ?? null,
    [organizations, currentId],
  );

  const value = useMemo<OrgContextValue>(() => ({
    loading,
    error,
    organizations,
    org,
    membership,
    entitlements: getEntitlements(org?.tier),
    pilotDays: pilotDaysLeft(org?.pilot_ends_at),
    selectOrg,
    refresh,
  }), [loading, error, organizations, org, membership, selectOrg, refresh]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg doit être utilisé sous <OrgProvider>');
  return ctx;
}
