import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Plane,
  Plus,
  Route,
  Trash2,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { deleteTrip, getTripStops, getUserTrips, type Trip, type TripStop } from "../lib/tripService";

interface TripWithStops extends Trip {
  stops: TripStop[];
  checklistProgress: { completed: number; total: number };
}

const headerImages = [
  "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzcyMzQ0MTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NzIzODAzMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyJTIwc3Vuc2V0fGVufDF8fHx8MTc3MjM1MTM2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1639128918430-e5090476e2d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGNpdHklMjBuaWdodCUyMGxpZ2h0c3xlbnwxfHx8fDE3NzI0NTM5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

export default function TripsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trips, setTrips] = useState<TripWithStops[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % headerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadTrips() {
    try {
      if (!user) return;

      const allTrips = await getUserTrips(user.id);
      const enrichedTrips: TripWithStops[] = await Promise.all(
        allTrips.map(async (trip) => ({
          ...trip,
          stops: await getTripStops(trip.id),
          checklistProgress: { completed: 0, total: 0 },
        }))
      );

      setTrips(enrichedTrips);
    } catch (error) {
      console.error("Erreur chargement voyages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(tripId: string, tripName: string, event: MouseEvent) {
    event.stopPropagation();

    if (!confirm(`Voulez-vous vraiment supprimer le voyage "${tripName}" ?\n\nCette action est irreversible.`)) {
      return;
    }

    try {
      await deleteTrip(tripId);
      await loadTrips();
    } catch (error) {
      console.error("Erreur suppression voyage:", error);
      alert("Erreur lors de la suppression du voyage");
    }
  }

  function getActualStatus(trip: Trip): "planned" | "active" | "completed" {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (now > end) return "completed";
    if (now >= start && now <= end) return "active";
    return "planned";
  }

  const upcomingTrips = useMemo(
    () => trips.filter((trip) => ["planned", "active"].includes(getActualStatus(trip))),
    [trips]
  );
  const pastTrips = useMemo(
    () => trips.filter((trip) => getActualStatus(trip) === "completed"),
    [trips]
  );
  const displayTrips = activeTab === "upcoming" ? upcomingTrips : pastTrips;

  useEffect(() => {
    if (!displayTrips.length) {
      setSelectedTripId(null);
      return;
    }

    if (!selectedTripId || !displayTrips.some((trip) => trip.id === selectedTripId)) {
      setSelectedTripId(displayTrips[0].id);
    }
  }, [activeTab, displayTrips, selectedTripId]);

  const selectedTrip = displayTrips.find((trip) => trip.id === selectedTripId) ?? displayTrips[0];

  function getTripStatus(trip: Trip) {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (now >= start && now <= end) {
      return {
        label: "En cours",
        color: "var(--lokadia-warning)",
        bgColor: "var(--lokadia-warning-bg)",
        icon: <Plane size={14} className="animate-pulse" />,
      };
    }

    if (now < start) {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        label: `Dans ${days}j`,
        color: "var(--lokadia-primary)",
        bgColor: "var(--lokadia-info-bg)",
        icon: <Clock size={14} />,
      };
    }

    return {
      label: "Termine",
      color: "var(--lokadia-gray-500)",
      bgColor: "var(--lokadia-gray-100)",
      icon: <Trophy size={14} />,
    };
  }

  function formatDateRange(start: string, end: string) {
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
    return `${new Date(start).toLocaleDateString("fr-FR", options)} - ${new Date(end).toLocaleDateString("fr-FR", options)}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--lokadia-background)" }}>
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div
            className="mx-auto mb-4 h-16 w-16 rounded-full"
            style={{ border: "3px solid var(--lokadia-primary)", borderTopColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-medium" style={{ color: "var(--lokadia-gray-600)" }}>
            Chargement de vos voyages...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 lg:pb-10" style={{ background: "var(--lokadia-background)" }}>
      <section className="relative overflow-hidden text-white lg:mx-auto lg:mt-6 lg:max-w-7xl lg:rounded-[32px]">
        {headerImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0"
            style={{ backgroundImage: `url(${image})`, backgroundPosition: "center", backgroundSize: "cover" }}
            animate={{ opacity: index === currentSlide ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/45 to-slate-950/10" />
        <div className="relative z-10 px-5 py-8 lg:flex lg:min-h-[280px] lg:items-end lg:justify-between lg:px-10 lg:py-10">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
              Voyages
            </p>
            <h1 className="text-3xl font-black tracking-tight lg:text-5xl">Mes voyages</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 lg:text-base">
              Une vue bureau pour consulter la liste, garder le détail ouvert et reprendre la préparation sans changer constamment d'écran.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0">
            <button
              onClick={() => navigate("/trips/map-planner")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{ color: "var(--lokadia-primary)" }}
            >
              <Route className="h-4 w-4" />
              Planifier un itinéraire
            </button>
            <button
              onClick={() => navigate("/trips/create")}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" />
              Créer un voyage
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-5 lg:px-0 lg:pt-6">
        <div className="inline-flex gap-1 rounded-2xl p-1" style={{ background: "var(--lokadia-gray-100)" }}>
          {[
            { id: "upcoming", label: "A venir", count: upcomingTrips.length },
            { id: "past", label: "Passés", count: pastTrips.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "upcoming" | "past")}
              className="rounded-xl px-5 py-2 text-sm font-black transition-all"
              style={{
                background: activeTab === tab.id ? "white" : "transparent",
                color: activeTab === tab.id ? "var(--lokadia-primary)" : "var(--lokadia-gray-600)",
                boxShadow: activeTab === tab.id ? "var(--shadow-sm)" : "none",
              }}
            >
              {tab.label}
              <span className="ml-2 rounded-full px-2 py-0.5 text-[11px]" style={{ background: "var(--lokadia-info-bg)" }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {displayTrips.length === 0 ? (
        <section className="mx-auto max-w-4xl px-5 py-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: "var(--gradient-primary)" }}>
            <Plane className="h-9 w-9 text-white" />
          </div>
          <h2 className="text-3xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
            {activeTab === "upcoming" ? "Aucun voyage prévu" : "Aucun voyage passé"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
            {activeTab === "upcoming"
              ? "Créez votre premier voyage pour retrouver ici votre préparation, vos étapes et vos informations utiles."
              : "Vos voyages terminés apparaîtront ici."}
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <button
              onClick={() => navigate("/trips/create")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" />
              Créer un voyage
            </button>
            <button
              onClick={() => navigate("/trips/map-planner")}
              className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-bold"
              style={{ borderColor: "var(--lokadia-gray-200)", color: "var(--lokadia-primary)" }}
            >
              <Route className="h-4 w-4" />
              Planifier un itinéraire
            </button>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-5 py-6 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-6 lg:px-0">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-3">
              {displayTrips.map((trip) => {
                const status = getTripStatus(trip);
                const selected = selectedTrip?.id === trip.id;
                return (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id)}
                    className="group w-full rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      borderColor: selected ? "var(--lokadia-primary)" : "var(--lokadia-gray-100)",
                      boxShadow: selected ? "var(--shadow-md)" : "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                          {trip.destinationName}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "var(--lokadia-gray-400)" }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase" style={{ background: status.bgColor, color: status.color }}>
                        {status.icon}
                        {status.label}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--lokadia-gray-500)" }}>
                        {trip.stops.length} étape{trip.stops.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="hidden lg:block">
            {selectedTrip && (
              <div className="overflow-hidden rounded-[28px] bg-white" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
                <div className="relative min-h-[260px] p-8 text-white">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${headerImages[currentSlide]})` }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/10" />
                  <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
                          Détail du voyage
                        </p>
                        <h2 className="text-4xl font-black tracking-tight">{selectedTrip.destinationName}</h2>
                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/90">
                          <Calendar className="h-4 w-4" />
                          {formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}
                        </p>
                      </div>
                      <button
                        onClick={(event) => handleDeleteTrip(selectedTrip.id, selectedTrip.destinationName, event)}
                        className="rounded-full bg-white/15 p-3 backdrop-blur transition-colors hover:bg-red-500"
                        title="Supprimer le voyage"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/trips/${selectedTrip.id}`)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black"
                        style={{ color: "var(--lokadia-primary)" }}
                      >
                        Ouvrir le voyage <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/trips/${selectedTrip.id}/edit`)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1.4fr_0.8fr] gap-6 p-6">
                  <div>
                    <h3 className="text-lg font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                      Étapes
                    </h3>
                    <div className="mt-4 space-y-3">
                      {selectedTrip.stops.length > 0 ? (
                        selectedTrip.stops.map((stop, index) => (
                          <div key={stop.id} className="flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--lokadia-gray-100)" }}>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: "var(--gradient-primary)" }}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                                {stop.destinationName}
                              </p>
                              <p className="text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                                Étape du séjour
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed p-6 text-sm" style={{ borderColor: "var(--lokadia-gray-200)", color: "var(--lokadia-gray-600)" }}>
                          Aucune étape renseignée pour ce voyage.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl p-5" style={{ background: "var(--lokadia-info-bg)" }}>
                      <p className="text-sm font-black" style={{ color: "var(--lokadia-primary)" }}>
                        Préparation
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6" style={{ color: "var(--lokadia-success)" }} />
                        <div>
                          <p className="text-2xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                            {selectedTrip.checklistProgress.completed}/{selectedTrip.checklistProgress.total}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: "var(--lokadia-gray-600)" }}>
                            éléments validés
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/trips/create")}
                      className="w-full rounded-2xl border border-dashed bg-white p-5 text-left transition-all hover:shadow-md"
                      style={{ borderColor: "var(--lokadia-primary)" }}
                    >
                      <Plus className="mb-3 h-5 w-5" style={{ color: "var(--lokadia-primary)" }} />
                      <p className="font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                        Créer un autre voyage
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--lokadia-gray-600)" }}>
                        Démarrer une nouvelle préparation.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 lg:hidden">
            {displayTrips.map((trip, index) => {
              const status = getTripStatus(trip);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative"
                >
                  <button
                    onClick={(event) => handleDeleteTrip(trip.id, trip.destinationName, event)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "rgba(239, 68, 68, 0.08)" }}
                    title="Supprimer le voyage"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: "#EF4444" }} />
                  </button>
                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="w-full rounded-2xl border bg-white p-4 text-left"
                    style={{ borderColor: "var(--lokadia-gray-200)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <h3 className="pr-10 text-base font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                      {trip.destinationName}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase" style={{ background: status.bgColor, color: status.color }}>
                        {status.icon}
                        {status.label}
                      </span>
                      <ChevronRight className="h-4 w-4" style={{ color: "var(--lokadia-gray-400)" }} />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
