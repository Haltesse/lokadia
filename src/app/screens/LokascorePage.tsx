/**
 * Page Méthodologie Lokascore — version publique.
 *
 * IMPORTANT : la formule exacte de calcul, les pondérations sectorielles
 * et la matrice de modulation par profil de voyage sont des secrets de
 * fabrique de Lokadia (déposés en enveloppe e-Soleau INPI). Elles ne sont
 * PAS exposées sur cette page.
 *
 * Ce qui reste public :
 *   - Le fait que le score est sur 0-100
 *   - Les 5 niveaux et leur signification
 *   - Les 4 dimensions évaluées (catégories, pas les poids)
 *   - La liste des sources officielles utilisées (pour la confiance)
 *   - Le pipeline général (sans les détails algorithmiques)
 *   - Les 9 profils de voyage (noms seulement, pas les pondérations)
 */
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  Globe,
  Heart,
  Lock,
  Shield,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  DIMENSION_META,
  LOKASCORE_LEVELS_ORDER,
  PROFILE_META,
  PROFILE_ORDER,
} from "../lib/lokascore";

export default function LokascorePage() {
  const navigate = useNavigate();

  // Les 4 dimensions — on liste les sources cibles SANS révéler les poids
  const dimensions = [
    {
      meta: DIMENSION_META.security,
      detail: "Mesure le niveau de menace pesant sur la personne : terrorisme, criminalité, troubles civils, conflits armés.",
      sources: "MAE France · UK FCDO · US State Dept · AU DFAT",
      Icon: Shield,
    },
    {
      meta: DIMENSION_META.health,
      detail: "Mesure les risques sanitaires : épidémies, maladies endémiques, qualité du système de soins.",
      sources: "OMS · ECDC · CDC USA · Lancet HAQ",
      Icon: Heart,
    },
    {
      meta: DIMENSION_META.nature,
      detail: "Mesure le risque actuel et structurel face aux catastrophes naturelles : séismes, cyclones, inondations.",
      sources: "GDACS · ReliefWeb · NASA EONET · EM-DAT · USGS",
      Icon: AlertTriangle,
    },
    {
      meta: DIMENSION_META.infrastructure,
      detail: "Mesure les conditions logistiques et institutionnelles : état de droit, corruption, sécurité routière, connectivité.",
      sources: "WJP · Transparency International · WHO · World Bank · GSMA",
      Icon: Database,
    },
  ];

  // Pipeline conceptuel (sans détails sensibles)
  const pipelineSteps = [
    {
      n: "1",
      title: "Collecte multi-sources",
      desc: "Récupération en temps réel des flux de 16+ sources officielles internationales.",
    },
    {
      n: "2",
      title: "Normalisation",
      desc: "Conversion des échelles natives (Vert/Jaune/Orange/Rouge, Level 1-4...) vers une échelle 0-100 commune.",
    },
    {
      n: "3",
      title: "Agrégation propriétaire",
      desc: "Calcul de chaque indice de risque selon l'algorithme Lokadia (méthodologie déposée INPI).",
    },
    {
      n: "4",
      title: "Personnalisation profil",
      desc: "Le score est adapté au type de voyage que vous préparez, sans collecter de données personnelles.",
    },
    {
      n: "5",
      title: "Modulation événementielle",
      desc: "Pénalité temporaire en cas d'événement critique (attentat, PHEIC, catastrophe rouge).",
    },
  ];

  // Sources officielles — afficher TOUTES, c'est notre crédibilité
  const officialSources = [
    { name: "MAE France", full: "Conseils aux voyageurs", url: "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/", dim: "Sécurité", color: "#1E40AF", bg: "#DBEAFE", Icon: Shield },
    { name: "UK FCDO", full: "Foreign Office Travel Advice", url: "https://www.gov.uk/foreign-travel-advice", dim: "Sécurité", color: "#1E40AF", bg: "#DBEAFE", Icon: Shield },
    { name: "US State Dept", full: "Travel Advisories", url: "https://travel.state.gov/", dim: "Sécurité", color: "#1E40AF", bg: "#DBEAFE", Icon: Shield },
    { name: "AU DFAT", full: "Smartraveller", url: "https://www.smartraveller.gov.au/", dim: "Sécurité", color: "#1E40AF", bg: "#DBEAFE", Icon: Shield },
    { name: "OMS", full: "Disease Outbreak News", url: "https://www.who.int/emergencies/disease-outbreak-news", dim: "Santé", color: "#6D28D9", bg: "#EDE9FE", Icon: Heart },
    { name: "ECDC", full: "Threats reports (UE)", url: "https://www.ecdc.europa.eu/en/threats-and-outbreaks", dim: "Santé", color: "#6D28D9", bg: "#EDE9FE", Icon: Heart },
    { name: "CDC USA", full: "Travel Health Notices", url: "https://wwwnc.cdc.gov/travel/notices", dim: "Santé", color: "#6D28D9", bg: "#EDE9FE", Icon: Heart },
    { name: "Lancet HAQ", full: "Healthcare Access & Quality", url: "https://www.healthdata.org/research-analysis/library/measuring-performance-healthcare-access-and-quality-index-195", dim: "Santé", color: "#6D28D9", bg: "#EDE9FE", Icon: Heart },
    { name: "GDACS", full: "Global Disaster Alert (UE+ONU)", url: "https://www.gdacs.org/", dim: "Nature", color: "#92400E", bg: "#FEF3C7", Icon: AlertTriangle },
    { name: "ReliefWeb", full: "OCHA - Humanitarian alerts", url: "https://reliefweb.int/", dim: "Nature", color: "#92400E", bg: "#FEF3C7", Icon: AlertTriangle },
    { name: "USGS", full: "Earthquakes feed", url: "https://earthquake.usgs.gov/", dim: "Nature", color: "#92400E", bg: "#FEF3C7", Icon: AlertTriangle },
    { name: "EM-DAT", full: "Emergency Events Database", url: "https://www.emdat.be/", dim: "Nature", color: "#92400E", bg: "#FEF3C7", Icon: AlertTriangle },
    { name: "WJP", full: "World Justice Project Rule of Law", url: "https://worldjusticeproject.org/rule-of-law-index/", dim: "Infra", color: "#047857", bg: "#D1FAE5", Icon: Database },
    { name: "Transparency Int.", full: "Corruption Perception Index", url: "https://www.transparency.org/en/cpi", dim: "Infra", color: "#047857", bg: "#D1FAE5", Icon: Database },
    { name: "WHO Road Safety", full: "Global Status Report", url: "https://www.who.int/teams/social-determinants-of-health/safety-and-mobility", dim: "Infra", color: "#047857", bg: "#D1FAE5", Icon: Database },
    { name: "World Bank WGI", full: "Worldwide Governance Indicators", url: "https://databank.worldbank.org/source/worldwide-governance-indicators", dim: "Infra", color: "#047857", bg: "#D1FAE5", Icon: Database },
    { name: "GSMA", full: "Mobile Connectivity Index", url: "https://www.mobileconnectivityindex.com/", dim: "Infra", color: "#047857", bg: "#D1FAE5", Icon: Database },
  ];

  return (
    <main className="min-h-screen bg-white pb-16">
      {/* ─── HERO ─── */}
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-[520px] overflow-hidden rounded-[32px] p-8 text-white lg:p-10"
        >
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=85"
            alt="Voyageur consultant une destination"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-slate-950/40 to-slate-950/12" />
          <div className="relative z-10 flex min-h-[440px] flex-col justify-end">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Méthodologie Lokascore</span>
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-tight">
              Un Nutri-Score du voyage international, en temps réel.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
              Un seul chiffre <strong>0-100</strong> qui agrège <strong>16 sources officielles internationales</strong>
              {' '}(sécurité, santé, catastrophes, infrastructure). Adapté à votre profil de voyage.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/destination-count")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold"
                style={{ color: "var(--lokadia-primary)" }}
              >
                Vérifier une destination <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-bold text-white backdrop-blur"
              >
                Choisir mon profil voyage
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {/* Échelle 5-tiers */}
          <div className="rounded-[32px] bg-white p-6" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-lg)" }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
                  Lecture immédiate
                </p>
                <h2 className="mt-1 text-2xl font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
                  Échelle Lokascore
                </h2>
              </div>
              <div className="rounded-2xl px-4 py-3 text-right" style={{ background: "var(--lokadia-info-bg)" }}>
                <p className="text-4xl font-bold" style={{ color: "var(--lokadia-primary)" }}>
                  0-100
                </p>
                <p className="text-xs font-bold" style={{ color: "var(--lokadia-gray-600)" }}>
                  score
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              {LOKASCORE_LEVELS_ORDER.map((tier) => (
                <div key={tier.level} className="rounded-2xl border p-3" style={{ borderColor: "var(--lokadia-gray-100)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold flex items-center gap-2" style={{ color: tier.color }}>
                      <tier.Icon className="h-4 w-4" style={{ color: tier.color }} />
                      {tier.label}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white tabular-nums" style={{ background: tier.fillColor }}>
                      {tier.min}-{tier.max}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Zap, title: "Temps réel", desc: "Mise à jour continue" },
              { icon: Globe, title: "Sources", desc: "16 officielles" },
              { icon: CheckCircle2, title: "Profils", desc: "9 types voyage" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
                  <Icon className="mb-4 h-6 w-6" style={{ color: "var(--lokadia-primary)" }} />
                  <p className="font-bold" style={{ color: "var(--lokadia-gray-900)" }}>{item.title}</p>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4 DIMENSIONS (sans poids visibles) ─── */}
      <section className="mx-auto mt-10 max-w-7xl px-5 lg:px-0">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
          Architecture
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
          Les 4 dimensions du Lokascore
        </h2>
        <p className="mt-2 text-sm max-w-3xl" style={{ color: "var(--lokadia-gray-600)" }}>
          Le score final agrège ces quatre indices à partir de sources officielles vérifiables. L'algorithme
          de pondération est propriétaire et adapté à chaque profil de voyage.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {dimensions.map((dim) => {
            const Icon = dim.Icon;
            return (
              <div
                key={dim.meta.id}
                className="rounded-3xl bg-white p-5"
                style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${dim.meta.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: dim.meta.color }} />
                  </span>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
                      {dim.meta.label}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: dim.meta.color }}>
                      Sources officielles
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--lokadia-gray-700)" }}>
                  {dim.detail}
                </p>
                <p className="text-[11px] font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                  {dim.sources}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── PROPRIÉTÉ INTELLECTUELLE — remplace l'ancienne formule ─── */}
      <section className="mx-auto mt-10 max-w-7xl px-5 lg:px-0">
        <div
          className="rounded-[32px] p-6 lg:p-8"
          style={{ background: "var(--gradient-primary)", color: "white" }}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Lock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                Algorithme propriétaire
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
                Méthodologie déposée à l'INPI
              </h2>
              <p className="mt-3 text-sm leading-relaxed opacity-95 max-w-3xl">
                La formule exacte de calcul, les pondérations sectorielles, la matrice de modulation par profil
                de voyage et les algorithmes de normalisation sont des <strong>secrets de fabrique</strong> de
                Lokadia. Ils sont protégés par un dépôt e-Soleau INPI ainsi que par des mécanismes
                contractuels de cession de droits.
              </p>
              <p className="mt-3 text-xs leading-relaxed opacity-80 max-w-3xl">
                Les <strong>sources publiques</strong> que nous agrégeons restent évidemment vérifiables ci-dessous —
                c'est l'agrégation, la pondération et la modulation contextuelle qui constituent la valeur
                ajoutée propriétaire de Lokadia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PIPELINE conceptuel ─── */}
      <section className="mx-auto mt-10 grid max-w-7xl gap-6 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:px-0">
        <div
          className="rounded-[32px] bg-white p-6 lg:p-8"
          style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
            Pipeline
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
            Comment le score est produit
          </h2>
          <div className="mt-6 space-y-4">
            {pipelineSteps.map((step) => (
              <div
                key={step.n}
                className="flex gap-4 rounded-2xl border p-4"
                style={{ borderColor: "var(--lokadia-gray-100)" }}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PROFILS DE VOYAGE (noms seulement, pas les pondérations) ─── */}
        <div
          className="rounded-[32px] bg-white p-6 lg:p-8"
          style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
            Personnalisation
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
            9 profils de voyage
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--lokadia-gray-600)" }}>
            Le calcul du score est adapté au type de voyage que vous préparez.
            <strong> Aucune donnée personnelle n'est demandée</strong> (Privacy by Design, RGPD art. 25).
          </p>

          <div className="mt-5 space-y-2">
            {PROFILE_ORDER.map((id) => {
              const meta = PROFILE_META[id];
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-2xl border p-3"
                  style={{ borderColor: "var(--lokadia-gray-100)" }}
                >
                  <meta.Icon className="h-5 w-5 flex-shrink-0" style={{ color: meta.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
                      {meta.label}
                    </p>
                    <p className="text-[11px] leading-snug" style={{ color: "var(--lokadia-gray-600)" }}>
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Choisir mon profil de voyage <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─── SOURCES OFFICIELLES (visibles pour la confiance) ─── */}
      <section className="mx-auto mt-10 max-w-7xl px-5 lg:px-0">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
          Sources vérifiables
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
          17 organismes officiels accessibles
        </h2>
        <p className="mt-2 text-sm max-w-3xl" style={{ color: "var(--lokadia-gray-600)" }}>
          Chaque source est librement consultable et vérifiable. Le multi-sourcing systématique est une règle
          d'architecture qui garantit la robustesse du Lokascore en cas d'indisponibilité d'une source.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {officialSources.map((source) => {
            const Icon = source.Icon;
            return (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: "var(--lokadia-gray-100)" }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: source.bg }}>
                    <Icon className="h-4 w-4" style={{ color: source.color }} />
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: "var(--lokadia-gray-900)" }}>
                  {source.name}
                </h3>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: source.color }}>
                  {source.full}
                </p>
                <p className="mt-1.5 text-[10px] font-bold" style={{ color: "var(--lokadia-gray-500)" }}>
                  Catégorie {source.dim}
                </p>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
