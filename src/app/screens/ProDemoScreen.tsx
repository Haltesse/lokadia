/**
 * ProDemoScreen — Tableau de bord démo "Lokadia Pro" (B2B).
 *
 * Démo interactive présentée aux prospects (universités, ONG, entreprises,
 * assureurs) qui cliquent sur « Voir la démo ». Montre TOUTES les
 * fonctionnalités vendues dans les documents B2B :
 *   - Tableau de bord temps réel des personnes en mobilité
 *   - Lokascore live par destination (calcul serveur réel)
 *   - Alertes pays automatiques (USGS/GDACS/OMS/géopolitique)
 *   - Message d'urgence groupé
 *   - Reporting de conformité (devoir de protection, art. L4121-1)
 *   - Alerte automatique si une destination passe en zone rouge
 *   - API Lokascore white-label (assureurs)
 *   - Account management dédié
 *
 * Données fictives — bandeau « Mode démo » permanent + CTA contact.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle, ArrowLeft, Bell, Building2, CheckCircle2, Download,
  GraduationCap, Heart, MapPin, Radio, Send, Shield, Users, Code2,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { fetchLokascore, type LokascoreApiResult } from '../lib/lokascoreApi';
import { getLokascoreLevel, type TravelProfile } from '../lib/lokascore';
import {
  subscribeToLiveAlerts, getLiveAlertsSnapshot, ALERT_TYPE_META,
  type LiveAlertsSnapshot,
} from '../lib/liveAlertsService';
import { DESTINATION_TO_COUNTRY_ISO } from '../data/countryRiskData';

interface Person {
  name: string;
  role: string;
  destinationId: string;
  city: string;
  dates: string;
}

interface DemoOrg {
  id: string;
  name: string;
  kind: string;
  Icon: typeof GraduationCap;
  color: string;
  profile: TravelProfile;
  peopleLabel: string;
  people: Person[];
}

// ─── Organisations démo (chaque segment B2B documenté) ───
const DEMO_ORGS: DemoOrg[] = [
  {
    id: 'univ', name: 'Université Aix-Marseille', kind: 'École / Université',
    Icon: GraduationCap, color: '#0A84FF', profile: 'studies', peopleLabel: 'Étudiants en mobilité',
    people: [
      { name: 'Léa Martin', role: 'Erasmus L3 Éco', destinationId: 'barcelona-spain', city: 'Barcelone', dates: 'Sept. 2026 → Janv. 2027' },
      { name: 'Hugo Bernard', role: 'Erasmus M1 Droit', destinationId: 'berlin-germany', city: 'Berlin', dates: 'Sept. 2026 → Juin 2027' },
      { name: 'Emma Petit', role: 'Erasmus L3 LEA', destinationId: 'lisbon-portugal', city: 'Lisbonne', dates: 'Sept. 2026 → Févr. 2027' },
      { name: 'Tom Garcia', role: 'Échange M2', destinationId: 'tokyo-japan', city: 'Tokyo', dates: 'Oct. 2026 → Mars 2027' },
      { name: 'Chloé Roux', role: 'Stage international', destinationId: 'istanbul-turkey', city: 'Istanbul', dates: 'Sept. 2026 → Déc. 2026' },
      { name: 'Nathan Faure', role: 'Erasmus L3 Info', destinationId: 'prague-czech', city: 'Prague', dates: 'Sept. 2026 → Janv. 2027' },
    ],
  },
  {
    id: 'ngo', name: 'Solidarités International', kind: 'ONG humanitaire',
    Icon: Heart, color: '#EF4444', profile: 'humanitarian', peopleLabel: 'Personnel sur le terrain',
    people: [
      { name: 'Dr. Sophie L.', role: 'Coordinatrice santé', destinationId: 'cairo-egypt', city: 'Le Caire', dates: 'Mission 6 mois' },
      { name: 'Karim B.', role: 'Logisticien', destinationId: 'marrakech-morocco', city: 'Marrakech', dates: 'Mission 3 mois' },
      { name: 'Inès D.', role: 'Cheffe de projet', destinationId: 'mumbai-india', city: 'Mumbai', dates: 'Mission 12 mois' },
      { name: 'Marc V.', role: 'Eau & assainissement', destinationId: 'mexico-city-mexico', city: 'Mexico', dates: 'Mission 4 mois' },
      { name: 'Aïcha N.', role: 'Responsable terrain', destinationId: 'bangkok-thailand', city: 'Bangkok', dates: 'Mission 8 mois' },
    ],
  },
  {
    id: 'corp', name: 'TechCorp Global', kind: 'Entreprise (expatriés)',
    Icon: Building2, color: '#8B5CF6', profile: 'business', peopleLabel: 'Collaborateurs en déplacement',
    people: [
      { name: 'Julien R.', role: 'Directeur commercial', destinationId: 'dubai-uae', city: 'Dubaï', dates: 'Déplacement 2 sem.' },
      { name: 'Sarah M.', role: 'Account manager', destinationId: 'singapore-singapore', city: 'Singapour', dates: 'Expatriation' },
      { name: 'David K.', role: 'Ingénieur', destinationId: 'shanghai-china', city: 'Shanghai', dates: 'Mission 1 mois' },
      { name: 'Laura P.', role: 'VP Sales', destinationId: 'new-york-usa', city: 'New York', dates: 'Déplacement 1 sem.' },
      { name: 'Antoine F.', role: 'Consultant', destinationId: 'london-uk', city: 'Londres', dates: 'Déplacement 3 j.' },
    ],
  },
  {
    id: 'insurer', name: 'AXA Partners', kind: 'Assureur (API white-label)',
    Icon: Shield, color: '#10B981', profile: 'default', peopleLabel: 'Assurés couverts (échantillon)',
    people: [
      { name: 'Contrat #A-1042', role: 'Voyage affaires', destinationId: 'rio-de-janeiro-brazil', city: 'Rio', dates: 'Couverture active' },
      { name: 'Contrat #A-2087', role: 'Vacances famille', destinationId: 'bali-indonesia', city: 'Bali', dates: 'Couverture active' },
      { name: 'Contrat #A-3391', role: 'Backpack', destinationId: 'bangkok-thailand', city: 'Bangkok', dates: 'Couverture active' },
      { name: 'Contrat #A-4410', role: 'Séjour senior', destinationId: 'rome-italy', city: 'Rome', dates: 'Couverture active' },
    ],
  },
];

function flagOf(iso: string): string {
  if (!iso || iso.length !== 2) return '🌍';
  return String.fromCodePoint(...iso.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
}

export default function ProDemoScreen() {
  const navigate = useNavigate();
  const [orgId, setOrgId] = useState(DEMO_ORGS[0].id);
  const org = DEMO_ORGS.find((o) => o.id === orgId)!;
  const [scores, setScores] = useState<Record<string, LokascoreApiResult>>({});
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(getLiveAlertsSnapshot());
  const [modal, setModal] = useState<null | 'emergency' | 'report' | 'auto' | 'api'>(null);

  // Charge les Lokascore réels des destinations de l'org sélectionnée
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const ids = [...new Set(org.people.map((p) => p.destinationId))];
    Promise.all(ids.map((id) => fetchLokascore(id, org.profile).then((r) => [id, r] as const)))
      .then((entries) => {
        if (cancelled) return;
        const map: Record<string, LokascoreApiResult> = {};
        for (const [id, r] of entries) if (r) map[id] = r;
        setScores(map);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [orgId]);

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = org.people.length;
    const destinations = new Set(org.people.map((p) => p.destinationId)).size;
    let atRisk = 0;
    for (const p of org.people) {
      const s = scores[p.destinationId]?.score;
      if (s !== undefined && s !== null && s < 60) atRisk++;
    }
    // Alertes actives sur les pays où il y a des personnes
    const isos = new Set(org.people.map((p) => DESTINATION_TO_COUNTRY_ISO[p.destinationId]).filter(Boolean));
    let activeAlerts = 0;
    if (snapshot) for (const iso of isos) activeAlerts += snapshot.byCountry.get(iso)?.length ?? 0;
    return { total, destinations, atRisk, activeAlerts };
  }, [org, scores, snapshot]);

  // Alertes affectant les personnes de l'org
  const relevantAlerts = useMemo(() => {
    if (!snapshot) return [];
    const isos = new Set(org.people.map((p) => DESTINATION_TO_COUNTRY_ISO[p.destinationId]).filter(Boolean));
    return snapshot.alerts.filter((a) => a.countryIso && isos.has(a.countryIso)).slice(0, 6);
  }, [org, snapshot]);

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--lokadia-background)' }}>
      {/* Bandeau Mode démo */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 px-5 py-2.5 text-white" style={{ background: 'var(--gradient-primary)' }}>
        <div className="flex items-center gap-2 text-xs font-bold">
          <Radio className="h-4 w-4 animate-pulse" />
          Mode démonstration — données fictives · fonctionnalités réelles
        </div>
        <button onClick={() => navigate('/pro')} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur hover:bg-white/30">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux offres
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
        {/* Header + sélecteur d'organisation */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: org.color }}>
              <org.Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: org.color }}>{org.kind}</p>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--lokadia-gray-900)' }}>{org.name}</h1>
              <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>Tableau de bord Lokadia Pro</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_ORGS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOrgId(o.id)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
                style={{ background: o.id === orgId ? o.color : 'white', color: o.id === orgId ? 'white' : 'var(--lokadia-gray-700)', border: '1px solid var(--lokadia-gray-100)' }}
              >
                <o.Icon className="h-3.5 w-3.5" /> {o.kind.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: org.peopleLabel, value: kpis.total, Icon: Users, color: org.color },
            { label: 'Destinations', value: kpis.destinations, Icon: MapPin, color: '#0369a1' },
            { label: 'En zone à risque', value: kpis.atRisk, Icon: AlertTriangle, color: kpis.atRisk > 0 ? '#dc2626' : '#15803d' },
            { label: 'Alertes actives (pays)', value: kpis.activeAlerts, Icon: Bell, color: kpis.activeAlerts > 0 ? '#d97706' : '#15803d' },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <k.Icon className="mb-2 h-5 w-5" style={{ color: k.color }} />
              <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{k.value}</p>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Actions Pro */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button onClick={() => setModal('emergency')} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold transition-all hover:shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)', color: '#dc2626' }}>
            <Send className="h-4 w-4" /> Message d'urgence groupé
          </button>
          <button onClick={() => setModal('report')} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold transition-all hover:shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)', color: 'var(--lokadia-primary)' }}>
            <Download className="h-4 w-4" /> Rapport de conformité
          </button>
          <button onClick={() => setModal('auto')} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold transition-all hover:shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)', color: '#d97706' }}>
            <Bell className="h-4 w-4" /> Alertes automatiques
          </button>
          <button onClick={() => setModal('api')} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold transition-all hover:shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)', color: '#10B981' }}>
            <Code2 className="h-4 w-4" /> API white-label
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Liste des personnes suivies */}
          <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
              <Users className="h-5 w-5" style={{ color: org.color }} /> {org.peopleLabel}
            </h2>
            <div className="space-y-2">
              {org.people.map((p) => {
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
                      <p className="text-[11px] truncate" style={{ color: 'var(--lokadia-gray-500)' }}>
                        {p.role} · {p.city} · {p.dates}
                      </p>
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

          {/* Flux d'alertes affectant l'org */}
          <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
              <Radio className="h-5 w-5" style={{ color: '#dc2626' }} /> Alertes en direct
            </h2>
            {relevantAlerts.length === 0 ? (
              <div className="rounded-2xl p-4 text-center text-sm" style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d' }}>
                ✅ Aucune alerte sur vos destinations actuelles
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
            <div className="mt-4 rounded-2xl p-3" style={{ background: 'var(--lokadia-info-bg)' }}>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
                <Shield className="mr-1 inline h-3 w-3" style={{ color: 'var(--lokadia-primary)' }} />
                <strong>Account manager dédié</strong> + support prioritaire inclus dès 5 000 €/an.
              </p>
            </div>
          </div>
        </div>

        {/* CTA bas de page */}
        <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl p-6 text-center text-white" style={{ background: 'var(--gradient-primary)' }}>
          <h3 className="text-xl font-black">Cette démo vous intéresse pour {org.name.split(' ')[0]} ?</h3>
          <p className="max-w-xl text-sm text-white/90">Déployez Lokadia Pro pour votre organisation : suivi temps réel, conformité au devoir de protection, et tranquillité d'esprit pour vos équipes.</p>
          <button onClick={() => navigate('/pro')} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black" style={{ color: 'var(--lokadia-primary)' }}>
            Demander un devis <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Modales démo des fonctionnalités ─── */}
      <Modal isOpen={modal === 'emergency'} onClose={() => setModal(null)} title="Message d'urgence groupé">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            Envoyez en un clic un message à toutes les personnes présentes dans un pays ou une zone donnée
            (push + email + SMS). Idéal en cas d'événement critique.
          </p>
          <div className="rounded-xl border p-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>Destinataires (démo)</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-900)' }}>
              {org.people.length} {org.peopleLabel.toLowerCase()} · {kpis.destinations} destinations
            </p>
          </div>
          <textarea readOnly value="⚠️ Message de l'organisation : merci de confirmer votre sécurité en répondant à cette notification." className="w-full rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)', minHeight: 80 }} />
          <div className="rounded-xl p-3 text-center text-sm font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
            ✅ Démo — en production, le message partirait à {org.people.length} destinataires
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'report'} onClose={() => setModal(null)} title="Rapport de conformité — Devoir de protection">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            Export PDF/Excel attestant du suivi de vos personnes en mobilité, conforme à l'obligation
            de sécurité de l'employeur (<strong>art. L4121-1</strong> du Code du travail).
          </p>
          <ul className="space-y-2">
            {['Liste horodatée des personnes et destinations', 'Lokascore au départ et évolution', 'Alertes reçues et actions menées', 'Preuve de diligence (audit / assurance)'].map((x) => (
              <li key={x} className="flex items-start gap-2 text-sm" style={{ color: 'var(--lokadia-gray-700)' }}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--lokadia-primary)' }} /> {x}
              </li>
            ))}
          </ul>
          <div className="rounded-xl p-3 text-center text-sm font-bold" style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-primary)' }}>
            📄 Démo — le rapport {org.name} serait généré en PDF
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'auto'} onClose={() => setModal(null)} title="Alertes automatiques">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            Soyez notifié <strong>automatiquement</strong> dès qu'une destination où se trouve une de vos
            personnes franchit un seuil de risque (passage en zone orange ou rouge), attentat, catastrophe
            ou épidémie déclarée.
          </p>
          <div className="space-y-2">
            {[
              { t: 'Passage en zone rouge (Lokascore < 40)', on: true },
              { t: 'Alerte attentat / conflit', on: true },
              { t: 'Catastrophe naturelle (GDACS rouge)', on: true },
              { t: 'Épidémie OMS déclarée', on: true },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>{r.t}</span>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ background: '#10B981' }}>ACTIVÉ</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'api'} onClose={() => setModal(null)} title="API Lokascore white-label">
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            Intégrez le Lokascore directement dans votre propre application ou espace client (assureurs,
            compagnies aériennes). Tarification du risque, branding personnalisé, SLA 99,9 %.
          </p>
          <div className="overflow-x-auto rounded-xl p-3 font-mono text-xs" style={{ background: '#0f172a', color: '#e2e8f0' }}>
            <div style={{ color: '#94a3b8' }}># Récupérer le score d'une destination</div>
            <div><span style={{ color: '#7dd3fc' }}>GET</span> /v1/lokascore?destination=bangkok-thailand</div>
            <div style={{ color: '#94a3b8' }}>Authorization: Bearer &lt;votre_clé_API&gt;</div>
            <div className="mt-2">{'{'}</div>
            <div>&nbsp;&nbsp;"score": 78, "level": "vigilance",</div>
            <div>&nbsp;&nbsp;"dimensions": {'{'} "security": 72, "health": 70, ... {'}'}</div>
            <div>{'}'}</div>
          </div>
          <div className="rounded-xl p-3 text-center text-sm font-bold" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
            🔌 Démo — clé API fournie après signature du contrat
          </div>
        </div>
      </Modal>
    </main>
  );
}
