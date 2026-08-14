import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowLeft, MapPin, TrendingUp, X, Globe2 } from "lucide-react";
import { DestinationImage } from "../components/DestinationImage";
import { LokascoreBadge } from "../components/LokascoreBadge";
import { useLokascore } from "../hooks/useLokascore";
import {
  searchDestinations, popularDestinations, type SearchHit,
} from "../lib/destinationSearch";
import type { DestinationDetails } from "../data/types";

/**
 * SearchScreen — exploration des destinations.
 *
 * La version précédente filtrait une liste de 50 pays codée en dur dans ce
 * fichier, avec un simple `includes` : « Japn » ne trouvait rien, et la
 * liste divergeait du catalogue réel. On interroge désormais le catalogue,
 * avec un moteur tolérant aux fautes et des résultats groupés.
 */

function ResultRow({
  destination,
  subtitle,
  onClick,
}: {
  destination: DestinationDetails;
  subtitle: string;
  onClick: () => void;
}) {
  const { score, loading, sources, lastUpdate, fromCache, capturedAt } = useLokascore(destination.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
      style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--lokadia-gray-100)" }}
    >
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
        <DestinationImage
          src={destination.image}
          alt={`${destination.name}, ${destination.country}`}
          cityName={destination.name}
          countryName={destination.country}
          preferWikipedia
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
          {destination.name}
        </p>
        <p className="truncate text-xs" style={{ color: "var(--lokadia-gray-500)" }}>
          {subtitle}
        </p>
      </div>
      <LokascoreBadge
        score={score}
        loading={loading}
        sources={sources}
        lastUpdate={lastUpdate}
        fromCache={fromCache}
        capturedAt={capturedAt}
        variant="chip"
      />
    </button>
  );
}

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchDestinations(query), [query]);
  const popular = useMemo(() => popularDestinations(), []);
  const trimmed = query.trim();

  const open = (id: string) => navigate(`/destination/${id}`);

  const renderGroup = (title: string, hits: SearchHit[], icon: typeof MapPin) => {
    if (hits.length === 0) return null;
    const Icon = icon;
    return (
      <section className="space-y-2">
        <h2
          className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide"
          style={{ color: "var(--lokadia-gray-500)" }}
        >
          <Icon size={13} /> {title} · {hits.length}
        </h2>
        <div className="space-y-2">
          {hits.map((hit) => (
            <ResultRow
              key={`${hit.group}-${hit.destination.id}`}
              destination={hit.destination}
              subtitle={
                hit.group === "country"
                  ? `${hit.destination.country} — via ${hit.destination.name}`
                  : hit.destination.country
              }
              onClick={() => open(hit.destination.id)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--lokadia-background)" }}>
      {/* En-tête + champ de recherche */}
      <div
        className="px-5 pt-6 pb-5 lg:mx-auto lg:mt-6 lg:max-w-4xl lg:rounded-[32px]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-xl font-bold text-white lg:text-3xl">Explorer les destinations</h1>

        <div className="lk-search relative mt-4 flex items-center rounded-2xl bg-white/95 pr-2 shadow-lg">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--lokadia-gray-500)" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ville, pays… (les fautes de frappe sont tolérées)"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Rechercher une destination"
            className="lk-input flex-1 rounded-2xl bg-transparent py-3 pl-11 pr-2 text-sm outline-none"
            style={{ color: "var(--lokadia-gray-900)" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
            >
              <X className="h-4 w-4" style={{ color: "var(--lokadia-gray-500)" }} />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-5 pt-5">
        {/* Champ vide : suggestions */}
        {trimmed.length === 0 && (
          <section className="space-y-2">
            <h2
              className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide"
              style={{ color: "var(--lokadia-gray-500)" }}
            >
              <TrendingUp size={13} /> Destinations populaires
            </h2>
            <div className="space-y-2">
              {popular.map((d) => (
                <ResultRow
                  key={d.id}
                  destination={d}
                  subtitle={d.country}
                  onClick={() => open(d.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Une seule lettre : on le dit plutôt que de tout lister */}
        {trimmed.length === 1 && (
          <p className="px-1 text-sm" style={{ color: "var(--lokadia-gray-500)" }}>
            Saisissez au moins deux lettres pour lancer la recherche.
          </p>
        )}

        {/* Résultats groupés */}
        {trimmed.length >= 2 && results.total > 0 && (
          <>
            {results.hasApproximate && (
              <p
                className="rounded-xl px-3.5 py-2 text-xs"
                style={{ background: "var(--lokadia-info-bg)", color: "var(--lokadia-gray-700)" }}
              >
                Certains résultats correspondent approximativement à « {trimmed} ».
              </p>
            )}
            {renderGroup("Villes", results.cities, MapPin)}
            {renderGroup("Pays", results.countries, Globe2)}
          </>
        )}

        {/* Aucun résultat */}
        {trimmed.length >= 2 && results.total === 0 && (
          <div
            className="rounded-3xl bg-white p-10 text-center"
            style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--lokadia-gray-100)" }}
          >
            <Search className="mx-auto mb-3" size={30} style={{ color: "var(--lokadia-gray-300)" }} />
            <p className="font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
              Aucune destination pour « {trimmed} »
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: "var(--lokadia-gray-500)" }}>
              Essayez le nom d'une grande ville ou d'un pays. Notre catalogue
              s'enrichit régulièrement.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: "var(--lokadia-primary)" }}
            >
              Voir les destinations populaires
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
