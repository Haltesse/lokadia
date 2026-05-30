import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Mail,
  Plane,
  Shield,
} from "lucide-react";
import { registerLandingSignup } from "../lib/landingSignupService";

export default function ProPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectedOffer, setSelectedOffer] = useState("Assureurs (API white-label)");

  const offers = [
    {
      id: "univ",
      icon: GraduationCap,
      title: "Écoles & universités",
      price: "500 - 2 000 €",
      unit: "/an",
      features: [
        "Suivi des étudiants en mobilité Erasmus",
        "Alertes groupe automatiques par pays",
        "Dashboard responsable relations internationales",
        "Export reporting conformité devoir de protection",
      ],
      color: "#0A84FF",
      bg: "rgba(10, 132, 255, 0.08)",
    },
    {
      id: "ngo",
      icon: Heart,
      title: "ONG & humanitaires",
      price: "1 500 - 4 000 €",
      unit: "/an",
      features: [
        "Gestion missions terrain",
        "Alertes sécurité équipes expatriées",
        "Historique incidents et analyse",
        "Support dédié 7j/7",
      ],
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.08)",
    },
    {
      id: "insurer",
      icon: Building2,
      title: "Assureurs (API white-label)",
      price: "5 000 - 20 000 €",
      unit: "/an",
      features: [
        "API Lokascore intégrée à votre espace client",
        "Tarification ajustée en fonction du risque pays",
        "Branding personnalisé",
        "SLA 99,9 %",
      ],
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.08)",
      featured: true,
    },
    {
      id: "airline",
      icon: Plane,
      title: "Compagnies aériennes",
      price: "8 000 - 25 000 €",
      unit: "/an",
      features: [
        "Notifications Lokascore dans l'app passager",
        "Information destination pré-vol",
        "Intégration aux alertes opérationnelles",
        "Co-branding",
      ],
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.08)",
    },
    {
      id: "mice",
      icon: Briefcase,
      title: "MICE & voyages affaires",
      price: "2 000 - 6 000 €",
      unit: "/an",
      features: [
        "Gestion risque groupes séminaires",
        "Conformité obligation employeur (art. L4121-1)",
        "Alertes temps réel déplacement collaborateurs",
        "Tableau de bord RH",
      ],
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.08)",
    },
  ];

  const activeOffer = offers.find((offer) => offer.title === selectedOffer) ?? offers[0];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    const res = await registerLandingSignup(email, `pro-${company || "unknown"}`);
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-0">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[28px] bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                  Lokadia Pro
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                  Espace bureau
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {offers.map((offer) => {
                const Icon = offer.icon;
                const selected = selectedOffer === offer.title;
                return (
                  <button
                    key={offer.title}
                    onClick={() => setSelectedOffer(offer.title)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold transition-all hover:shadow-md"
                    style={{
                      background: selected ? offer.bg : "transparent",
                      color: selected ? offer.color : "var(--lokadia-gray-700)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="min-w-0 flex-1 truncate">{offer.title}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl p-4" style={{ background: "var(--lokadia-info-bg)" }}>
              <Shield className="mb-3 h-5 w-5" style={{ color: "var(--lokadia-primary)" }} />
              <p className="text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                Devoir de protection
              </p>
              <p className="mt-1 text-xs leading-5" style={{ color: "var(--lokadia-gray-600)" }}>
                Conformité art. L4121-1 pour les déplacements professionnels.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[32px] p-8 text-white lg:p-10">
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=85"
              alt="Équipe professionnelle en déplacement"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/84 via-slate-950/48 to-slate-950/10" />
            <div className="relative z-10 max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wide">B2B</span>
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight lg:text-6xl">
                Pilotez le risque voyage comme un back-office.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 lg:text-lg">
                Les offres Pro existantes, réorganisées pour un usage ordinateur : navigation latérale, détail plein écran et prise de contact toujours visible.
              </p>
              <button
                onClick={() => navigate(`/pro/demo?offer=${activeOffer.id}`)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ color: "var(--lokadia-primary)" }}
              >
                <LayoutDashboard className="h-4 w-4" /> Voir la démo du tableau de bord Pro
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  { label: "Offres", value: offers.length },
                  { label: "Réponse", value: "48h" },
                  { label: "Usage", value: "B2B" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs font-semibold text-white/75">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-[28px] bg-white p-6" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide" style={{ color: activeOffer.color }}>
                    Offre sélectionnée
                  </p>
                  <h2 className="mt-1 text-3xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                    {activeOffer.title}
                  </h2>
                </div>
                <div className="rounded-2xl px-4 py-3 text-right" style={{ background: activeOffer.bg }}>
                  <p className="text-2xl font-black" style={{ color: activeOffer.color }}>
                    {activeOffer.price}
                  </p>
                  <p className="text-xs font-bold" style={{ color: "var(--lokadia-gray-500)" }}>
                    {activeOffer.unit}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {activeOffer.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--lokadia-gray-100)" }}>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: activeOffer.color }} />
                    <p className="text-sm font-semibold leading-6" style={{ color: "var(--lokadia-gray-700)" }}>
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              {/* Démo dédiée à l'offre sélectionnée */}
              <button
                onClick={() => navigate(`/pro/demo?offer=${activeOffer.id}`)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-transform hover:-translate-y-0.5"
                style={{ background: activeOffer.color }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Voir la démo « {activeOffer.title} »
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-6 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--lokadia-gray-100)" }}>
                <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-wide" style={{ color: "var(--lokadia-gray-500)" }}>
                  <span>Segment</span>
                  <span>Budget</span>
                  <span>Statut</span>
                </div>
                {offers.map((offer) => (
                  <button
                    key={offer.title}
                    onClick={() => setSelectedOffer(offer.title)}
                    className="grid w-full grid-cols-[1.2fr_0.8fr_0.8fr] items-center border-t px-4 py-4 text-left text-sm transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--lokadia-gray-100)" }}
                  >
                    <span className="font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                      {offer.title}
                    </span>
                    <span className="font-semibold" style={{ color: "var(--lokadia-gray-600)" }}>
                      {offer.price}
                    </span>
                    <span className="w-fit rounded-full px-2.5 py-1 text-xs font-black" style={{ background: offer.bg, color: offer.color }}>
                      {offer.featured ? "Demandé" : "Disponible"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] bg-white p-6" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                    Parlons de votre besoin
                  </h2>
                  <p className="text-sm" style={{ color: "var(--lokadia-gray-600)" }}>
                    Réponse sous 48 h ouvrées
                  </p>
                </div>
              </div>

              {status === "success" ? (
                <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10" />
                  <p className="text-lg font-black">Demande reçue, merci !</p>
                  <p className="mt-1 text-sm">Nous vous recontactons sous 48 h ouvrées.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-black" style={{ color: "var(--lokadia-gray-700)" }}>
                      Organisation
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="Université, assureur, compagnie..."
                      className="w-full rounded-2xl px-4 py-3 outline-none"
                      style={{ border: "1px solid var(--lokadia-gray-200)" }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black" style={{ color: "var(--lokadia-gray-700)" }}>
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="prenom.nom@organisation.fr"
                      className="w-full rounded-2xl px-4 py-3 outline-none"
                      style={{ border: "1px solid var(--lokadia-gray-200)" }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {status === "loading" ? "Envoi..." : "Être recontacté"}
                    {status !== "loading" && <ArrowRight className="h-4 w-4" />}
                  </button>
                  {status === "error" && <p className="text-sm font-semibold text-red-600">Erreur, réessaie dans un instant.</p>}
                  <button
                    type="button"
                    onClick={() => navigate(`/pro/demo?offer=${activeOffer.id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-4 text-sm font-black"
                    style={{ borderColor: "var(--lokadia-primary)", color: "var(--lokadia-primary)" }}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Explorer la démo « {activeOffer.title} »
                  </button>
                </form>
              )}
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
