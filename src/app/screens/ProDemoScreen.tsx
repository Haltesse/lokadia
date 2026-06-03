/**
 * ProDemoScreen — Démo "Lokadia Pro" investor-grade, adaptée par offre.
 *
 * Pensée pour impressionner un investisseur :
 *   - Simulation de crise en 1 clic (séisme, attentat, épidémie, coup d'État)
 *     qui propage l'alerte en temps réel dans tout le tableau de bord
 *   - Gestion multi-groupes avec interface optimisée (cartes pliables,
 *     score agrégé, statut, alerte ciblée par groupe)
 *   - Alerte en direct + diffusion d'urgence avec suivi des confirmations
 *     de sécurité ("32/42 confirmés")
 *   - Bandeau métriques marché / ARR par segment
 *   - Lokascore réels calculés côté serveur
 *
 * Reçoit ?offer=<univ|ngo|insurer|airline|mice>.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Bell, Briefcase, Building2,
  CheckCircle2, ChevronDown, Code2, Download, GraduationCap, Heart,
  LayoutDashboard, LineChart, MapPin, Plane, Radio, Shield, ShieldCheck,
  Siren, Smartphone, Sparkles, TrendingUp, Users, Zap,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProDemoMap, type DemoMapPoint } from '../components/ProDemoMap';
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

interface Person { name: string; role: string; destinationId: string; city: string; meta: string; count?: number }
interface Group { id: string; name: string; people: Person[] }
interface Feature { key: FeatureKey; label: string; desc: string; Icon: any }
interface Scenario { label: string; destinationId: string; type: string; severity: 'orange' | 'red'; title: string }
interface OfferDemo {
  id: string; title: string; kind: string; Icon: any; color: string; bg: string;
  price: string; profile: TravelProfile; peopleLabel: string; headLabel: string;
  market: string; arr: string;
  groups: Group[]; features: Feature[]; scenarios: Scenario[];
}

const OFFERS: OfferDemo[] = [
  {
    id: 'univ', title: 'Écoles & universités', kind: 'Enseignement supérieur',
    Icon: GraduationCap, color: '#0A84FF', bg: 'rgba(10,132,255,0.08)',
    price: '500 – 2 000 €/an', profile: 'studies', peopleLabel: 'Étudiants suivis', headLabel: 'étudiants',
    market: '164 000 mobilités Erasmus/an · 75 universités + 200 écoles',
    arr: 'ARR cible 1 700 €/établissement',
    groups: [
      { id: 'g1', name: 'Erasmus Europe', people: [
        { name: 'Léa Martin', role: 'L3 Éco', destinationId: 'barcelona-spain', city: 'Barcelone', meta: 'Sept.→Janv.' },
        { name: 'Hugo Bernard', role: 'M1 Droit', destinationId: 'berlin-germany', city: 'Berlin', meta: 'Sept.→Juin' },
        { name: 'Emma Petit', role: 'L3 LEA', destinationId: 'lisbon-portugal', city: 'Lisbonne', meta: 'Sept.→Févr.' },
        { name: 'Nathan Faure', role: 'L3 Info', destinationId: 'prague-czech', city: 'Prague', meta: 'Sept.→Janv.' },
      ]},
      { id: 'g2', name: 'Échanges Asie-Pacifique', people: [
        { name: 'Tom Garcia', role: 'M2 Échange', destinationId: 'tokyo-japan', city: 'Tokyo', meta: 'Oct.→Mars' },
      ]},
      { id: 'g3', name: 'Stages internationaux', people: [
        { name: 'Chloé Roux', role: 'Stage', destinationId: 'istanbul-turkey', city: 'Istanbul', meta: 'Sept.→Déc.' },
      ]},
    ],
    features: [
      { key: 'students', label: 'Suivi des étudiants Erasmus', desc: 'Localisation et Lokascore live', Icon: Users },
      { key: 'group-alert', label: 'Alertes groupe par pays', desc: 'Notification de tout un groupe', Icon: Bell },
      { key: 'ri-dashboard', label: 'Dashboard relations internationales', desc: 'Vue d\'ensemble responsable RI', Icon: LayoutDashboard },
      { key: 'compliance', label: 'Reporting devoir de protection', desc: 'Export conformité audit', Icon: Download },
    ],
    scenarios: [
      { label: 'Séisme Tokyo', destinationId: 'tokyo-japan', type: 'earthquake', severity: 'red', title: 'Séisme M7.1 — région de Tokyo' },
      { label: 'Attentat Istanbul', destinationId: 'istanbul-turkey', type: 'war', severity: 'red', title: 'Attentat signalé à Istanbul' },
      { label: 'Manifestations Barcelone', destinationId: 'barcelona-spain', type: 'political', severity: 'orange', title: 'Manifestations violentes à Barcelone' },
    ],
  },
  {
    id: 'ngo', title: 'ONG & humanitaires', kind: 'Organisation humanitaire',
    Icon: Heart, color: '#EF4444', bg: 'rgba(239,68,68,0.08)',
    price: '1 500 – 4 000 €/an', profile: 'humanitarian', peopleLabel: 'Personnel terrain', headLabel: 'agents',
    market: '200 ONG françaises · personnel en zones à risque',
    arr: 'ARR cible 2 800 €/ONG',
    groups: [
      { id: 'g1', name: 'Mission Afrique du Nord', people: [
        { name: 'Dr. Sophie L.', role: 'Coord. santé', destinationId: 'cairo-egypt', city: 'Le Caire', meta: '6 mois' },
        { name: 'Karim B.', role: 'Logisticien', destinationId: 'marrakech-morocco', city: 'Marrakech', meta: '3 mois' },
      ]},
      { id: 'g2', name: 'Mission Asie', people: [
        { name: 'Inès D.', role: 'Cheffe projet', destinationId: 'mumbai-india', city: 'Mumbai', meta: '12 mois' },
        { name: 'Aïcha N.', role: 'Resp. terrain', destinationId: 'bangkok-thailand', city: 'Bangkok', meta: '8 mois' },
      ]},
      { id: 'g3', name: 'Mission Amériques', people: [
        { name: 'Marc V.', role: 'Eau & assainissement', destinationId: 'mexico-city-mexico', city: 'Mexico', meta: '4 mois' },
      ]},
    ],
    features: [
      { key: 'missions', label: 'Gestion des missions terrain', desc: 'Missions actives et niveau de risque', Icon: MapPin },
      { key: 'team-alerts', label: 'Alertes sécurité équipes', desc: 'Surveillance équipes expatriées', Icon: Radio },
      { key: 'incident-history', label: 'Historique & analyse incidents', desc: 'Suivi pour améliorer la sécurité', Icon: LineChart },
      { key: 'support', label: 'Support dédié 7j/7', desc: 'Astreinte & account manager', Icon: Shield },
    ],
    scenarios: [
      { label: 'Coup d\'État Le Caire', destinationId: 'cairo-egypt', type: 'political', severity: 'red', title: 'Troubles politiques majeurs au Caire' },
      { label: 'Inondations Bangkok', destinationId: 'bangkok-thailand', type: 'flood', severity: 'red', title: 'Inondations majeures à Bangkok' },
      { label: 'Épidémie Mumbai', destinationId: 'mumbai-india', type: 'epidemic', severity: 'orange', title: 'Épidémie déclarée à Mumbai' },
    ],
  },
  {
    id: 'insurer', title: 'Assureurs (API white-label)', kind: 'Assurance voyage',
    Icon: Building2, color: '#10B981', bg: 'rgba(16,185,129,0.08)',
    price: '5 000 – 20 000 €/an', profile: 'default', peopleLabel: 'Assurés couverts', headLabel: 'contrats',
    market: 'Marché e-SIM & assurance voyage en forte croissance',
    arr: 'ARR cible 12 000 €/assureur (API)',
    groups: [
      { id: 'g1', name: 'Portefeuille Affaires', people: [
        { name: 'Contrat #A-1042', role: 'Voyage affaires', destinationId: 'rio-de-janeiro-brazil', city: 'Rio', meta: 'Prime 89 €', count: 320 },
      ]},
      { id: 'g2', name: 'Portefeuille Loisirs', people: [
        { name: 'Contrat #A-2087', role: 'Vacances famille', destinationId: 'bali-indonesia', city: 'Bali', meta: 'Prime 64 €', count: 540 },
        { name: 'Contrat #A-3391', role: 'Backpack', destinationId: 'bangkok-thailand', city: 'Bangkok', meta: 'Prime 120 €', count: 410 },
        { name: 'Contrat #A-4410', role: 'Séjour senior', destinationId: 'rome-italy', city: 'Rome', meta: 'Prime 75 €', count: 280 },
      ]},
    ],
    features: [
      { key: 'api', label: 'API Lokascore intégrée', desc: 'Le score dans votre espace client', Icon: Code2 },
      { key: 'risk-pricing', label: 'Tarification au risque pays', desc: 'Prime ajustée au Lokascore', Icon: LineChart },
      { key: 'white-label', label: 'Branding personnalisé', desc: 'Vos couleurs, votre domaine', Icon: Sparkles },
      { key: 'sla', label: 'SLA 99,9 %', desc: 'Disponibilité garantie', Icon: Shield },
    ],
    scenarios: [
      { label: 'Séisme Bali', destinationId: 'bali-indonesia', type: 'earthquake', severity: 'red', title: 'Séisme M6.8 près de Bali' },
      { label: 'Crise Rio', destinationId: 'rio-de-janeiro-brazil', type: 'political', severity: 'orange', title: 'Pic de criminalité à Rio' },
    ],
  },
  {
    id: 'airline', title: 'Compagnies aériennes', kind: 'Transport aérien',
    Icon: Plane, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',
    price: '8 000 – 25 000 €/an', profile: 'vacation', peopleLabel: 'Passagers couverts', headLabel: 'passagers',
    market: '1,52 Md voyageurs/an · trafic aérien +7%',
    arr: 'ARR cible 18 000 €/compagnie',
    groups: [
      { id: 'g1', name: 'Réseau Asie', people: [
        { name: 'Vol AF276', role: 'CDG → Tokyo', destinationId: 'tokyo-japan', city: 'Tokyo', meta: 'Quotidien', count: 312 },
        { name: 'Vol AF690', role: 'CDG → Bangkok', destinationId: 'bangkok-thailand', city: 'Bangkok', meta: 'Quotidien', count: 276 },
      ]},
      { id: 'g2', name: 'Réseau Afrique / Moyen-Orient', people: [
        { name: 'Vol AF438', role: 'CDG → Le Caire', destinationId: 'cairo-egypt', city: 'Le Caire', meta: 'Quotidien', count: 198 },
        { name: 'Vol AF820', role: 'CDG → Istanbul', destinationId: 'istanbul-turkey', city: 'Istanbul', meta: 'Quotidien', count: 224 },
      ]},
      { id: 'g3', name: 'Réseau Amériques', people: [
        { name: 'Vol AF112', role: 'CDG → New York', destinationId: 'new-york-usa', city: 'New York', meta: 'Quotidien', count: 341 },
      ]},
    ],
    features: [
      { key: 'passenger-app', label: 'Notifications app passager', desc: 'Le score dans votre app', Icon: Smartphone },
      { key: 'preflight', label: 'Information destination pré-vol', desc: 'Briefing sécurité automatique', Icon: Plane },
      { key: 'ops-alerts', label: 'Alertes opérationnelles', desc: 'Anticipez annulations', Icon: Radio },
      { key: 'cobranding', label: 'Co-branding', desc: 'Score aux couleurs compagnie', Icon: Sparkles },
    ],
    scenarios: [
      { label: 'Séisme Tokyo', destinationId: 'tokyo-japan', type: 'earthquake', severity: 'red', title: 'Séisme M7.1 — aéroport Narita perturbé' },
      { label: 'Fermeture espace aérien Istanbul', destinationId: 'istanbul-turkey', type: 'political', severity: 'red', title: 'Restrictions espace aérien Istanbul' },
    ],
  },
  {
    id: 'mice', title: 'MICE & voyages affaires', kind: 'Événementiel & entreprise',
    Icon: Briefcase, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',
    price: '2 000 – 6 000 €/an', profile: 'business', peopleLabel: 'Collaborateurs', headLabel: 'collaborateurs',
    market: 'Obligation employeur L4121-1 · marché voyages d\'affaires',
    arr: 'ARR cible 4 200 €/entreprise',
    groups: [
      { id: 'g1', name: 'Séminaire Dubaï', people: [
        { name: 'Séminaire Sales', role: 'Équipe commerciale', destinationId: 'dubai-uae', city: 'Dubaï', meta: '12–15 mars', count: 42 },
      ]},
      { id: 'g2', name: 'Convention Londres', people: [
        { name: 'Convention annuelle', role: 'Tous départements', destinationId: 'london-uk', city: 'Londres', meta: '4–6 avril', count: 120 },
      ]},
      { id: 'g3', name: 'Déplacements individuels', people: [
        { name: 'Julien R.', role: 'Dir. commercial', destinationId: 'singapore-singapore', city: 'Singapour', meta: 'Mission' },
        { name: 'Sarah M.', role: 'Account manager', destinationId: 'shanghai-china', city: 'Shanghai', meta: 'Mission' },
        { name: 'Laura P.', role: 'VP Sales', destinationId: 'new-york-usa', city: 'New York', meta: 'Déplacement' },
      ]},
    ],
    features: [
      { key: 'seminars', label: 'Gestion risque séminaires', desc: 'Suivi événements & participants', Icon: Users },
      { key: 'employer-compliance', label: 'Conformité obligation employeur', desc: 'Devoir de protection L4121-1', Icon: Download },
      { key: 'collab-alerts', label: 'Alertes temps réel collaborateurs', desc: 'Notification immédiate', Icon: Bell },
      { key: 'hr-dashboard', label: 'Tableau de bord RH', desc: 'Vue consolidée RH', Icon: LayoutDashboard },
    ],
    scenarios: [
      { label: 'Tension Dubaï', destinationId: 'dubai-uae', type: 'political', severity: 'orange', title: 'Tensions régionales — Dubaï' },
      { label: 'Attentat Londres', destinationId: 'london-uk', type: 'war', severity: 'red', title: 'Alerte attentat à Londres' },
      { label: 'Séisme Shanghai', destinationId: 'shanghai-china', type: 'earthquake', severity: 'red', title: 'Séisme ressenti à Shanghai' },
    ],
  },
];

function flagOf(iso: string): string {
  if (!iso || iso.length !== 2) return '🌍';
  return String.fromCodePoint(...iso.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
}
const headcount = (people: Person[]) => people.reduce((s, p) => s + (p.count ?? 1), 0);

export default function ProDemoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const offerId = new URLSearchParams(location.search).get('offer') ?? 'univ';
  const offer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[0];
  const allPeople = useMemo(() => offer.groups.flatMap((g) => g.people), [offer]);

  const [scores, setScores] = useState<Record<string, LokascoreApiResult>>({});
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(getLiveAlertsSnapshot());
  const [feature, setFeature] = useState<FeatureKey | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // ─── État de la simulation de crise ───
  const [sim, setSim] = useState<Scenario | null>(null);
  const [broadcast, setBroadcast] = useState<{ groupName: string; total: number } | null>(null);
  const [ack, setAck] = useState(0);
  const ackTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSim(null); setBroadcast(null); setAck(0);
    const ids = [...new Set(allPeople.map((p) => p.destinationId))];
    Promise.all(ids.map((id) => fetchLokascore(id, offer.profile).then((r) => [id, r] as const)))
      .then((entries) => {
        if (cancelled) return;
        const map: Record<string, LokascoreApiResult> = {};
        for (const [id, r] of entries) if (r) map[id] = r;
        setScores(map); setLoading(false);
      });
    return () => { cancelled = true; };
  }, [offerId]);

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  // Score affiché (la simulation force la destination touchée en rouge)
  const displayScore = (destId: string): number | null => {
    if (sim && sim.destinationId === destId) return sim.severity === 'red' ? 18 : 42;
    return scores[destId]?.score ?? null;
  };
  const groupScore = (g: Group): number | null => {
    const vals = g.people.map((p) => displayScore(p.destinationId)).filter((s): s is number => s != null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };
  const groupAffected = (g: Group) => sim != null && g.people.some((p) => p.destinationId === sim.destinationId);

  // KPIs
  const kpis = useMemo(() => {
    const total = headcount(allPeople);
    const groups = offer.groups.length;
    let atRisk = 0;
    for (const p of allPeople) { const s = displayScore(p.destinationId); if (s != null && s < 60) atRisk += (p.count ?? 1); }
    return { total, groups, atRisk };
  }, [offer, scores, sim]);

  // Points carte : agrégation par destination (effectif, noms, score, alerte)
  const mapPoints = useMemo<DemoMapPoint[]>(() => {
    const byDest = new Map<string, { city: string; count: number; names: string[] }>();
    for (const p of allPeople) {
      const e = byDest.get(p.destinationId) ?? { city: p.city, count: 0, names: [] };
      e.count += p.count ?? 1;
      e.names.push(p.name);
      byDest.set(p.destinationId, e);
    }
    return [...byDest.entries()].map(([destinationId, e]) => ({
      destinationId, city: e.city, count: e.count, names: e.names,
      score: displayScore(destinationId),
      affected: sim?.destinationId === destinationId,
    }));
  }, [allPeople, scores, sim]);

  // Flux d'alertes : simulation en tête, puis alertes réelles du périmètre
  const feed = useMemo(() => {
    const isos = new Set(allPeople.map((p) => DESTINATION_TO_COUNTRY_ISO[p.destinationId]).filter(Boolean));
    const real = (snapshot?.alerts ?? []).filter((a) => a.countryIso && isos.has(a.countryIso)).slice(0, 5)
      .map((a) => ({ sim: false, type: a.type, severity: a.severity, title: a.description, iso: a.countryIso, source: a.source }));
    const simItem = sim ? [{ sim: true, type: sim.type, severity: sim.severity, title: sim.title, iso: DESTINATION_TO_COUNTRY_ISO[sim.destinationId] ?? '', source: 'SIMULATION' }] : [];
    return [...simItem, ...real];
  }, [snapshot, allPeople, sim]);

  function runScenario(s: Scenario) {
    setSim(s);
    setBroadcast(null); setAck(0);
    // Ouvre automatiquement le groupe touché
    const g = offer.groups.find((gr) => gr.people.some((p) => p.destinationId === s.destinationId));
    if (g) setOpenGroups((prev) => new Set(prev).add(g.id));
  }
  function resetSim() { setSim(null); setBroadcast(null); setAck(0); }

  function alertGroup(g: Group) {
    const total = headcount(g.people);
    setBroadcast({ groupName: g.name, total });
    setAck(0);
    if (ackTimer.current) window.clearInterval(ackTimer.current);
    // Animation des confirmations de sécurité
    ackTimer.current = window.setInterval(() => {
      setAck((prev) => {
        const next = prev + Math.max(1, Math.round(total * 0.08));
        if (next >= total) { if (ackTimer.current) window.clearInterval(ackTimer.current); return total; }
        return next;
      });
    }, 350);
  }
  useEffect(() => () => { if (ackTimer.current) window.clearInterval(ackTimer.current); }, []);

  const toggleGroup = (id: string) => setOpenGroups((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--lokadia-background)' }}>
      {/* Bandeau démo */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 px-5 py-2.5 text-white" style={{ background: offer.color }}>
        <div className="flex items-center gap-2 text-xs font-bold">
          <Radio className="h-4 w-4 animate-pulse" />
          Démo Lokadia Pro · {offer.title}
        </div>
        <button onClick={() => navigate('/pro')} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur hover:bg-white/30">
          <ArrowLeft className="h-3.5 w-3.5" /> Offres
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
        {/* Sélecteur d'offre */}
        <div className="mb-4 flex flex-wrap gap-2">
          {OFFERS.map((o) => (
            <button key={o.id} onClick={() => navigate(`/pro/demo?offer=${o.id}`)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
              style={{ background: o.id === offerId ? o.color : 'white', color: o.id === offerId ? 'white' : 'var(--lokadia-gray-700)', border: '1px solid var(--lokadia-gray-100)' }}>
              <o.Icon className="h-3.5 w-3.5" /> {o.title}
            </button>
          ))}
        </div>

        {/* Bandeau investisseur : marché + ARR */}
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-3xl p-4 sm:grid-cols-3" style={{ background: offer.bg }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 flex-shrink-0" style={{ color: offer.color }} />
            <div><p className="text-[10px] font-bold uppercase" style={{ color: offer.color }}>Marché</p>
              <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-800)' }}>{offer.market}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 flex-shrink-0" style={{ color: offer.color }} />
            <div><p className="text-[10px] font-bold uppercase" style={{ color: offer.color }}>Revenu récurrent</p>
              <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-800)' }}>{offer.arr}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 flex-shrink-0" style={{ color: offer.color }} />
            <div><p className="text-[10px] font-bold uppercase" style={{ color: offer.color }}>Réactivité</p>
              <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-800)' }}>Alerte &lt; 30 s · MAJ continue</p></div>
          </div>
        </div>

        {/* ─── SIMULATION DE CRISE (la star de la démo) ─── */}
        <div className="mb-4 rounded-3xl p-5" style={{ background: sim ? 'rgba(239,68,68,0.06)' : 'white', border: `2px solid ${sim ? 'rgba(239,68,68,0.4)' : 'var(--lokadia-gray-100)'}` }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold" style={{ color: sim ? '#dc2626' : 'var(--lokadia-gray-900)' }}>
              <Siren className={`h-5 w-5 ${sim ? 'animate-pulse' : ''}`} style={{ color: '#dc2626' }} />
              Simulation de crise
            </h2>
            {sim && (
              <button onClick={resetSim} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-700)' }}>
                Réinitialiser
              </button>
            )}
          </div>
          {!sim ? (
            <>
              <p className="mb-3 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                Déclenchez un événement et observez la réaction du système en temps réel : score qui chute,
                groupe en alerte, diffusion d'urgence et suivi des confirmations de sécurité.
              </p>
              <div className="flex flex-wrap gap-2">
                {offer.scenarios.map((s) => (
                  <button key={s.label} onClick={() => runScenario(s)}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: s.severity === 'red' ? '#dc2626' : '#d97706' }}>
                    <Zap className="h-3.5 w-3.5" /> {s.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              {(() => { const I = ALERT_TYPE_META[sim.type]?.Icon ?? AlertTriangle; return <I className="h-6 w-6 flex-shrink-0" style={{ color: '#dc2626' }} />; })()}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#991b1b' }}><Siren className="h-4 w-4 flex-shrink-0" /> EN COURS : {sim.title}</p>
                <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-600)' }}>Le système a basculé la zone en rouge et identifié les personnes concernées.</p>
              </div>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: offer.peopleLabel, value: kpis.total.toLocaleString('fr-FR'), Icon: Users, color: offer.color },
            { label: 'Groupes gérés', value: kpis.groups, Icon: LayoutDashboard, color: '#0369a1' },
            { label: `${offer.headLabel} en zone à risque`, value: kpis.atRisk.toLocaleString('fr-FR'), Icon: AlertTriangle, color: kpis.atRisk > 0 ? '#dc2626' : '#15803d' },
            { label: 'Alertes en direct', value: feed.length, Icon: Bell, color: feed.length > 0 ? '#d97706' : '#15803d' },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <k.Icon className="mb-2 h-5 w-5" style={{ color: k.color }} />
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{k.value}</p>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* ─── CARTE MONDIALE (salle de contrôle) ─── */}
        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            <MapPin className="h-5 w-5" style={{ color: offer.color }} /> Carte de suivi mondiale
            {sim && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white animate-pulse" style={{ background: '#dc2626' }}>CRISE EN COURS</span>}
          </h2>
          <ProDemoMap points={mapPoints} accent={offer.color} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ─── GESTION MULTI-GROUPES ─── */}
          <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              <Users className="h-5 w-5" style={{ color: offer.color }} /> Groupes
              <span className="ml-auto text-xs font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>{offer.groups.length} groupes · {kpis.total.toLocaleString('fr-FR')} {offer.headLabel}</span>
            </h2>
            <div className="space-y-2.5">
              {offer.groups.map((g) => {
                const gs = groupScore(g);
                const lvl = getLokascoreLevel(gs);
                const affected = groupAffected(g);
                const open = openGroups.has(g.id);
                return (
                  <div key={g.id} className="rounded-2xl border" style={{ borderColor: affected ? 'rgba(239,68,68,0.45)' : 'var(--lokadia-gray-100)', background: affected ? 'rgba(239,68,68,0.04)' : 'white' }}>
                    <div className="flex items-center gap-3 p-3">
                      <button onClick={() => toggleGroup(g.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--lokadia-gray-400)' }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{g.name}</p>
                            {affected && <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white animate-pulse" style={{ background: '#dc2626' }}>ALERTE</span>}
                          </div>
                          <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{headcount(g.people).toLocaleString('fr-FR')} {offer.headLabel} · {g.people.length} destination{g.people.length > 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white tabular-nums" style={{ background: lvl.fillColor }}>{loading ? '…' : gs ?? '—'}</span>
                          <span className="mt-0.5 text-[9px] font-bold" style={{ color: lvl.color }}>{gs != null ? lvl.label : ''}</span>
                        </div>
                      </button>
                      <button onClick={() => alertGroup(g)} title="Alerter ce groupe"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform active:scale-90"
                        style={{ background: affected ? '#dc2626' : 'var(--lokadia-gray-100)', color: affected ? 'white' : 'var(--lokadia-gray-600)' }}>
                        <Bell className="h-4 w-4" />
                      </button>
                    </div>
                    {open && (
                      <div className="space-y-1.5 border-t px-3 py-2" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                        {g.people.map((p) => {
                          const s = displayScore(p.destinationId);
                          const plvl = getLokascoreLevel(s);
                          const iso = DESTINATION_TO_COUNTRY_ISO[p.destinationId] ?? '';
                          const isHit = sim?.destinationId === p.destinationId;
                          return (
                            <button key={p.name} onClick={() => navigate(`/destination/${p.destinationId}`)}
                              className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-gray-50">
                              <span className="text-base">{flagOf(iso)}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{p.name} {p.count ? <span className="font-normal" style={{ color: 'var(--lokadia-gray-400)' }}>· {p.count}</span> : ''}</p>
                                <p className="text-[10px] truncate" style={{ color: 'var(--lokadia-gray-500)' }}>{p.role} · {p.city} · {p.meta}</p>
                              </div>
                              {isHit && <span className="text-[9px] font-bold" style={{ color: '#dc2626' }}>▼ chute</span>}
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white tabular-nums" style={{ background: plvl.fillColor }}>{loading ? '…' : s ?? '—'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── FLUX TEMPS RÉEL ─── */}
          <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              <Activity className="h-5 w-5" style={{ color: '#dc2626' }} /> Flux temps réel
            </h2>
            {feed.length === 0 ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl p-4 text-center text-sm" style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d' }}><ShieldCheck className="h-4 w-4 flex-shrink-0" /> Aucune alerte sur votre périmètre</div>
            ) : (
              <div className="space-y-2">
                {feed.map((a, i) => {
                  const meta = ALERT_TYPE_META[a.type] ?? ALERT_TYPE_META.other;
                  return (
                    <div key={i} className="rounded-xl p-2.5" style={{ background: a.sim ? 'rgba(239,68,68,0.1)' : a.severity === 'red' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: a.sim ? '1px solid rgba(239,68,68,0.4)' : 'none' }}>
                      <div className="flex items-center gap-1.5">
                        <meta.Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                        {a.sim && <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white" style={{ background: '#dc2626' }}>SIMULATION</span>}
                        <span className="ml-auto">{flagOf(a.iso)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-700)' }}>{a.title}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fonctionnalités incluses */}
        <h2 className="mt-6 mb-3 text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Inclus dans cette offre</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {offer.features.map((f) => (
            <button key={f.key} onClick={() => setFeature(f.key)}
              className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: offer.bg }}>
                <f.Icon className="h-4 w-4" style={{ color: offer.color }} />
              </div>
              <p className="text-sm font-bold leading-snug" style={{ color: 'var(--lokadia-gray-900)' }}>{f.label}</p>
              <p className="text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-500)' }}>{f.desc}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: offer.color }}>Voir la démo <ArrowRight className="h-3 w-3" /></span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl p-6 text-center text-white" style={{ background: offer.color }}>
          <h3 className="text-xl font-bold">Déployez « {offer.title} »</h3>
          <p className="max-w-xl text-sm text-white/90">{offer.market} — {offer.arr}. Toutes les fonctionnalités ci-dessus incluses.</p>
          <button onClick={() => navigate('/pro')} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold" style={{ color: offer.color }}>
            Demander un devis <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modale diffusion d'urgence (suivi des confirmations) */}
      <Modal isOpen={broadcast !== null} onClose={() => setBroadcast(null)} title="Diffusion d'urgence groupée">
        {broadcast && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Message envoyé (push + email + SMS) à <strong>{broadcast.total.toLocaleString('fr-FR')} {offer.headLabel}</strong> du groupe
              « {broadcast.groupName} ».
            </p>
            <div className="rounded-2xl border p-4 text-center" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Confirmations de sécurité</p>
              <p className="my-1 text-4xl font-bold tabular-nums" style={{ color: ack >= broadcast.total ? '#15803d' : '#d97706' }}>
                {ack.toLocaleString('fr-FR')}<span className="text-lg" style={{ color: 'var(--lokadia-gray-400)' }}> / {broadcast.total.toLocaleString('fr-FR')}</span>
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--lokadia-gray-100)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(ack / broadcast.total) * 100}%`, background: ack >= broadcast.total ? '#22c55e' : '#f59e0b' }} />
              </div>
              <p className="mt-2 text-xs font-bold" style={{ color: ack >= broadcast.total ? '#15803d' : 'var(--lokadia-gray-600)' }}>
                {ack >= broadcast.total ? 'Toutes les personnes ont confirmé leur sécurité' : 'Réponses en cours…'}
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'var(--lokadia-info-bg)' }}>
              <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--lokadia-primary)' }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
                Chaque confirmation est horodatée et archivée comme <strong>preuve de diligence</strong> (devoir de protection, art. L4121-1).
              </p>
            </div>
          </div>
        )}
      </Modal>

      <FeatureModal feature={feature} onClose={() => setFeature(null)} offer={offer} scores={scores} />
    </main>
  );
}

// ════════════════════════════════════════════════════════════════════════
function FeatureModal({ feature, onClose, offer, scores }: { feature: FeatureKey | null; onClose: () => void; offer: OfferDemo; scores: Record<string, LokascoreApiResult> }) {
  const allPeople = offer.groups.flatMap((g) => g.people);
  const titles: Record<FeatureKey, string> = {
    students: 'Suivi des étudiants Erasmus', 'group-alert': 'Alertes groupe par pays', 'ri-dashboard': 'Dashboard relations internationales', compliance: 'Reporting devoir de protection',
    missions: 'Gestion des missions terrain', 'team-alerts': 'Alertes sécurité équipes', 'incident-history': 'Historique & analyse des incidents', support: 'Support dédié 7j/7',
    api: 'API Lokascore intégrée', 'risk-pricing': 'Tarification au risque pays', 'white-label': 'Branding personnalisé', sla: 'SLA 99,9 %',
    'passenger-app': 'Notifications app passager', preflight: 'Information destination pré-vol', 'ops-alerts': 'Alertes opérationnelles', cobranding: 'Co-branding',
    seminars: 'Gestion risque groupes/séminaires', 'employer-compliance': 'Conformité obligation employeur', 'collab-alerts': 'Alertes temps réel collaborateurs', 'hr-dashboard': 'Tableau de bord RH',
  };
  const ok = (txt: string) => <div className="flex items-center justify-center gap-2 rounded-xl p-3 text-center text-sm font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}><CheckCircle2 className="h-4 w-4 flex-shrink-0" />{txt}</div>;
  const list = (items: string[]) => (
    <ul className="space-y-2">{items.map((x) => (
      <li key={x} className="flex items-start gap-2 text-sm" style={{ color: 'var(--lokadia-gray-700)' }}>
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: offer.color }} /> {x}
      </li>))}</ul>
  );

  function content() {
    switch (feature) {
      case 'students': case 'missions': case 'seminars':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Chaque personne est suivie en continu avec localisation et Lokascore temps réel, organisée en groupes.</p>{list(['Localisation et destination', 'Lokascore live + niveau de risque', 'Alerte visuelle si passage en zone rouge', 'Organisation par groupes/cohortes'])}{ok(`Démo — ${offer.groups.length} groupes suivis`)}</div>;
      case 'group-alert': case 'team-alerts': case 'collab-alerts':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Cliquez sur la cloche d'un groupe (panneau Groupes) pour diffuser une alerte et suivre les confirmations de sécurité en direct.</p>{list(['Diffusion push + email + SMS', 'Ciblage par groupe ou par pays', 'Suivi des confirmations en temps réel', 'Archivage horodaté (preuve)'])}{ok('Essayez le bouton cloche d\'un groupe !')}</div>;
      case 'ri-dashboard': case 'hr-dashboard':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Le tableau de bord que vous consultez <em>est</em> la démo : KPIs, groupes, flux temps réel et simulation de crise.</p>{list(['KPIs consolidés', 'Gestion multi-groupes', 'Flux d\'alertes filtré', 'Simulation et export'])}{ok('Vous y êtes !')}</div>;
      case 'compliance': case 'employer-compliance':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Export attestant du suivi, conforme à l'obligation de sécurité (<strong>art. L4121-1</strong>).</p>{list(['Liste horodatée personnes + destinations', 'Lokascore et évolution', 'Alertes et confirmations de sécurité', 'Preuve de diligence (audit, assurance)'])}{ok('Démo — rapport généré en PDF')}</div>;
      case 'incident-history':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Chaque incident est archivé et analysé.</p><div className="space-y-2">{[{ d: 'Mars 2026', t: 'Manifestation Le Caire', s: 'Équipe confinée 24h, RAS' }, { d: 'Janv. 2026', t: 'Séisme léger Mexico', s: 'Aucun blessé' }, { d: 'Nov. 2025', t: 'Alerte sanitaire Mumbai', s: 'Vaccination renforcée' }].map((i) => (<div key={i.t} className="rounded-xl border p-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}><p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{i.d} · {i.t}</p><p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{i.s}</p></div>))}</div>{ok('3 incidents archivés')}</div>;
      case 'support':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Astreinte 7j/7 et account manager dédié.</p>{list(['Hotline 24h/24 en crise', 'Account manager nommé', 'Réponse < 1h en urgence', 'Accompagnement gestion de crise'])}{ok('Support prioritaire inclus')}</div>;
      case 'api':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Intégrez le Lokascore via une API REST.</p><div className="overflow-x-auto rounded-xl p-3 font-mono text-xs" style={{ background: '#0f172a', color: '#e2e8f0' }}><div style={{ color: '#94a3b8' }}># Score d'une destination</div><div><span style={{ color: '#7dd3fc' }}>GET</span> /v1/lokascore?destination=bangkok-thailand</div><div className="mt-2">{'{ "score": 78, "level": "vigilance", ... }'}</div></div>{ok('Clé API après contrat')}</div>;
      case 'risk-pricing': {
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>La prime s'ajuste au risque pays : plus le score baisse, plus elle reflète le risque.</p><div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--lokadia-gray-100)' }}><div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase" style={{ color: 'var(--lokadia-gray-500)' }}><span>Destination</span><span>Score</span><span>Prime</span></div>{allPeople.map((p) => { const score = scores[p.destinationId]?.score; const base = parseInt(p.meta.replace(/\D/g, '') || '80', 10); const adj = score != null ? Math.round(base * (1 + (100 - score) / 100)) : null; return (<div key={p.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t px-3 py-2 text-xs" style={{ borderColor: 'var(--lokadia-gray-100)' }}><span className="truncate" style={{ color: 'var(--lokadia-gray-700)' }}>{p.city}</span><span className="font-bold tabular-nums" style={{ color: getLokascoreLevel(score ?? null).color }}>{score ?? '…'}</span><span className="font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{adj ? `${adj} €` : '…'}</span></div>); })}</div>{ok('Tarification dynamique au risque réel')}</div>;
      }
      case 'white-label': case 'cobranding':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Le Lokascore aux couleurs de votre marque.</p><div className="rounded-2xl p-4" style={{ border: `2px solid ${offer.color}` }}><div className="mb-3 flex items-center gap-2"><div className="h-6 w-6 rounded" style={{ background: offer.color }} /><span className="text-sm font-bold" style={{ color: offer.color }}>VotreMarque · Sécurité voyage</span></div><div className="flex items-center justify-between rounded-xl p-3" style={{ background: offer.bg }}><span className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>Bangkok, Thaïlande</span><span className="rounded-full px-3 py-1 text-sm font-bold text-white" style={{ background: offer.color }}>78/100</span></div></div>{ok('Rendu à vos couleurs')}</div>;
      case 'sla':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Engagement de disponibilité contractuel.</p><div className="grid grid-cols-3 gap-2 text-center">{[{ k: 'Uptime', v: '99,9 %' }, { k: 'Latence', v: '< 200 ms' }, { k: 'Support', v: 'Prioritaire' }].map((s) => (<div key={s.k} className="rounded-xl p-3" style={{ background: offer.bg }}><p className="text-lg font-bold" style={{ color: offer.color }}>{s.v}</p><p className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{s.k}</p></div>))}</div>{ok('Tous services opérationnels')}</div>;
      case 'passenger-app':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Le Lokascore dans votre app passager.</p><div className="mx-auto w-48 rounded-3xl border-4 p-3" style={{ borderColor: 'var(--lokadia-gray-200)' }}><div className="rounded-xl p-3" style={{ background: offer.bg }}><p className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>Votre vol AF276</p><p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Tokyo</p><div className="mt-2 flex items-center justify-between"><span className="text-[11px]" style={{ color: 'var(--lokadia-gray-600)' }}>Sécurité</span><span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: '#22c55e' }}>92</span></div></div></div>{ok('Widget intégrable')}</div>;
      case 'preflight':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Briefing sécurité avant départ.</p>{list(['Lokascore et niveau destination', 'Alertes en cours', 'Numéros d\'urgence et consulat', 'Formalités d\'entrée et santé'])}{ok('Briefing pré-vol prêt')}</div>;
      case 'ops-alerts':
        return <div className="space-y-3"><p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>Anticipez annulations et déroutements.</p>{list(['Catastrophes (GDACS) sur les routes', 'Fermetures d\'espace aérien', 'Épidémies impactant destinations', 'Webhook vers équipes ops'])}{ok('Flux ops connecté')}</div>;
      default: return null;
    }
  }
  return <Modal isOpen={feature !== null} onClose={onClose} title={feature ? titles[feature] : ''}>{content()}</Modal>;
}
