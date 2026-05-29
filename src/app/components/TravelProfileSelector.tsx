/**
 * TravelProfileSelector — sélecteur de profil voyage
 *
 * Affiche les 9 profils (default + 8 thématiques) sous forme de cartes
 * cliquables. Le profil sélectionné module instantanément tous les
 * Lokascore affichés dans l'app via TravelProfileContext.
 *
 * Aucune donnée personnelle n'est collectée (cf. Privacy by Design).
 */
import { Check } from 'lucide-react';
import { useTravelProfile } from '../context/TravelProfileContext';
import { PROFILE_META, PROFILE_ORDER, type TravelProfile } from '../lib/lokascore';

interface TravelProfileSelectorProps {
  /** Affichage compact en grille 2 cols (pour modale) vs liste (pour profil) */
  variant?: 'grid' | 'list';
  /** Callback optionnel quand un profil est sélectionné */
  onSelect?: (profile: TravelProfile) => void;
}

export function TravelProfileSelector({ variant = 'list', onSelect }: TravelProfileSelectorProps) {
  const { profile: current, setProfile } = useTravelProfile();

  const handleClick = (p: TravelProfile) => {
    setProfile(p);
    onSelect?.(p);
  };

  const containerClass =
    variant === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
      : 'space-y-2';

  return (
    <div className={containerClass}>
      {PROFILE_ORDER.map((id) => {
        const meta = PROFILE_META[id];
        const isSelected = current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            className="w-full text-left rounded-2xl border-2 p-3.5 transition-all hover:shadow-md focus:outline-none focus:ring-2"
            style={{
              borderColor: isSelected ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-100)',
              background: isSelected ? 'var(--lokadia-info-bg)' : 'white',
            }}
            aria-pressed={isSelected}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--lokadia-gray-50, #f8fafc)',
                }}
                aria-hidden="true"
              >
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="text-sm font-bold tracking-tight"
                    style={{ color: 'var(--lokadia-gray-900)' }}
                  >
                    {meta.label}
                  </h3>
                  {isSelected && (
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--lokadia-primary)' }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
                  {meta.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Composant compact qui affiche le profil actif avec un bouton "Modifier"
 * (à placer sur la fiche destination).
 */
export function ActiveProfileBadge({ onEdit }: { onEdit?: () => void }) {
  const { profile } = useTravelProfile();
  const meta = PROFILE_META[profile];

  return (
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all hover:shadow-md"
      style={{
        borderColor: 'var(--lokadia-gray-100)',
        background: 'white',
      }}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      <span className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-800)' }}>
        {meta.label}
      </span>
      {onEdit && (
        <span className="text-[10px] font-bold" style={{ color: 'var(--lokadia-primary)' }}>
          Modifier
        </span>
      )}
    </button>
  );
}
