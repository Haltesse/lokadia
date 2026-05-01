/**
 * PlannerSuggestions — affiché dans le drawer du TripMapPlannerScreen.
 *
 * Pendant la planification, propose à l'utilisateur :
 *   - Hôtels (cartes-photos par vibe : boutique / luxe / appart / auberge)
 *   - Vols (Skyscanner, Google Flights, Kiwi) — liste compacte
 *   - eSIM (Saily, Airalo, Holafly) — liste compacte
 *
 * Les images d'hôtels viennent d'Unsplash, les liens sont destination/dates-aware
 * et s'ouvrent dans un nouvel onglet avec rel="noopener nofollow sponsored".
 */
import { Hotel, Plane, Wifi, ExternalLink, ChevronRight } from 'lucide-react';
import {
  getFlightOptions,
  getEsimOptions,
  type PartnerOption,
} from '../lib/partnerLinks';
import { getHotelCards } from '../lib/hotelSuggestions';

interface Props {
  /** Destination principale (1ʳᵉ étape sélectionnée) */
  city: string;
  country?: string;
  /** Ville/IATA de départ (pour les vols) */
  fromCity?: string;
  fromIata?: string;
  /** Dates */
  startDate?: string;
  endDate?: string;
  /** Nombre de voyageurs */
  travelers: number;
}

export function PlannerSuggestions({
  city,
  country,
  fromCity,
  fromIata,
  startDate,
  endDate,
  travelers,
}: Props) {
  const hotelCards = getHotelCards({
    city,
    country,
    checkIn: startDate,
    checkOut: endDate,
    adults: travelers,
  });

  const flightOptions: PartnerOption[] = startDate
    ? getFlightOptions({
        fromCity,
        fromIata,
        toCity: country ? `${city}, ${country}` : city,
        depart: startDate,
        return: endDate,
        adults: travelers,
      })
    : [];

  const esimOptions: PartnerOption[] = getEsimOptions(country);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Tout ce dont tu as besoin</h3>
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
          Partenaires
        </span>
      </div>

      {/* ────── HÔTELS — cartes visuelles ────── */}
      <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-3.5 py-2.5 flex items-center gap-2.5 border-b border-gray-100">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEF3C7' }}
          >
            <Hotel size={18} style={{ color: '#92400E' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">Où dormir</p>
            <p className="text-[11px] text-gray-500 leading-tight">
              4 vibes, prix négociés en direct
            </p>
          </div>
        </div>

        {/* Cartes hôtels horizontales — équilibre image/texte ergonomique :
            vignette 80×80 lisible, sous-titre conservé pour le contexte,
            badge PROMO bien visible, espacement confortable au touch. */}
        <div className="divide-y divide-gray-100">
          {hotelCards.map((card) => (
            <a
              key={card.id}
              href={card.href}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="group flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {/* Vignette 80×80 — assez grande pour identifier visuellement l'hôtel */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {card.badge && (
                  <span
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white shadow leading-tight"
                    style={{ background: card.providerColor }}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Infos à droite — titre, sous-titre, prix + provider */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-1">
                  {card.title}
                </p>
                <p className="text-[11px] text-gray-500 leading-snug line-clamp-1 mt-0.5">
                  {card.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: card.providerColor }}
                  >
                    {card.priceHint}
                  </span>
                  <span className="text-[10px] text-gray-400">· {card.provider}</span>
                </div>
              </div>

              <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* ────── VOLS — liste compacte ────── */}
      {flightOptions.length > 0 && (
        <CompactSection
          title="Vols"
          subtitle="Comparateurs pour le meilleur prix"
          Icon={Plane}
          bg="#DBEAFE"
          fg="#1E40AF"
          options={flightOptions}
        />
      )}

      {/* ────── eSIM — liste compacte ────── */}
      <CompactSection
        title="Reste connecté · eSIM"
        subtitle="Internet dès l'atterrissage, sans frais"
        Icon={Wifi}
        bg="#EDE9FE"
        fg="#6D28D9"
        options={esimOptions}
      />

      <p className="text-[10px] text-center text-gray-400 px-3">
        Liens partenaires · Lokadia reste 100 % gratuit pour toi.
        Les sites s'ouvrent avec ta destination & tes dates pré-remplies.
      </p>
    </div>
  );
}

// ────── Sous-composant : section compacte (vols, eSIM) ──────
interface CompactSectionProps {
  title: string;
  subtitle: string;
  Icon: typeof Hotel;
  bg: string;
  fg: string;
  options: PartnerOption[];
}

function CompactSection({ title, subtitle, Icon, bg, fg, options }: CompactSectionProps) {
  if (options.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-3.5 py-2.5 flex items-center gap-2.5 border-b border-gray-100">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg }}
        >
          <Icon size={18} style={{ color: fg }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
          <p className="text-[11px] text-gray-500 leading-tight">{subtitle}</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {options.map((opt) => (
          <a
            key={opt.id}
            href={opt.href}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: opt.brandColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold text-gray-900 leading-tight">{opt.name}</p>
                {opt.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: `${opt.brandColor}15`, color: opt.brandColor }}
                  >
                    {opt.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate leading-tight mt-0.5">
                {opt.description}
              </p>
            </div>
            <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
            <ChevronRight size={14} className="text-gray-300 -ml-1 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
