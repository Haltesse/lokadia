import { Globe2 } from 'lucide-react';
import { useNationality } from '../context/NationalityContext';
import { NATIONALITIES, OTHER_NATIONALITY } from '../data/nationalities';

/**
 * Sélecteur de nationalité.
 *
 * Volontairement accompagné d'une phrase qui dit où va la donnée : demander
 * sa nationalité à quelqu'un sans expliquer pourquoi ni où elle atterrit
 * est le meilleur moyen de ne pas obtenir de réponse — et ce serait
 * contraire à la façon dont le reste du produit traite les données.
 */
export function NationalitySelector({ compact = false }: { compact?: boolean }) {
  const { nationality, setNationality } = useNationality();

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'var(--lokadia-info-bg)',
        border: '1px solid var(--lokadia-gray-100)',
      }}
    >
      <label
        htmlFor="nationality"
        className="flex items-center gap-2 text-sm font-bold"
        style={{ color: 'var(--lokadia-gray-900)' }}
      >
        <Globe2 size={16} style={{ color: 'var(--lokadia-primary)' }} />
        Votre nationalité
      </label>

      <select
        id="nationality"
        value={nationality ?? ''}
        onChange={(event) => setNationality(event.target.value || null)}
        className="mt-2 w-full rounded-xl border px-3 py-2.5 text-sm"
        style={{
          borderColor: 'var(--lokadia-gray-200)',
          background: 'var(--lokadia-surface)',
          color: 'var(--lokadia-gray-900)',
        }}
      >
        <option value="">Non renseignée</option>
        {NATIONALITIES.map((item) => (
          <option key={item.iso2} value={item.iso2}>
            {item.label}
          </option>
        ))}
        <option value={OTHER_NATIONALITY}>Autre nationalité</option>
      </select>

      {!compact && (
        <p className="mt-2 text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
          Elle sert uniquement à afficher les conditions d'entrée qui vous
          concernent. Elle reste sur cet appareil : elle n'est ni envoyée à un
          serveur, ni rattachée à votre compte.
        </p>
      )}
    </div>
  );
}
