/**
 * ProDemoScreen — Tableau de bord démo "Lokadia Pro" (B2B), adapté par offre.
 *
 * Reçoit ?offer=<id> et affiche une démo dédiée à chaque offre commerciale,
 * où chacune des 4 fonctionnalités VENDUES est rendue fonctionnelle et
 * démonstrative :
 *   - univ      : Écoles & universités (suivi Erasmus, alertes groupe,
 *                 dashboard RI, reporting devoir de protection)
 *   - ngo       : ONG & humanitaires (missions terrain, alertes équipes,
 *                 historique incidents, support 7j/7)
 *   - insurer   : Assureurs API white-label (API, tarification au risque,
 *                 branding, SLA 99,9%)
 *   - airline   : Compagnies aériennes (notif app passager, info pré-vol,
 *                 alertes ops, co-branding)
 *   - mice      : MICE & voyages affaires (groupes séminaires, conformité
 *                 L4121-1, alertes collaborateurs, dashboard RH)
 *
 * Les Lokascore affichés sont les vrais scores calculés côté serveur.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Bell, Briefcase, Building2, CheckCircle2,
  Code2, Download, GraduationCap, Heart, LayoutDashboard, LineChart,
  MapPin, Plane, Radio, Shield, Smartphone, Sparkles, Users,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { fetchLokascore, type LokascoreApiResult } from '../lib/lokascoreApi';
import { getLokascoreLevel, type TravelProfile } from '../lib/lokascore';
import {
  subscribeToLiveAlerts, getLiveAlertsSnapshot, ALERT_TYPE_META,
  type LiveAlertsSnapshot,
} from '../lib/liveAlertsService';
import { DESTINATION_TO_COUNTRY_ISO } from '../data/countryRiskData';

type FeatureKey =
  | 'students' | 'group-alert' | 'ri-dashboard' | 'compliance'
  | 'missions' | 'team-alerts' | 'incident-history' | 'support'
  | 'api' | 'risk-pricing' | 'white-label' | 'sla'
  | 'passenger-app' | 'preflight' | 'ops-alerts' | 'cobranding'
  | 'seminars' | 'employer-compliance' | 'collab-alerts' | 'hr-dashboard';

interface Person {
  name: string; role: string; destinationId: string; city: string; meta: string;
}

interface Feature { key: FeatureKey; label: string; desc: string; Icon: any }

interface OfferDemo {
  id: string;
  title: string;
  kind: string;
  Icon: any;
  color: string;
  bg: string;
  price: string;
  profile: TravelProfile;
  peopleLabel: string;
  people: Person[];
  features: Feature[];
}

// ─── Les 5 offres = miroir exact de ProPage, enrichies de leur démo ───
const OFFERS: OfferDemo[] = [
  {
    id: 'univ', title: 'Écoles & universités', kind: 'Enseignement supérieur',
    Icon: GraduationCap, color: '#0A84FF', bg: 'rgba(10,132,255,0.08)',
    price: '500 – 2 000 €/an', profile: 'studies', peopleLabel: 'Étudiants en mobilité',
    people: [
      { name: 'Léa Martin', role: 'Erasmus L3 Éco', destinationId: 'barcelona-spain', city: 'Barcelone', meta: 'Sept.→Janv.' },
      { name: 'Hugo Bernard', role: 'Erasmus M1 Droit', destinationId: 'berlin-germany', city: 'Berlin', meta: 'Sept.→Juin' },
      { name: 'Emma Petit', role: 'Erasmus L3 LEA', destinationId: 'lisbon-portugal', city: 'Lisbonne', meta: 'Sept.→Févr.' },
      { name: 'Tom Garcia', role: 'Échange M2', destinationId: 'tokyo-japan', city: 'Tokyo', meta: 'Oct.→Mars' },
      { name: 'Chloé Roux', role: 'Stage', destinationId: 'istanbul-turkey', city: 'Istanbul', meta: 'Sept.→Déc.' },
      { name: 'Nathan Faure', role: 'Erasmus L3 Info', destinationId: 'prague-czech', city: 'Prague', meta: 'Sept.→Janv.' },
    ],
    features: [
      { key: 'students', label: 'Suivi des étudiants Erasmus', desc: 'Localisation et Lokascore live de chaque étudiant en mobilité', Icon: Users },
      { key: 'group-alert', label: 'Alertes groupe par pays', desc: 'Notification automatique de tous les étudiants d\'un pays', Icon: Bell },
      { key: 'ri-dashboard', label: 'Dashboard relations internationales', desc: 'Vue d\'ensemble pour le responsable RI', Icon: LayoutDashboard },
      { key: 'compliance', label: 'Reporting devoir de protection', desc: 'Export conformité prêt pour l\'audit', Icon: Download },
    ],
  },
  {
    id: 'ngo', title: 'ONG & humanitaires', kind: 'Organisation humanitaire',
    Icon: Heart, color: '#EF4444', bg: 'rgba(239,68,68,0.08)',
    price: '1 500 – 4 000 €/an', profile: 'humanitarian', peopleLabel: 'Personnel sur le terrain',
    people: [
      { name: 'Dr. Sophie L.', role: 'Coord. santé', destinationId: 'cairo-egypt', city: 'Le Caire', meta: 'Mission 6 mois' },
      { name: 'Karim B.', role: 'Logisticien', destinationId: 'marrakech-morocco', city: 'Marrakech', meta: 'Mission 3 mois' },
      { name: 'Inès D.', role: 'Cheffe de projet', destinationId: 'mumbai-india', city: 'Mumbai', meta: 'Mission 12 mois' },
      { name: 'Marc V.', role: 'Eau & assainissement', destinationId: 'mexico-city-mexico', city: 'Mexico', meta: 'Mission 4 mois' },
      { name: 'Aïcha N.', role: 'Resp. terrain', destinationId: 'bangkok-thailand', city: 'Bangkok', meta: 'Mission 8 mois' },
    ],
    features: [
      { key: 'missions', label: 'Gestion des missions terrain', desc: 'Toutes les missions actives et leur niveau de risque', Icon: MapPin },
      { key: 'team-alerts', label: 'Alertes sécurité équipes', desc: 'Surveillance temps réel des équipes expatriées', Icon: Radio },
      { key: 'incident-history', label: 'Historique & analyse incidents', desc: 'Suivi des incidents pour améliorer la sécurité', Icon: LineChart },
      { key: 'support', label: 'Support dédié 7j/7', desc: 'Ligne d\'astreinte et account manager', Icon: Shield },
    ],
  },
  {
    id: 'insurer', title: 'Assureurs (API white-label)', kind: 'Assurance voyage',
    Icon: Building2, color: '#10B981', bg: 'rgba(16,185,129,0.08)',
    price: '5 000 – 20 000 €/an', profile: 'default', peopleLabel: 'Assurés couverts (échantillon)',
    people: [
      { name: 'Contrat #A-1042', role: 'Voyage affaires', destinationId: 'rio-de-janeiro-brazil', city: 'Rio', meta: 'Prime 89 €' },
      { name: 'Contrat #A-2087', role: 'Vacances famille', destinationId: 'bali-indonesia', city: 'Bali', meta: 'Prime 64 €' },
      { name: 'Contrat #A-3391', role: 'Backpack', destinationId: 'bangkok-thailand', city: 'Bangkok', meta: 'Prime 120 €' },
      { name: 'Contrat #A-4410', role: 'Séjour senior', destinationId: 'rome-italy', city: 'Rome', meta: 'Prime 75 €' },
    ],
    features: [
      { key: 'api', label: 'API Lokascore intégrée', desc: 'Le score dans votre propre espace client', Icon: Code2 },
      { key: 'risk-pricing', label: 'Tarification au risque pays', desc: 'Prime ajustée automatiquement selon le Lokascore', Icon: LineChart },
      { key: 'white-label', label: 'Branding personnalisé', desc: 'Vos couleurs, votre logo, votre domaine', Icon: Sparkles },
      { key: 'sla', label: 'SLA 99,9 %', desc: 'Disponibilité garantie + support prioritaire', Icon: Shield },
    ],
  },
  {
    id: 'airline', title: 'Compagnies aériennes', kind: 'Transport aérien',
    Icon: Plane, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',
    price: '8 000 – 25 000 €/an', profile: 'vacation', peopleLabel: 'Vols & destinations',
    people: [
      { name: 'Vol AF276', role: 'CDG → Tokyo', destinationId: 'tokyo-japan', city: 'Tokyo', meta: '312 passagers' },
      { name: 'Vol AF438', role: 'CDG → Le Caire', destinationId: 'cairo-egypt', city: 'Le Caire', meta: '198 passagers' },
      { name: 'Vol AF690', role: 'CDG → Bangkok', destinationId: 'bangkok-thailand', city: 'Bangkok', meta: '276 passagers' },
      { name: 'Vol AF112', role: 'CDG → New York', destinationId: 'new-york-usa', city: 'New York', meta: '341 passagers' },
      { name: 'Vol AF820', role: 'CDG → Istanbul', destinationId: 'istanbul-turkey', city: 'Istanbul', meta: '224 passagers' },
    ],
    features: [
      { key: 'passenger-app', label: 'Notifications app passager', desc: 'Le Lokascore affiché dans votre app voyageur', Icon: Smartphone },
      { key: 'preflight', label: 'Information destination pré-vol', desc: 'Briefing sécurité automatique avant le départ', Icon: Plane },
      { key: 'ops-alerts', label: 'Alertes opérationnelles', desc: 'Anticipez annulations et déroutements', Icon: Radio },
      { key: 'cobranding', label: 'Co-branding', desc: 'Score affiché aux couleurs de la compagnie', Icon: Sparkles },
    ],
  },
  {
    id: 'mice', title: 'MICE & voyages affaires', kind: 'Événementiel & entreprise',
    Icon: Briefcase, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',
    price: '2 000 – 6 000 €/an', profile: 'business', peopleLabel: 'Collaborateurs & événements',
    people: [
      { name: 'Séminaire Dubaï', role: '42 collaborateurs', destinationId: 'dubai-uae', city: 'Dubaï', meta: '12–15 mars' },
      { name: 'Julien R.', role: 'Directeur commercial', destinationId: 'singapore-singapore', city: 'Singapour', meta: 'Déplacement' },
      { name: 'Convention Londres', role: '120 collaborateurs', destinationId: 'london-uk', city: 'Londres', meta: '4–6 avril' },
      { name: 'Sarah M.', role: 'Account manager', destinationId: 'shanghai-china', city: 'Shanghai', meta: 'Mission' },
      { name: 'Laura P.', role: 'VP Sales', destinationId: 'new-york-usa', city: 'New York', meta: 'Déplacement' },
    ],
    features: [
      { key: 'seminars', label: 'Gestion risque groupes/séminaires', desc: 'Suivi des événements et participants', Icon: Users },
      { key: 'employer-compliance', label: 'Conformité obligation employeur', desc: 'Devoir de protection art. L4121-1', Icon: Download },
      { key: 'collab-alerts', label: 'Alertes temps réel collaborateurs', desc: 'Notification dès qu\'un risque survient', Icon: Bell },
      { key: 'hr-dashboard', label: 'Tableau de bord RH', desc: 'Vue consolidée pour les ressources humaines', Icon: LayoutDashboard },
    ],
  },
];

function flagOf(iso: string): string {
  if (!iso || iso.length !== 2) return '🌍';
  return String.fromCodePoint(...iso.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
}

export default function ProDemoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const offerId = new URLSearchParams(location.search).get('offer') ?? 'univ';
  const offer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[0];

  const [scores, setScores] = useState<Record<string, LokascoreApiResult>>({});
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(getLiveAlertsSnapshot());
  const [feature, setFeature] = useState<FeatureKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const ids = [...new Set(offer.people.map((p) => p.destinationId))];
    Promise.all(ids.map((id) => fetchLokascore(id, offer.profile).then((r) => [id, r] as const)))
      .then((entries) => {
        if (cancelled) return;
        const map: Record<string, LokascoreApiResult> = {};
        for (const [id, r] of entries) if (r) map[id] = r;
        setScores(map);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [offerId]);

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  const kpis = useMemo(() => {
    const total = offer.people.length;
    const destinations = new Set(offer.people.map((p) => p.destinationId)).size;
    let atRisk = 0;
    for (const p of offer.people) {
      const s = scores[p.destinationId]?.score;
      if (s != null && s < 60) atRisk++;
    }
    const isos = new Set(offer.people.map((p) => DESTINATION_TO_COUNTRY_ISO[p.destinationId]).filter(Boolean));
    let activeAlerts = 0;
    if (snapshot) for (const iso of isos) activeAlerts += snapshot.byCountry.get(iso)?.length ?? 0;
    return { total, destinations, atRisk, activeAlerts };
  }, [offer, scores, snapshot]);

  const relevantAlerts = useMemo(() => {
    if (!snapshot) return [];
    const isos = new Set(offer.people.map((p) => DESTINATION_TO_COUNTRY_ISO[p.destinationId]).filter(Boolean));
    return snapshot.alerts.filter((a) => a.countryIso && isos.has(a.countryIso)).slice(0, 6);
  }, [offer, snapshot]);

  const setOffer = (id: string) => navigate(`/pro/demo?offer=${id}`);

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--lokadia-background)' }}>
      {/* Bandeau Mode démo */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 px-5 py-2.5 text-white" style={{ background: offer.color }}>
        <div className="flex items-center gap-2 text-xs font-bold">
          <Radio className="h-4 w-4 animate-pulse" />
          Démo Lokadia Pro · {offer.title} — données fictives, fonctionnalités réelles
        </div>
        <button onClick={() => navigate('/pro')} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur hover:bg-white/30">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux offres
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
        {/* Sélecteur d'offre */}
        <div className="mb-5 flex flex-wrap gap-2">
          {OFFERS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOffer(o.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
              style={{ background: o.id === offerId ? o.color : 'white', color: o.id === offerId ? 'white' : 'var(--lokadia-gray-700)', border: '1px solid var(--lokadia-gray-100)' }}
            >
              <o.Icon className="h-3.5 w-3.5" /> {o.title}
            </button>
          ))}
        </div>

        {/* Header offre + prix */}
        <div className="mb-5 flex items-center justify-between gap-4 rounded-3xl p-5" style={{ background: offer.bg }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: offer.color }}>
              <offer.Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: offer.color }}>{offer.kind}</p>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--lokadia-gray-900)' }}>{offer.title}</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black" style={{ color: offer.color }}>{offer.price}</p>
            <p className="text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>tout inclus</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: offer.peopleLabel, value: kpis.total, Icon: Users, color: offer.color },
            { label: 'Destinations', value: kpis.destinations, Icon: MapPin, color: '#0369a1' },
            { label: 'En zone à risque', value: kpis.atRisk, Icon: AlertTriangle, color: kpis.atRisk > 0 ? '#dc2626' : '#15803d' },
            { label: 'Alertes actives', value: kpis.activeAlerts, Icon: Bell, color: kpis.activeAlerts > 0 ? '#d97706' : '#15803d' },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <k.Icon className="mb-2 h-5 w-5" style={{ color: k.color }} />
              <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{k.value}</p>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Fonctionnalités incluses dans l'offre (chaque = démo cliquable) */}
        <h2 className="mt-6 mb-3 text-lg font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
          Inclus dans cette offre
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {offer.features.map((f) => (
            <button
              key={f.key}
              onClick={() => setFeature(f.key)}
              className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: '1px solid var(--lokadia-gray-100)' }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: offer.bg }}>
                <f.Icon className="h-4.5 w-4.5" style={{ color: offer.color }} />
              </div>
              <p className="text-sm font-black leading-snug" style={{ color: 'var(--lokadia-gray-900)' }}>{f.label}</p>
              <p className="text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-500)' }}>{f.desc}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: offer.color }}>
                Voir la démo <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Liste personnes/contrats/vols */}
          <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
              <offer.Icon className="h-5 w-5" style={{ color: offer.color }} /> {offer.peopleLabel}
            </h2>
            <div className="space-y-2">
              {offer.people.map((p) => {
                const r = scores[p.destinationId];
                const score = r?.score ?? null;
                const lvl = getLokascoreLevel(score);
                const iso = DESTINATION_TO_COUNTRY_ISO[p.destinationId] ?? '';
                return (
                  <button
                    key={p.name}
                    onClick={() => navigate(`/destination/${p.destinationId}`)}
                    className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:shadow-md"
                    style={{ borderColor: score !== null && score < 40 ? 'rgba(239,68,68,0.4)' : 'var(--lokadia-gray-100)' }}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg" style={{ background: 'var(--lokadia-gray-100)' }}>
                      {flagOf(iso)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{p.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--lokadia-gray-500)' }}>{p.role} · {p.city} · {p.meta}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="rounded-full px-2.5 py-1 text-xs font-black text-white tabular-nums" style={{ background: lvl.fillColor }}>
                        {loading || score === null ? '…' : score}
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold" style={{ color: lvl.color }}>{score !== null ? lvl.label : ''}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alertes en direct */}
          <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
              <Radio className="h-5 w-5" style={{ color: '#dc2626' }} /> Alertes en direct
            </h2>
            {relevantAlerts.length === 0 ? (
              <div className="rounded-2xl p-4 text-center text-sm" style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d' }}>
                ✅ Aucune alerte sur vos destinations
              </div>
            ) : (
              <div className="space-y-2">
                {relevantAlerts.map((a, i) => {
                  const meta = ALERT_TYPE_META[a.type] ?? ALERT_TYPE_META.other;
                  return (
                    <div key={i} className="rounded-xl p-2.5" style={{ background: a.severity === 'red' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)' }}>
                      <div className="flex items-center gap-1.5">
                        <span>{meta.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                        <span className="ml-auto">{flagOf(a.countryIso)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-700)' }}>{a.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl p-6 text-center text-white" style={{ background: offer.color }}>
          <h3 className="text-xl font-black">Déployez « {offer.title} » dans votre organisation</h3>
          <p className="max-w-xl text-sm text-white/90">À partir de {offer.price.split('–')[0].trim()} — toutes les fonctionnalités ci-dessus incluses, account manager dédié et conformité au devoir de protection.</p>
          <button onClick={() => navigate('/pro')} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black" style={{ color: offer.color }}>
            Demander un devis <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Modales fonctionnalités, rendues par clé ─── */}
      <FeatureModal feature={feature} onClose={() => setFeature(null)} offer={offer} scores={scores} />
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Modales de démonstration — une par fonctionnalité vendue
// ════════════════════════════════════════════════════════════════════════
function FeatureModal({
  feature, onClose, offer, scores,
}: { feature: FeatureKey | null; onClose: () => void; offer: OfferDemo; scores: Record<string, LokascoreApiResult> }) {
  const titles: Record<FeatureKey, string> = {
    students: 'Suivi des étudiants Erasmus',
    'group-alert': 'Alertes groupe par pays',
    'ri-dashboard': 'Dashboard relations internationales',
    compliance: 'Reporting devoir de protection',
    missions: 'Gestion des missions terrain',
    'team-alerts': 'Alertes sécurité équipes',
    'incident-history': 'Historique & analyse des incidents',
    support: 'Support dédié 7j/7',
    api: 'API Lokascore intégrée',
    'risk-pricing': 'Tarification au risque pays',
    'white-label': 'Branding personnalisé',
    sla: 'SLA 99,9 %',
    'passenger-app': 'Notifications app passager',
    preflight: 'Information destination pré-vol',
    'ops-alerts': 'Alertes opérationnelles',
    cobranding: 'Co-branding',
    seminars: 'Gestion risque groupes/séminaires',
    'employer-compliance': 'Conformité obligation employeur',
    'collab-alerts': 'Alertes temps réel collaborateurs',
    'hr-dashboard': 'Tableau de bord RH',
  };

  const ok = (txt: string) => (
    <div className="rounded-xl p-3 text-center text-sm font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>{txt}</div>
  );
  const list = (items: string[]) => (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex items-start gap-2 text-sm" style={{ color: 'var(--lokadia-gray-700)' }}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: offer.color }} /> {x}
        </li>
      ))}
    </ul>
  );

  const avgScore = (() => {
    const vals = offer.people.map((p) => scores[p.destinationId]?.score).filter((s): s is number => s != null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  })();

  function content() {
    switch (feature) {
      case 'students':
      case 'missions':
      case 'seminars':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Chaque {offer.peopleLabel.toLowerCase()} est suivi en continu avec sa localisation et son
              Lokascore mis à jour en temps réel. Score moyen actuel du groupe : <strong>{avgScore ?? '…'}/100</strong>.
            </p>
            {list([
              'Localisation et destination de chaque personne',
              'Lokascore live + niveau de risque par destination',
              'Alerte visuelle si une personne passe en zone rouge',
              'Clic sur une personne → fiche destination complète',
            ])}
            {ok(`✅ Démo — ${offer.people.length} ${offer.peopleLabel.toLowerCase()} suivis`)}
          </div>
        );
      case 'group-alert':
      case 'team-alerts':
      case 'collab-alerts':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Envoyez en un clic une notification (push + email + SMS) à toutes les personnes d'un pays
              donné, ou laissez le système alerter automatiquement.
            </p>
            <textarea readOnly value="⚠️ Merci de confirmer votre sécurité en répondant à cette notification." className="w-full rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)', minHeight: 70 }} />
            {ok(`📨 Démo — message prêt pour ${offer.people.length} destinataires`)}
          </div>
        );
      case 'ri-dashboard':
      case 'hr-dashboard':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Le tableau de bord que vous consultez <em>est</em> la démo : vue consolidée temps réel de
              toutes vos personnes en mobilité, KPIs et alertes en un coup d'œil.
            </p>
            {list([
              'KPIs : effectif, destinations, zones à risque, alertes',
              'Score de risque par personne et par destination',
              'Flux d\'alertes filtré sur vos pays',
              'Export et reporting en un clic',
            ])}
            {ok('📊 Démo — vous y êtes !')}
          </div>
        );
      case 'compliance':
      case 'employer-compliance':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Export PDF/Excel attestant du suivi de vos personnes, conforme à l'obligation de sécurité
              de l'employeur (<strong>art. L4121-1</strong> du Code du travail).
            </p>
            {list([
              'Liste horodatée personnes + destinations',
              'Lokascore au départ et son évolution',
              'Alertes reçues et actions menées',
              'Preuve de diligence (audit, assurance, justice)',
            ])}
            {ok(`📄 Démo — rapport ${offer.title} généré en PDF`)}
          </div>
        );
      case 'incident-history':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Historisez chaque incident et analysez les tendances pour renforcer la sécurité de vos équipes.
            </p>
            <div className="space-y-2">
              {[
                { d: 'Mars 2026', t: 'Manifestation Le Caire', s: 'Équipe confinée 24h, RAS' },
                { d: 'Janv. 2026', t: 'Séisme léger Mexico', s: 'Vérification équipe, aucun blessé' },
                { d: 'Nov. 2025', t: 'Alerte sanitaire Mumbai', s: 'Vaccination renforcée' },
              ].map((i) => (
                <div key={i.t} className="rounded-xl border p-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                  <p className="text-xs font-black" style={{ color: 'var(--lokadia-gray-900)' }}>{i.d} · {i.t}</p>
                  <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{i.s}</p>
                </div>
              ))}
            </div>
            {ok('📈 Démo — 3 incidents archivés et analysés')}
          </div>
        );
      case 'support':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Une ligne d'astreinte joignable 7j/7 et un account manager dédié pour vos missions sensibles.
            </p>
            {list([
              'Hotline 7j/7 24h/24 en cas de crise',
              'Account manager dédié nommé',
              'Temps de réponse garanti < 1h en urgence',
              'Accompagnement à la gestion de crise',
            ])}
            {ok('🛟 Démo — support prioritaire inclus')}
          </div>
        );
      case 'api':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Intégrez le Lokascore dans votre propre espace client via une API REST simple.
            </p>
            <div className="overflow-x-auto rounded-xl p-3 font-mono text-xs" style={{ background: '#0f172a', color: '#e2e8f0' }}>
              <div style={{ color: '#94a3b8' }}># Score d'une destination</div>
              <div><span style={{ color: '#7dd3fc' }}>GET</span> /v1/lokascore?destination=bangkok-thailand</div>
              <div style={{ color: '#94a3b8' }}>Authorization: Bearer &lt;clé&gt;</div>
              <div className="mt-2">{'{ "score": 78, "level": "vigilance", ... }'}</div>
            </div>
            {ok('🔌 Démo — clé API fournie après contrat')}
          </div>
        );
      case 'risk-pricing':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              La prime d'assurance s'ajuste automatiquement au risque pays : plus le Lokascore est bas,
              plus la prime reflète le risque. Calcul sur vos contrats de démo :
            </p>
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase" style={{ color: 'var(--lokadia-gray-500)' }}>
                <span>Contrat / destination</span><span>Score</span><span>Prime ajustée</span>
              </div>
              {offer.people.map((p) => {
                const score = scores[p.destinationId]?.score;
                const base = parseInt(p.meta.replace(/\D/g, '') || '80', 10);
                const adj = score != null ? Math.round(base * (1 + (100 - score) / 100)) : null;
                return (
                  <div key={p.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t px-3 py-2 text-xs" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                    <span className="truncate" style={{ color: 'var(--lokadia-gray-700)' }}>{p.city}</span>
                    <span className="font-black tabular-nums" style={{ color: getLokascoreLevel(score ?? null).color }}>{score ?? '…'}</span>
                    <span className="font-black tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{adj ? `${adj} €` : '…'}</span>
                  </div>
                );
              })}
            </div>
            {ok('💶 Démo — tarification dynamique au risque réel')}
          </div>
        );
      case 'white-label':
      case 'cobranding':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Le Lokascore s'affiche aux couleurs de votre marque : logo, palette, domaine personnalisé.
            </p>
            <div className="rounded-2xl p-4" style={{ border: `2px solid ${offer.color}` }}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded" style={{ background: offer.color }} />
                <span className="text-sm font-black" style={{ color: offer.color }}>VotreMarque · Sécurité voyage</span>
              </div>
              <div className="flex items-center justify-between rounded-xl p-3" style={{ background: offer.bg }}>
                <span className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>Bangkok, Thaïlande</span>
                <span className="rounded-full px-3 py-1 text-sm font-black text-white" style={{ background: offer.color }}>78/100</span>
              </div>
            </div>
            {ok('🎨 Démo — rendu à vos couleurs')}
          </div>
        );
      case 'sla':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Engagement de disponibilité contractuel pour les intégrations critiques.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ k: 'Uptime', v: '99,9 %' }, { k: 'Latence API', v: '< 200 ms' }, { k: 'Support', v: 'Prioritaire' }].map((s) => (
                <div key={s.k} className="rounded-xl p-3" style={{ background: offer.bg }}>
                  <p className="text-lg font-black" style={{ color: offer.color }}>{s.v}</p>
                  <p className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{s.k}</p>
                </div>
              ))}
            </div>
            {ok('🟢 Démo — tous les services opérationnels')}
          </div>
        );
      case 'passenger-app':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Vos passagers voient le Lokascore de leur destination directement dans votre application.
            </p>
            <div className="mx-auto w-48 rounded-3xl border-4 p-3" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <div className="rounded-xl p-3" style={{ background: offer.bg }}>
                <p className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>Votre vol AF276</p>
                <p className="text-sm font-black" style={{ color: 'var(--lokadia-gray-900)' }}>Tokyo 🇯🇵</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--lokadia-gray-600)' }}>Sécurité destination</span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-black text-white" style={{ background: '#22c55e' }}>92</span>
                </div>
              </div>
            </div>
            {ok('📱 Démo — widget intégrable à votre app')}
          </div>
        );
      case 'preflight':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Briefing sécurité automatique envoyé au passager avant le départ.
            </p>
            {list([
              'Lokascore et niveau de la destination',
              'Alertes en cours (météo, sécurité, santé)',
              'Numéros d\'urgence et consulat local',
              'Formalités d\'entrée et santé',
            ])}
            {ok('✈️ Démo — briefing pré-vol prêt à l\'envoi')}
          </div>
        );
      case 'ops-alerts':
        return (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Anticipez annulations et déroutements grâce aux alertes opérationnelles temps réel sur vos
              destinations desservies.
            </p>
            {list([
              'Catastrophes naturelles (GDACS) sur les routes',
              'Fermetures d\'espace aérien / instabilité',
              'Épidémies impactant les destinations',
              'Notification aux équipes ops par webhook',
            ])}
            {ok('🛰️ Démo — flux ops connecté')}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Modal isOpen={feature !== null} onClose={onClose} title={feature ? titles[feature] : ''}>
      {content()}
    </Modal>
  );
}
