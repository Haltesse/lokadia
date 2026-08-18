/**
 * ProDashboardScreen — tableau de bord v1 (Lot P1).
 *
 * Règles : chaque tuile est cliquable vers la liste filtrée, affiche sa
 * méthode de calcul au survol (title), le score passe par LokascoreBadge,
 * pas de vanity metric. Indicateurs livrés : personnes à l'étranger,
 * exposition globale (indicatif), couverture de conformité, départs J-30
 * incomplets, répartition par pays (concentration du risque).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Users, ShieldAlert, FileCheck2, CalendarClock, Upload, Plane, Siren, Timer,
  BellRing, MapPinned,
} from 'lucide-react';
import { useOrg } from '../OrgContext';
import {
  fetchMissions, fetchTravelers, fetchCheckins, fetchCheckinResponses,
  fetchWatchAlerts, isMissionActiveToday, isMissionUpcoming,
  complianceComplete, type MissionWithCompliance, type Traveler,
  type CheckinRequest, type CheckinResponseWithTraveler, type WatchAlert,
} from '../proService';
import { hasFeature } from '../entitlements';
import { fetchLokascore, type LokascoreApiResult } from '../../lib/lokascoreApi';
import { LokascoreBadge } from '../../components/LokascoreBadge';
import type { DimensionSources } from '../../hooks/useLokascore';

interface CountryRow {
  iso: string;
  name: string;
  travelerIds: Set<string>;
  score: number | null;
  result: LokascoreApiResult | null;
}

function StatTile({
  label, value, sub, method, Icon, onClick, alert = false,
}: {
  label: string;
  value: string;
  sub: string;
  /** Méthode de calcul + période — affichée au survol */
  method: string;
  Icon: typeof Users;
  onClick: () => void;
  alert?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={method}
      className="lk-card-hover rounded-2xl bg-white p-5 text-left"
      style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>{label}</span>
        <Icon size={17} style={{ color: alert ? 'var(--lokadia-warning)' : 'var(--lokadia-primary)' }} />
      </div>
      <p className="text-3xl font-bold tabular-nums" style={{ color: alert ? 'var(--lokadia-warning)' : 'var(--lokadia-gray-900)' }}>{value}</p>
      <p className="mt-1 text-xs leading-snug" style={{ color: 'var(--lokadia-gray-500)' }}>{sub}</p>
    </button>
  );
}

