import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, RefreshCw, WifiOff, XCircle, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { SOURCE_HOMEPAGES } from '../lib/officialSources';

/**
 * Page statut.
 *
 * Honnêteté du dispositif : il n'y a pas d'historique de disponibilité ici,
 * parce qu'il n'y a pas de sonde qui tourne en continu. Ce que cette page
 * affiche est une vérification faite **maintenant, depuis votre
 * navigateur** — ce qui a l'avantage de tester le chemin réel, réseau de
 * l'utilisateur compris, et le défaut de ne rien dire d'hier. C'est dit tel
 * quel plutôt que d'afficher un « 99,9 % » invérifiable.
 *
 * Les sites des organismes officiels ne sont pas sondés : leurs serveurs
 * n'autorisent pas les appels depuis un autre domaine, un échec ne
 * signifierait donc rien. Ils sont listés avec un lien direct.
 */

type Health = 'checking' | 'ok' | 'slow' | 'error' | 'offline';

interface Probe {
  id: string;
  label: string;
  description: string;
  url: string;
}

const FUNCTIONS_BASE = `https://${projectId}.supabase.co/functions/v1`;

const PROBES: Probe[] = [
  {
    id: 'lokascore',
    label: 'Calcul du Lokascore',
    description: "Service qui agrège les sources officielles et produit le score indicatif.",
    url: `${FUNCTIONS_BASE}/lokascore-compute?destination=paris-france`,
  },
  {
    id: 'alerts',
    label: 'Alertes mondiales',
    description: 'Collecte des alertes de sécurité, de santé et de catastrophes en cours.',
    url: `${FUNCTIONS_BASE}/world-alerts`,
  },
  {
    id: 'auth',
    label: 'Comptes et base de données',
    description: 'Authentification, voyages enregistrés et synchronisation.',
    url: `https://${projectId}.supabase.co/auth/v1/health`,
  },
];

interface ProbeResult {
  health: Health;
  latencyMs?: number;
  detail?: string;
}

/** Au-delà, le service répond mais l'expérience est dégradée. */
const SLOW_MS = 4000;

const STATUS_META: Record<Health, { label: string; color: string; bg: string }> = {
  checking: { label: 'Vérification…', color: 'var(--lokadia-gray-500)', bg: 'var(--lokadia-gray-100)' },
  ok: { label: 'Opérationnel', color: 'var(--lokadia-success)', bg: 'var(--lokadia-success-bg)' },
  slow: { label: 'Lent', color: '#B45309', bg: 'var(--lokadia-warning-bg)' },
  error: { label: 'Injoignable', color: 'var(--lokadia-danger)', bg: 'var(--lokadia-danger-bg)' },
  offline: { label: 'Hors connexion', color: 'var(--lokadia-gray-600)', bg: 'var(--lokadia-gray-100)' },
};

function StatusIcon({ health }: { health: Health }) {
  const { color } = STATUS_META[health];
  if (health === 'ok') return <CheckCircle2 size={18} style={{ color }} />;
  if (health === 'slow') return <AlertTriangle size={18} style={{ color }} />;
  if (health === 'offline') return <WifiOff size={18} style={{ color }} />;
  if (health === 'error') return <XCircle size={18} style={{ color }} />;
  return <RefreshCw size={18} className="animate-spin" style={{ color }} />;
}

export default function StatusScreen() {
  const [results, setResults] = useState<Record<string, ProbeResult>>({});
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [running, setRunning] = useState(false);

  const runChecks = useCallback(async () => {
    setRunning(true);
    setResults(Object.fromEntries(PROBES.map((p) => [p.id, { health: 'checking' as Health }])));

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setResults(Object.fromEntries(PROBES.map((p) => [p.id, { health: 'offline' as Health }])));
      setCheckedAt(new Date());
      setRunning(false);
      return;
    }

    const entries = await Promise.all(
      PROBES.map(async (probe): Promise<[string, ProbeResult]> => {
        const started = performance.now();
        try {
          const res = await fetch(probe.url, {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              apikey: publicAnonKey,
            },
            signal: AbortSignal.timeout(12000),
          });
          const latencyMs = Math.round(performance.now() - started);
          if (!res.ok) {
            return [probe.id, { health: 'error', latencyMs, detail: `Réponse HTTP ${res.status}` }];
          }
          return [probe.id, { health: latencyMs > SLOW_MS ? 'slow' : 'ok', latencyMs }];
        } catch (error) {
          const detail =
            error instanceof DOMException && error.name === 'TimeoutError'
              ? 'Aucune réponse en 12 secondes'
              : 'Connexion impossible';
          return [probe.id, { health: 'error', detail }];
        }
      }),
    );

    setResults(Object.fromEntries(entries));
    setCheckedAt(new Date());
    setRunning(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
      <h1 className="text-2xl font-bold lg:text-3xl" style={{ color: 'var(--lokadia-gray-900)' }}>
        Statut des services
      </h1>
      <p className="mt-3 text-[15px] leading-7" style={{ color: 'var(--lokadia-gray-600)' }}>
        Cette page teste les services de Lokadia <strong>depuis votre navigateur, à
        l'instant</strong>. Elle mesure donc le chemin réel — votre réseau compris — mais
        ne conserve aucun historique : nous préférons une vérification vraie à un taux de
        disponibilité que personne ne peut contrôler.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void runChecks()}
          disabled={running}
          className="lk-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'var(--lokadia-primary)' }}
        >
          <RefreshCw size={16} className={running ? 'animate-spin' : undefined} />
          Relancer la vérification
        </button>
        {checkedAt && (
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            Dernière vérification à{' '}
            {checkedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {PROBES.map((probe) => {
          const result = results[probe.id] ?? { health: 'checking' as Health };
          const meta = STATUS_META[result.health];
          return (
            <div
              key={probe.id}
              className="rounded-2xl border p-4"
              style={{ borderColor: 'var(--lokadia-gray-100)', background: 'white' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {probe.label}
                  </p>
                  <p className="mt-1 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
                    {probe.description}
                  </p>
                </div>
                <span
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <StatusIcon health={result.health} />
                  {meta.label}
                </span>
              </div>
              {(result.latencyMs !== undefined || result.detail) && (
                <p className="mt-2 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                  {result.detail}
                  {result.detail && result.latencyMs !== undefined ? ' · ' : ''}
                  {result.latencyMs !== undefined ? `${result.latencyMs} ms` : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          Sources officielles
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
          Les publications ci-dessous alimentent le Lokascore, les alertes et les
          formalités. Elles ne sont pas sondées depuis cette page : leurs serveurs
          n'autorisent pas les appels venus d'un autre site, un échec ne voudrait donc
          rien dire. En cas de doute sur une information, consultez directement la
          source.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            ['France Diplomatie (MEAE)', SOURCE_HOMEPAGES.franceDiplomatie],
            ['Organisation mondiale de la santé', SOURCE_HOMEPAGES.who],
            ['GDACS — alertes catastrophes (ONU)', SOURCE_HOMEPAGES.gdacs],
            ['OSAC — US Department of State', SOURCE_HOMEPAGES.osac],
            ['CDC Travel Health', SOURCE_HOMEPAGES.cdc],
            ['ReliefWeb', SOURCE_HOMEPAGES.reliefWeb],
          ].map(([label, url]) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-700)' }}
            >
              {label}
              <ExternalLink size={14} style={{ color: 'var(--lokadia-gray-400)' }} />
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
