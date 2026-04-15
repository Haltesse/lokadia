import { motion } from 'motion/react';
import { Star, ExternalLink, MapPin, Heart } from 'lucide-react';
import { HotelOffer } from '../lib/travelOffers';

interface Props {
  offers: HotelOffer[];
  nights: number;
}

export function HotelOffers({ offers, nights }: Props) {
  if (!offers.length) return null;

  return (
    <div className="space-y-3">
      {offers.map((hotel, idx) => (
        <motion.a
          key={hotel.id}
          href={hotel.deeplink}
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
          <div className="flex gap-3 p-3">
            {/* Image */}
            <div
              className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${hotel.imageUrl})`,
                backgroundColor: 'var(--lokadia-gray-200)',
              }}
            >
              {hotel.tag && (
                <span
                  className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white"
                  style={{ background: 'rgba(0,0,0,0.65)' }}
                >
                  {hotel.tag}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {hotel.name}
                  </p>
                  <Heart className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--lokadia-gray-300)' }} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: `${hotel.color}15`, color: hotel.color }}
                  >
                    {hotel.tier}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                      {hotel.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                    ({hotel.reviewCount} avis)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                  <MapPin className="h-2.5 w-2.5" />
                  <span>Centre-ville · annulation gratuite</span>
                </div>
              </div>

              <div className="flex items-end justify-between mt-1">
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                    {nights} nuit{nights > 1 ? 's' : ''} · total
                  </p>
                  <p className="font-bold text-base leading-none" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {hotel.totalPrice}€
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                    {hotel.pricePerNight}€/nuit
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#F59E0B' }}>
                  Réserver
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </motion.a>
      ))}
      <p className="text-[11px] text-center" style={{ color: 'var(--lokadia-gray-500)' }}>
        Prix indicatifs — tarifs live sur Booking.com
      </p>
    </div>
  );
}
