import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

/**
 * Bandeau d'information sur le stockage local.
 *
 * Pourquoi ce n'est **pas** une bannière de consentement : Lokadia ne
 * dépose aucun cookie de mesure d'audience, aucun traceur publicitaire et
 * aucun cookie tiers. Le seul stockage utilisé est strictement nécessaire
 * au service demandé (session, préférences, cache hors connexion), cas
 * expressément exempté de consentement par l'article 82 de la loi
 * Informatique et Libertés.
 *
 * Afficher un faux « Accepter / Refuser » alors qu'il n'y a rien à
 * refuser serait du théâtre : on informe, on documente précisément, et on
 * donne un bouton d'effacement réel dans la politique de confidentialité.
 * L'obligation d'information, elle, reste due — c'est ce bandeau.
 *
 * Le jour où un outil de mesure d'audience serait ajouté, ce composant
 * devra être remplacé par un vrai recueil de consentement préalable.
 */

const ACK_KEY = 'lokadia_storage_notice_ack';

export function StorageNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ACK_KEY)) setVisible(true);
    } catch {
      // Stockage indisponible (navigation privée stricte) : sans stockage,
      // il n'y a rien à annoncer.
    }
  }, []);

  if (!visible) return null;

  const acknowledge = () => {
    try {
      // Date conservée : elle trace quand l'information a été donnée.
      localStorage.setItem(ACK_KEY, new Date().toISOString());
    } catch {
      /* rien à faire : le bandeau réapparaîtra */
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Information sur le stockage local"
      className="fixed inset-x-3 bottom-20 z-[1100] mx-auto max-w-2xl rounded-2xl p-4 md:bottom-4"
      style={{
        background: 'var(--lokadia-surface)',
        border: '1px solid var(--lokadia-gray-200)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--lokadia-primary)' }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
            <strong>Aucun traceur ici.</strong> Pas de mesure d'audience, pas de
            publicité, aucun cookie tiers. Lokadia n'enregistre sur votre appareil que
            ce qui fait fonctionner le service : votre session, vos préférences et les
            données consultées, pour rester lisibles hors connexion.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={acknowledge}
              className="lk-btn rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              J'ai compris
            </button>
            <Link
              to="/confidentialite"
              onClick={acknowledge}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--lokadia-primary)' }}
            >
              Voir le détail et tout effacer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
