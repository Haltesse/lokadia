/**
 * LocalActivitiesSection — affiché dans l'onglet "Pendant" d'un voyage validé.
 *
 * Cartes visuelles (photo + accroche) pour des vibes d'activités à réserver
 * via GetYourGuide / Viator / Tiqets. Chaque carte mène à la page de
 * recherche filtrée du partenaire (ville + thème pré-remplis).
 */
import { Ticket, ExternalLink, Sparkles } from 'lucide-react';
import { getActivityCards } from '../lib/activitySuggestions';

interface Props {
  cityName: string;
}

export function LocalActivitiesSection({ cityName }: Props) {
  const cards = getActivityCards(cityName);

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="px-5 py-4 text-white flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
          <Sparkles size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
            <Ticket size={20} />
            Activités à {cityName}
          </h2>
          <p className="text-xs text-white/85 mt-0.5">
            Visites, billets coupe-file, expériences locales — réserve avant d'arriver
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2">
        {cards.map((card) => (
          <a
            key={card.id}
            href={card.href}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-100 hover:border-gray-300 transition-all active:scale-[0.98]"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-200">
              <img
                src={card.imageUrl}
                alt={card.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {card.badge && (
              <span
                className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white shadow"
                style={{ background: card.providerColor }}
              >
                {card.badge}
              </span>
            )}

            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/95 backdrop-blur text-[9px] font-bold text-gray-700 shadow">
              {card.provider}
            </span>

            <div className="p-2.5">
              <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">
                {card.title}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-1">
                {card.subtitle}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span
                  className="text-[10px] font-bold"
                  style={{ color: card.providerColor }}
                >
                  {card.priceHint}
                </span>
                <ExternalLink size={11} className="text-gray-400" />
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-center text-gray-500">
          Liens partenaires · les billets s'ouvrent sur le site du fournisseur
        </p>
      </div>
    </section>
  );
}
