/**
 * LiveAlertsBanner — bandeau global affichant les alertes mondiales
 * actives, telles qu'agrégées par l'Edge Function `world-alerts`.
 *
 * Se met à jour automatiquement quand de nouvelles alertes arrivent via
 * `subscribeToLiveAlerts`. Cliquable pour aller au centre d'alertes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Activity, ChevronRight, Globe } from 'lucide-react';
import {
  subscribeToLiveAlerts,
  getLiveAlertsSnapshot,
  type LiveAlertsSnapshot,
} from '../lib/liveAlertsService';

interface LiveAlertsBannerProps {
  variant?: 'mobile' | 'desktop';
}

export function LiveAlertsBanner({ variant = 'mobile' }: LiveAlertsBannerProps) {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(
    () => getLiveAlertsSnapshot()
  );

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  // Pas de rendu tant qu'aucune alerte n'est connue
  if (!snapshot || snapshot.alerts.length === 0) {
    return null;
  }

  // Le décompte porte sur `alerts`, la liste complète, et non sur la somme
  // de `byCountry` : ce regroupement écarte les alertes sans code pays
  // (séismes en mer, notamment). L'accueil annonçait « 31 alertes actives »
  // quand la carte de la page /alerts, alimentée par le même instantané au
  // même instant, en affichait 36.
  // Le nombre d'alertes les plus sévères n'est plus affiché ici : c'était une
  // pastille rouge avec un triangle, sur la page d'accueil, au-dessus du
  // moteur de recherche. Le détail reste à un clic, sur /alerts.
  let earthquakeCount = 0;
  for (const alert of snapshot.alerts) {
    if (alert.type === 'earthquake') earthquakeCount++;
  }
  const totalAlerts = snapshot.alerts.length;
  const countriesCount = snapshot.byCountry.size;

  const isDesktop = variant === 'desktop';

  return (
    <button
      type="button"
      onClick={() => navigate('/alerts')}
      className={
        isDesktop
          ? 'w-full flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg text-left'
          : 'w-full flex items-center gap-3 rounded-2xl p-3 transition-all active:scale-[0.98] text-left'
      }
      style={{
        background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.06), rgba(6, 182, 212, 0.06))',
        border: '1px solid var(--lokadia-gray-100)',
      }}
    >
      <div
        className={isDesktop ? 'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl' : 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl'}
        style={{ background: 'rgba(15, 76, 129, 0.10)' }}
      >
        <Globe
          className={isDesktop ? 'h-6 w-6' : 'h-5 w-5'}
          style={{ color: 'var(--lokadia-primary)' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={isDesktop ? 'text-sm font-bold' : 'text-xs font-bold'}
            style={{ color: 'var(--lokadia-primary)' }}
          >
            {totalAlerts} événement{totalAlerts > 1 ? 's' : ''} suivi{totalAlerts > 1 ? 's' : ''} dans le monde
          </p>
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: 'var(--lokadia-secondary)' }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: 'var(--lokadia-secondary)' }}
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--lokadia-secondary-dark, var(--lokadia-secondary))' }}>
              live
            </span>
          </div>
        </div>
        <p className={isDesktop ? 'text-xs' : 'text-[11px]'} style={{ color: 'var(--lokadia-gray-600)' }}>
          {countriesCount} pays concerné{countriesCount > 1 ? 's' : ''} ·{' '}
          {earthquakeCount > 0 && <><Activity className="inline h-3 w-3" /> {earthquakeCount} séisme{earthquakeCount > 1 ? 's' : ''} · </>}
          {snapshot.sources.join(' + ')}
        </p>
      </div>
      <ChevronRight
        className={isDesktop ? 'h-5 w-5 flex-shrink-0' : 'h-4 w-4 flex-shrink-0'}
        style={{ color: 'var(--lokadia-primary)' }}
      />
    </button>
  );
}