function OnboardingSteps({ hasTravelers }: { hasTravelers: boolean }) {
  const navigate = useNavigate();
  const steps = [
    {
      done: hasTravelers,
      title: '1. Importez votre effectif',
      desc: 'Un fichier CSV suffit — une promo entière en moins de 10 minutes.',
      cta: 'Importer l\'effectif', to: '/pro/app/people', Icon: Upload,
    },
    {
      done: false,
      title: '2. Créez vos premières missions',
      desc: 'Qui part, où, quand. Le dossier de conformité se crée automatiquement.',
      cta: 'Créer une mission', to: '/pro/app/missions', Icon: Plane,
    },
  ];
  const next = steps.find((s) => !s.done) ?? steps[steps.length - 1];

  return (
    <div className="rounded-3xl bg-white p-8 text-center lk-fade-in-up" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(15,76,129,0.08)' }}>
        <next.Icon size={26} style={{ color: 'var(--lokadia-primary)' }} />
      </div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{next.title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>{next.desc}</p>
      <button
        onClick={() => navigate(next.to)}
        className="mt-5 rounded-xl px-6 py-3 text-sm font-bold text-white"
        style={{ background: 'var(--lokadia-primary)' }}
      >
        {next.cta}
      </button>
      <p className="mt-4 text-xs" style={{ color: 'var(--lokadia-gray-400)' }}>
        Étapes suivantes : dossiers de conformité, puis exercice de crise (bientôt).
      </p>
    </div>
  );
}

export default function ProDashboardScreen() {
  const navigate = useNavigate();
  const { org, pilotDays } = useOrg();
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [missions, setMissions] = useState<MissionWithCompliance[]>([]);
  const [scores, setScores] = useState<Record<string, LokascoreApiResult>>({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastCheckin, setLastCheckin] = useState<CheckinRequest | null>(null);
  const [lastResponses, setLastResponses] = useState<CheckinResponseWithTraveler[]>([]);
  const [openAlerts, setOpenAlerts] = useState<WatchAlert[]>([]);

  useEffect(() => {
    if (!org) return;
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        const [t, m] = await Promise.all([fetchTravelers(org.id), fetchMissions(org.id)]);
        if (cancelled) return;
        setTravelers(t);
        setMissions(m);
        setStatus('ready');

        // Alertes de veille non traitées — la file qui doit faire mal
        if (hasFeature(org.tier, 'watchlist')) {
          const wa = await fetchWatchAlerts(org.id, true);
          if (!cancelled) setOpenAlerts(wa);
        }

        // Dernier check-in : alimente les indicateurs de réactivité
        if (hasFeature(org.tier, 'crisis')) {
          const checkins = await fetchCheckins(org.id);
          if (!cancelled && checkins[0]) {
            setLastCheckin(checkins[0]);
            const r = await fetchCheckinResponses(checkins[0].id);
            if (!cancelled) setLastResponses(r);
          }
        }

        // Scores des destinations couvertes par le catalogue (actifs uniquement)
        const ids = [...new Set(m.filter((x) => isMissionActiveToday(x) && x.destination_id).map((x) => x.destination_id as string))];
        const results = await Promise.all(ids.map((id) => fetchLokascore(id, 'default', {})));
        if (cancelled) return;
        const map: Record<string, LokascoreApiResult> = {};
        ids.forEach((id, i) => { const r = results[i]; if (r && r.available) map[id] = r; });
        setScores(map);
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Chargement impossible.');
          setStatus('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [org]);

  const agg = useMemo(() => {
    const active = missions.filter((m) => isMissionActiveToday(m));
    const byCountry = new Map<string, CountryRow>();
    for (const m of active) {
      const row = byCountry.get(m.country_iso) ?? {
        iso: m.country_iso, name: m.country_name, travelerIds: new Set<string>(), score: null, result: null,
      };
      row.travelerIds.add(m.traveler_id);
      if (m.destination_id && scores[m.destination_id]) {
        row.result = scores[m.destination_id];
        row.score = scores[m.destination_id].score;
      }
      byCountry.set(m.country_iso, row);
    }
    const abroadIds = new Set(active.map((m) => m.traveler_id));
    const degradedIds = new Set<string>();
    for (const row of byCountry.values()) {
      if (row.score !== null && row.score < 60) row.travelerIds.forEach((id) => degradedIds.add(id));
    }

    // Exposition pondérée par effectif (pays non couverts exclus, comptés à part)
    let weighted = 0; let weight = 0; let uncovered = 0;
    const unionSources: DimensionSources = { security: [], health: [], nature: [], infrastructure: [] };
    let lastUpdate: string | undefined;
    for (const row of byCountry.values()) {
      if (row.score !== null && row.result) {
        weighted += row.score * row.travelerIds.size;
        weight += row.travelerIds.size;
        (['security', 'health', 'nature', 'infrastructure'] as const).forEach((k) => {
          unionSources[k] = [...new Set([...unionSources[k], ...row.result!.sources[k]])];
        });
        const fmt = new Date(row.result.lastUpdate).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        if (!lastUpdate || row.result.lastUpdate < lastUpdate) lastUpdate = fmt;
      } else {
        uncovered += 1;
      }
    }
    const exposure = weight > 0 ? Math.round(weighted / weight) : null;

    // Conformité : voyageurs avec mission active/à venir dont TOUS les dossiers sont complets
    const relevant = missions.filter((m) => isMissionActiveToday(m) || isMissionUpcoming(m));
    const byTraveler = new Map<string, MissionWithCompliance[]>();
    for (const m of relevant) {
      byTraveler.set(m.traveler_id, [...(byTraveler.get(m.traveler_id) ?? []), m]);
    }
    let covered = 0;
    for (const list of byTraveler.values()) {
      if (list.every(complianceComplete)) covered += 1;
    }
    const coverage = byTraveler.size > 0 ? Math.round((covered / byTraveler.size) * 100) : null;
    const incompleteMissions = relevant.filter((m) => !complianceComplete(m)).length;

    // Départs sous 30 jours avec dossier incomplet
    const in30 = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const upcomingIncomplete = missions.filter(
      (m) => m.date_start > today && m.date_start <= in30 && !complianceComplete(m) && m.status !== 'refused' && m.status !== 'done',
    ).length;

    return {
      abroad: abroadIds.size,
      countries: byCountry.size,
      degraded: degradedIds.size,
      exposure, unionSources, lastUpdate, uncovered,
      coverage, incompleteMissions, upcomingIncomplete,
      countryRows: [...byCountry.values()].sort((a, b) => b.travelerIds.size - a.travelerIds.size),
    };
  }, [missions, scores]);

  /**
   * Valeur produite pendant le pilote — comptée sur les donnees reelles de
   * l'organisation, jamais sur des ordres de grandeur commerciaux.
   */
  const pilotValue = useMemo(() => ({
    missions: missions.length,
    acknowledged: missions.filter((m) => m.briefing_receipts?.read_at).length,
    complete: missions.filter((m) => complianceComplete(m)).length,
  }), [missions]);

  /** Âge de l'alerte la plus ancienne — c'est lui qui doit alerter, pas le nombre. */
  const oldestAlertAge = useMemo(() => {
    if (openAlerts.length === 0) return '';
    const oldest = openAlerts.reduce((a, b) => (a.created_at < b.created_at ? a : b));
    const hours = Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / 3_600_000);
    if (hours < 1) return "moins d'une heure";
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} jour${days > 1 ? 's' : ''}`;
  }, [openAlerts]);

  /** Réactivité mesurée sur le dernier check-in — jamais une estimation. */
  const crisis = useMemo(() => {
    if (!lastCheckin || lastResponses.length === 0) return null;
    const pending = lastResponses.filter((r) => r.status === 'pending');
    const answered = lastResponses.filter((r) => r.responded_at);
    const start = new Date(lastCheckin.created_at).getTime();
    let medianMin: number | null = null;
    if (answered.length > 0) {
      const delays = answered
        .map((r) => (new Date(r.responded_at as string).getTime() - start) / 60000)
        .sort((a, b) => a - b);
      medianMin = Math.round(delays[Math.floor(delays.length / 2)]);
    }
    const ageHours = Math.floor((Date.now() - start) / 3_600_000);
    return {
      pending: pending.length,
      total: lastResponses.length,
      medianMin,
      ageHours,
      isExercise: lastCheckin.is_exercise,
      date: new Date(lastCheckin.created_at).toLocaleDateString('fr-FR'),
    };
  }, [lastCheckin, lastResponses]);

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <div className="lk-skeleton mb-6 h-7 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="lk-skeleton h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Le tableau de bord n'a pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
      </div>
    );
  }

  if (travelers.length === 0 || missions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Bienvenue dans votre espace</h1>
        <OnboardingSteps hasTravelers={travelers.length > 0} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Tableau de bord</h1>
        <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
          {travelers.length} personne{travelers.length > 1 ? 's' : ''} dans l'effectif · données missions déclaratives
        </p>
      </div>

      {/* Pilote : ce que l'organisation a REELLEMENT produit depuis
          l'ouverture. Un compte a rebours seul ne dit pas si l'outil sert ;
          ces trois chiffres, si. */}
      {pilotDays !== null && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--lokadia-info-bg)', border: '1px solid var(--lokadia-gray-100)' }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-primary)' }}>
            Pilote gratuit — {pilotDays} jour{pilotDays > 1 ? 's' : ''} restant{pilotDays > 1 ? 's' : ''}
          </p>
          <p className="mt-1.5 text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
            Depuis l'ouverture : <strong>{pilotValue.missions}</strong> mission(s) suivie(s),{' '}
            <strong>{pilotValue.acknowledged}</strong> accusé(s) de briefing signé(s) et{' '}
            <strong>{pilotValue.complete}</strong> dossier(s) de conformité complet(s).
            {pilotValue.acknowledged === 0 && ' Aucun accusé signé pour l’instant : c’est la pièce qui prouve l’information, elle vaut le détour.'}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
            Aucune carte bancaire demandée pendant le pilote.
          </p>
        </div>
      )}

      {/* Bandeau : la question du décideur en 3 secondes */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="À l'étranger maintenant"
          value={String(agg.abroad)}
          sub={`${agg.countries} pays · ${agg.degraded} en zone dégradée`}
          method="Missions dont les dates couvrent aujourd'hui (statuts approuvé/actif). Zone dégradée = Lokascore < 60. Sources : missions déclarées + lokascore-compute (sources officielles)."
          Icon={Users}
          onClick={() => navigate('/pro/app/missions?filter=active')}
        />

        <button
          type="button"
          onClick={() => navigate('/pro/app/missions?filter=active')}
          title="Moyenne des Lokascore des pays de présence, pondérée par le nombre de personnes exposées. Pays hors catalogue exclus du calcul et comptés à part. Score indicatif — sources officielles, date affichée."
          className="lk-card-hover rounded-2xl bg-white p-5 text-left"
          style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Exposition globale</span>
            <ShieldAlert size={17} style={{ color: 'var(--lokadia-primary)' }} />
          </div>
          {agg.exposure !== null ? (
            <>
              <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{agg.exposure}<span className="text-base font-semibold" style={{ color: 'var(--lokadia-gray-400)' }}>/100</span></p>
              <LokascoreBadge
                className="mt-1.5 block"
                score={agg.exposure}
                sources={agg.unionSources}
                lastUpdate={agg.lastUpdate}
                variant="full"
              />
              {agg.uncovered > 0 && (
                <p className="mt-1 text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>
                  {agg.uncovered} pays hors catalogue exclu{agg.uncovered > 1 ? 's' : ''} du calcul
                </p>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>Aucune destination couverte par le catalogue actuellement.</p>
          )}
        </button>

        <StatTile
          label="Couverture conformité"
          value={agg.coverage !== null ? `${agg.coverage} %` : '—'}
          sub={`${agg.incompleteMissions} dossier${agg.incompleteMissions > 1 ? 's' : ''} incomplet${agg.incompleteMissions > 1 ? 's' : ''}`}
          method="% des voyageurs en mission (en cours ou à venir) dont tous les dossiers sont complets : briefing, assurance, contact d'urgence, formalités — 4 items datés. C'est l'indicateur présentable à un auditeur."
          Icon={FileCheck2}
          onClick={() => navigate('/pro/app/missions?filter=incomplete')}
          alert={agg.coverage !== null && agg.coverage < 80}
        />

        <StatTile
          label="Départs J-30 incomplets"
          value={String(agg.upcomingIncomplete)}
          sub="dossiers à compléter avant départ"
          method="Missions démarrant dans les 30 prochains jours dont le dossier de conformité n'est pas complet. Décision : relancer ou bloquer le départ."
          Icon={CalendarClock}
          onClick={() => navigate('/pro/app/missions?filter=upcoming-incomplete')}
          alert={agg.upcomingIncomplete > 0}
        />
      </div>

      {/* Veille : la file d'alertes non traitées et son ancienneté */}
      {hasFeature(org?.tier, 'watchlist') && (
        <div className="grid gap-4 md:grid-cols-2">
          <StatTile
            label="Alertes non traitées"
            value={String(openAlerts.length)}
            sub={
              openAlerts.length === 0
                ? 'aucun changement en attente'
                : `la plus ancienne remonte à ${oldestAlertAge}`
            }
            method="Changements d'état constatés sur un pays suivi où vous avez des personnes, et non encore acquittés. Une alerte n'est créée que si la situation a réellement changé — pas à chaque analyse. Décision : traiter ou acquitter."
            Icon={BellRing}
            onClick={() => navigate('/pro/app/watch')}
            alert={openAlerts.length > 0}
          />
          <StatTile
            label="Personnes localisées"
            value={`${agg.abroad}`}
            sub="voir la carte « qui est où »"
            method="Personnes en mission aujourd'hui. La carte distingue la présence déclarée (mission) du dernier point connu (position transmise volontairement lors d'un check-in), avec son ancienneté."
            Icon={MapPinned}
            onClick={() => navigate('/pro/app/watch')}
          />
        </div>
      )}

      {/* Réactivité en crise — mesurée sur le dernier check-in réel */}
      {crisis && (
        <div className="grid gap-4 md:grid-cols-2">
          <StatTile
            label="Sans réponse au dernier check-in"
            value={`${crisis.pending} / ${crisis.total}`}
            sub={`${crisis.isExercise ? 'Exercice' : 'Check-in'} du ${crisis.date}, il y a ${crisis.ageHours} h`}
            method="Personnes interrogées lors du dernier check-in qui n'ont pas encore répondu. Décision : relancer, puis escalader vers les contacts d'astreinte."
            Icon={Siren}
            onClick={() => navigate('/pro/app/crisis')}
            alert={crisis.pending > 0}
          />
          <StatTile
            label="Délai médian de réponse"
            value={crisis.medianMin !== null ? `${crisis.medianMin} min` : '—'}
            sub={crisis.medianMin !== null ? 'sur le dernier check-in' : 'aucune réponse reçue'}
            method="Médiane du délai entre l'envoi du check-in et la réponse de chaque personne, mesurée sur le dernier envoi réel ou exercice. Décision : reprogrammer un exercice si le délai se dégrade."
            Icon={Timer}
            onClick={() => navigate('/pro/app/crisis')}
          />
        </div>
      )}

      {/* Répartition par pays — concentration du risque */}
      <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
        <div className="border-b px-5 py-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Présence par pays (aujourd'hui)</h2>
          <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Concentration du risque : part de l'effectif à l'étranger par pays. Score indicatif par destination du catalogue.
          </p>
        </div>
        {agg.countryRows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            Personne à l'étranger aujourd'hui. Les missions à venir apparaissent dans l'onglet Missions.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                  <th className="px-5 py-2.5 font-bold">Pays</th>
                  <th className="px-5 py-2.5 font-bold">Personnes</th>
                  <th className="px-5 py-2.5 font-bold">Part de l'effectif exposé</th>
                  <th className="px-5 py-2.5 font-bold">Lokascore</th>
                </tr>
              </thead>
              <tbody>
                {agg.countryRows.map((row) => (
                  <tr key={row.iso} className="border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>{row.name}</td>
                    <td className="px-5 py-3 tabular-nums">{row.travelerIds.size}</td>
                    <td className="px-5 py-3 tabular-nums">
                      {agg.abroad > 0 ? Math.round((row.travelerIds.size / agg.abroad) * 100) : 0} %
                    </td>
                    <td className="px-5 py-3">
                      {row.result ? (
                        <LokascoreBadge
                          score={row.score}
                          sources={row.result.sources}
                          lastUpdate={new Date(row.result.lastUpdate).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          variant="inline"
                        />
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--lokadia-gray-400)' }}>Hors catalogue — score non disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
