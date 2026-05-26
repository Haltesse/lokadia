/**
 * LiveAlertsBanner — bandeau global affichant les alertes catastrophes
 * actives dans le monde (USGS séismes + ReliefWeb catastrophes).
 *
 * Se met à jour automatiquement quand de nouvelles alertes arrivent via
 * `subscribeToLiveAlerts`. Cliquable pour aller au centre d'alertes.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ChevronRight, Globe } from 'lucide-react';
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

  // Pas de rendu si pas encore de snapshot OU aucun pays affecté
  if (!snapshot || snapshot.byCountry.size === 0) {
    return null;
  }

  // Compte total d'alertes (somme sur tous les pays)
  let totalAlerts = 0;
  let redAlerts = 0;
  let earthquakeCount = 0;
  snapshot.byCountry.forEach((alerts) => {
    totalAlerts += alerts.length;
    alerts.forEach((a) => {
      if (a.severity === 'red') redAlerts++;
      if (a.type === 'earthquake') earthquakeCount++;
    });
  });
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
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))',
        border: '1px solid rgba(239, 68, 68, 0.25)',
      }}
    >
      <div
        className={isDesktop ? 'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl' : 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl'}
        style={{ background: 'rgba(239, 68, 68, 0.15)' }}
      >
        <AlertTriangle
          className={isDesktop ? 'h-6 w-6' : 'h-5 w-5'}
          style={{ color: '#dc2626' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={isDesktop ? 'text-sm font-black' : 'text-xs font-black'}
            style={{ color: '#991b1b' }}
          >
            {totalAlerts} alerte{totalAlerts > 1 ? 's' : ''} active{totalAlerts > 1 ? 's' : ''}
            {redAlerts > 0 && (
              <span
                className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black text-white tabular-nums"
                style={{ background: '#dc2626' }}
              >
                {redAlerts} 🚨
              </span>
            )}
          </p>
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: '#dc2626' }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: '#dc2626' }}
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#991b1b' }}>
              live
            </span>
          </div>
        </div>
        <p className={isDesktop ? 'text-xs' : 'text-[11px]'} style={{ color: '#7f1d1d' }}>
          <Globe className="inline h-3 w-3 mr-1" />
          {countriesCount} pays affectés ·{' '}
          {earthquakeCount > 0 && <>🌋 {earthquakeCount} séisme{earthquakeCount > 1 ? 's' : ''} · </>}
          {snapshot.sources.join(' + ')}
        </p>
      </div>
      <ChevronRight
        className={isDesktop ? 'h-5 w-5 flex-shrink-0' : 'h-4 w-4 flex-shrink-0'}
        style={{ color: '#991b1b' }}
      />
    </button>
  );
}
