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
  Shield,
  Zap,
} from "lucide-react";
import { GOSAFE_METHODOLOGY, SOURCE_HOMEPAGES } from "../lib/officialSources";

export default function GoSafePage() {
  const navigate = useNavigate();

  const sources = [
    {
      name: "Numbeo",
      full: "Crime & Safety Index",
      desc: "Index de sécurité urbain utilisé comme source primaire du score.",
      url: "https://www.numbeo.com/crime/",
      tag: "Source primaire",
      Icon: Database,
      color: "#1E40AF",
      bg: "#DBEAFE",
    },
    {
      name: "France Diplomatie",
      full: "MEAE - Conseils aux voyageurs",
      desc: "Sécurité, santé, formalités et zones à éviter.",
      url: SOURCE_HOMEPAGES.franceDiplomatie,
      tag: "Officiel",
      Icon: Shield,
      color: "#92400E",
      bg: "#FEF3C7",
    },
    {
      name: "OMS",
      full: "Organisation Mondiale de la Santé",
      desc: "Recommandations sanitaires, vaccins et alertes épidémies.",
      url: SOURCE_HOMEPAGES.who,
      tag: "Officiel",
      Icon: Heart,
      color: "#6D28D9",
      bg: "#EDE9FE",
    },
    {
      name: "GDACS",
      full: "Global Disaster Alert - Nations Unies",
      desc: "Séismes, cyclones, tsunamis et inondations en temps réel.",
      url: SOURCE_HOMEPAGES.gdacs,
      tag: "Officiel",
      Icon: AlertTriangle,
      color: "#991B1B",
      bg: "#FEE2E2",
    },
    {
      name: "OSAC",
      full: "US Department of State",
      desc: "Rapports de sécurité par pays.",
      url: SOURCE_HOMEPAGES.osac,
      tag: "Officiel",
      Icon: Shield,
      color: "#0F4C81",
      bg: "#DBEAFE",
    },
    {
      name: "CDC Travel Health",
      full: "Centers for Disease Control",
      desc: "Avis sanitaires par destination.",
      url: SOURCE_HOMEPAGES.cdc,
      tag: "Officiel",
      Icon: Heart,
      color: "#047857",
      bg: "#D1FAE5",
    },
  ];

  const steps = [
    {
      n: "1",
      title: "Récupération du Crime Index Numbeo",
      desc: "Lokadia s'appuie sur le Crime & Safety Index Numbeo pour obtenir une base de comparaison ville par ville.",
      link: { label: "Méthodologie Numbeo", url: GOSAFE_METHODOLOGY.primarySource.methodology },
    },
    {
      n: "2",
      title: "Conversion en GoSafe Score",
      desc: `Le résultat est présenté sur une échelle lisible ${GOSAFE_METHODOLOGY.scoreRange}, pensée pour être comprise en quelques secondes.`,
    },
    {
      n: "3",
      title: "Mise à jour automatique",
      desc: `Les scores sont rafraîchis automatiquement toutes les ${GOSAFE_METHODOLOGY.refreshInterval}.`,
    },
    {
      n: "4",
      title: "Croisement avec les sources officielles",
      desc: "La lecture du score reste accompagnée de liens directs vers les organismes officiels pour vérification.",
    },
  ];

  return (
    <main className="min-h-screen bg-white pb-16">
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
              <Shield className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wide">GoSafe Score</span>
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-tight">
              La sécurité d'une destination, lisible avant de partir.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
              Un score clair, des seuils visibles et des sources officielles accessibles sans chercher dans plusieurs écrans.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/destination-count")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black"
                style={{ color: "var(--lokadia-primary)" }}
              >
                Vérifier une destination <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/alerts")}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-black text-white backdrop-blur"
              >
                Voir les alertes
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <div className="rounded-[32px] bg-white p-6" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-lg)" }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
                  Lecture immédiate
                </p>
                <h2 className="mt-1 text-2xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                  Échelle GoSafe
                </h2>
              </div>
              <div className="rounded-2xl px-4 py-3 text-right" style={{ background: "var(--lokadia-info-bg)" }}>
                <p className="text-4xl font-black" style={{ color: "var(--lokadia-primary)" }}>
                  0-100
                </p>
                <p className="text-xs font-bold" style={{ color: "var(--lokadia-gray-600)" }}>
                  score
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {GOSAFE_METHODOLOGY.thresholds.map((threshold) => (
                <div key={threshold.level} className="rounded-2xl border p-4" style={{ borderColor: "var(--lokadia-gray-100)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-black" style={{ color: threshold.color }}>
                      {threshold.label}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: threshold.color }}>
                      {threshold.min}-{threshold.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full" style={{ width: `${threshold.max}%`, background: threshold.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Zap, title: "Temps réel", desc: GOSAFE_METHODOLOGY.refreshInterval },
              { icon: Globe, title: "Monde", desc: "9 000+ villes" },
              { icon: CheckCircle2, title: "Sources", desc: "Vérifiables" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
                  <Icon className="mb-4 h-6 w-6" style={{ color: "var(--lokadia-primary)" }} />
                  <p className="font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-6 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:px-0">
        <div className="rounded-[32px] bg-white p-6 lg:p-8" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
            Méthode
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
            Comment le score est calculé
          </h2>
          <div className="mt-6 space-y-4">
            {steps.map((step) => (
              <div key={step.n} className="flex gap-4 rounded-2xl border p-4" style={{ borderColor: "var(--lokadia-gray-100)" }}>
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ background: "var(--gradient-primary)" }}>
                  {step.n}
                </div>
                <div>
                  <h3 className="font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
                    {step.desc}
                  </p>
                  {step.link && (
                    <a href={step.link.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-black text-blue-700 hover:underline">
                      {step.link.label} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 lg:p-8" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
            Sources vérifiables
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
            Les organismes officiels restent visibles
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {sources.map((source) => {
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
                  <div className="mb-4 flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: source.bg }}>
                      <Icon className="h-5 w-5" style={{ color: source.color }} />
                    </span>
                    <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                    {source.name}
                  </h3>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-wide" style={{ color: source.color }}>
                    {source.full}
                  </p>
                  <p className="mt-2 text-sm leading-5" style={{ color: "var(--lokadia-gray-600)" }}>
                    {source.desc}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-5 lg:px-0">
        <div className="flex flex-col gap-4 rounded-[32px] p-8 text-white lg:flex-row lg:items-center lg:justify-between" style={{ background: "var(--gradient-primary)" }}>
          <div>
            <h2 className="text-2xl font-black">GoSafe pour les organisations</h2>
            <p className="mt-2 text-sm text-white/90">
              La même donnée peut être intégrée dans un usage professionnel via Lokadia Pro.
            </p>
          </div>
          <button onClick={() => navigate("/pro")} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black" style={{ color: "var(--lokadia-primary)" }}>
            Découvrir Pro <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
