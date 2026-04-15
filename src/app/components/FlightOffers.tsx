import { motion } from 'motion/react';
import { Plane, ExternalLink, Zap, Clock } from 'lucide-react';
import { FlightOffer } from '../lib/travelOffers';

interface Props {
  offers: FlightOffer[];
  travelers: number;
}

export function FlightOffers({ offers, travelers }: Props) {
  if (!offers.length) return null;

  return (
    <div className="space-y-3">
      {offers.map((offer, idx) => (
        <motion.a
          key={offer.id}
          href={offer.deeplink}
          target="_blank"
          rel="noopener nofollow sponsored"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06 }}
          whileHover={{ y: -2 }}
          className="block bg-white rounded-2xl overflow-hidden transition-all"
          style={{
            border: '1px solid var(--lokadia-gray-200)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="p-4 flex items-center gap-3">
            {/* Airline logo-ish */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #0F4C81 0%, #134074 100%)' }}
            >
              {offer.airlineCode}
            </div>

            {/* Times + route */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-base" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {offer.departTime}
                </span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--lokadia-gray-300)' }} />
                  <Plane className="h-3 w-3" style={{ color: 'var(--lokadia-gray-400)' }} />
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--lokadia-gray-300)' }} />
                </div>
                <span className="font-bold text-base" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {offer.arriveTime}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--lokadia-gray-600)' }}>
                <span className="font-semibold">{offer.airline}</span>
                <span>·</span>
                <Clock className="h-3 w-3" />
                <span>{offer.duration}</span>
                <span>·</span>
                <span className="font-semibold" style={{ color: offer.stops === 0 ? '#10B981' : 'var(--lokadia-gray-600)' }}>
                  {offer.stops === 0 ? 'Direct' : `${offer.stops} escale`}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg leading-none" style={{ color: 'var(--lokadia-gray-900)' }}>
                {offer.price}€
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--lokadia-gray-500)' }}>
                /pers.
              </p>
            </div>
          </div>

          {/* Footer badge + CTA */}
          <div
            className="px-4 py-2 flex items-center justify-between"
            style={{ background: 'var(--lokadia-gray-50, #F8FAFC)', borderTop: '1px solid var(--lokadia-gray-100)' }}
          >
            <div className="flex items-center gap-2">
              {offer.tag && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: offer.tag === 'Meilleur prix' ? 'rgba(16,185,129,0.12)' : 'rgba(15,76,129,0.08)',
                    color: offer.tag === 'Meilleur prix' ? '#059669' : '#0F4C81',
                  }}
                >
                  {offer.tag === 'Meilleur prix' && <Zap className="h-2.5 w-2.5" />}
                  {offer.tag}
                </span>
              )}
              <span className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                via Skyscanner
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#0F4C81' }}>
              Voir le vol
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </motion.a>
      ))}
      <p className="text-[11px] text-center" style={{ color: 'var(--lokadia-gray-500)' }}>
        Prix indicatifs pour {travelers} voyageur{travelers > 1 ? 's' : ''} — prix réels actualisés sur Skyscanner.
      </p>
    </div>
  );
}
