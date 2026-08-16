import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { LEGAL, LOCAL_STORAGE_FAMILIES, clearLocalData } from '../data/legal';
import { LegalField, LegalList, LegalPage, LegalSection } from '../components/LegalPage';

/**
 * Politique de confidentialité.
 *
 * Elle décrit ce que le code fait réellement — les familles de clés de
 * stockage local sont celles de `data/legal.ts`, tenues à jour avec
 * l'application — et pas un texte générique recopié.
 */
export default function PrivacyScreen() {
  const [cleared, setCleared] = useState<number | null>(null);

  return (
    <LegalPage
      title="Politique de confidentialité"
      intro={
        <p>
          Lokadia collecte le minimum nécessaire à son fonctionnement. Pas de mesure
          d'audience, pas de traceur publicitaire, aucune revente de données. Cette page
          décrit précisément ce qui est traité, pourquoi, et pendant combien de temps.
        </p>
      }
    >
      <LegalSection title="Responsable du traitement">
        <p>
          <LegalField value={LEGAL.publisher.name} label="Raison sociale" />, dont les
          coordonnées figurent dans les{' '}
          <Link
            to="/mentions-legales"
            className="underline"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            mentions légales
          </Link>
          . Pour toute question ou pour exercer vos droits :{' '}
          <LegalField value={LEGAL.contact.email} label="Adresse de contact" />
          {LEGAL.contact.dpo ? ` — délégué à la protection des données : ${LEGAL.contact.dpo}` : null}
          .
        </p>
      </LegalSection>

      <LegalSection title="Données traitées, finalités et durées">
        <LegalList
          items={[
            <>
              <strong>Compte utilisateur</strong> — adresse e-mail et mot de passe (haché
              par le service d'authentification, jamais lisible par Lokadia). Finalité :
              vous permettre de retrouver vos voyages sur tous vos appareils. Base
              légale : exécution du contrat. Durée : jusqu'à la suppression du compte.
            </>,
            <>
              <strong>Voyages, étapes, favoris et checklists synchronisés</strong> —
              contenus que vous créez. Finalité : fournir le service. Base légale :
              exécution du contrat. Durée : jusqu'à leur suppression ou celle du compte.
              L'accès est cloisonné par des règles de sécurité au niveau de la base :
              un compte ne peut lire que ses propres enregistrements.
            </>,
            <>
              <strong>Préférences d'affichage</strong> — langue, devise, profil de
              voyage. Conservées <em>sur votre appareil</em>, jamais envoyées à un
              serveur. Base légale : intérêt légitime (fonctionnement de l'interface).
            </>,
            <>
              <strong>Cache hors connexion</strong> — derniers Lokascore, alertes,
              formalités et météo consultés, avec leur date de capture. Conservé sur
              votre appareil, purgé automatiquement au bout de 30 jours. Finalité :
              rester utilisable sans réseau, contrainte centrale du produit.
            </>,
            <>
              <strong>Position géographique</strong> — l'application grand public ne
              demande jamais votre position. Elle n'est sollicitée que dans le cadre
              professionnel, sur la page de check-in de sécurité, à chaque fois de façon
              explicite et facultative : le check-in reste possible sans transmettre de
              position.
            </>,
            <>
              <strong>Notifications</strong> — si vous les activez, un identifiant
              d'abonnement fourni par votre navigateur est enregistré. Les notifications
              envoyées ne contiennent <em>aucun contenu</em> : elles réveillent
              l'application, qui va chercher le message sur nos serveurs. Rien de
              sensible ne transite donc par les services de notification de Google ou
              d'Apple. Durée : jusqu'à désactivation.
            </>,
            <>
              <strong>Demandes de contact professionnel</strong> — si vous sollicitez une
              démonstration de l'offre entreprise, les coordonnées que vous saisissez
              sont conservées le temps de traiter la demande, puis trois ans au plus au
              titre de la prospection.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Ce que Lokadia ne fait pas">
        <LegalList
          items={[
            "Aucun outil de mesure d'audience, aucun pixel publicitaire, aucun réseau social embarqué.",
            "Aucune revente ni partage commercial de données personnelles.",
            "Aucun profilage publicitaire : le profil de voyage sert uniquement à moduler la lecture du score, et reste sur votre appareil.",
            "Aucune donnée personnelle dans les adresses des pages, ni dans les journaux techniques.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Sous-traitants et transferts">
        <p>
          Les données de compte et de voyage sont hébergées chez Supabase (base de
          données et authentification) ; le site est distribué par Vercel. Ces
          prestataires agissent comme sous-traitants, sur instruction, et n'exploitent
          pas les données pour leur compte.
        </p>
        <p>
          Certains de ces prestataires sont établis hors de l'Union européenne. Les
          transferts éventuels s'appuient sur les clauses contractuelles types de la
          Commission européenne. La région exacte d'hébergement des données est indiquée
          dans les mentions légales dès qu'elle est confirmée.
        </p>
        <p>
          Lorsque vous cliquez sur une offre partenaire, vous quittez Lokadia : c'est
          alors la politique de confidentialité du partenaire qui s'applique. Aucune
          donnée de compte ne lui est transmise par Lokadia.
        </p>
      </LegalSection>

      <LegalSection title="Cookies et stockage local">
        <p>
          Lokadia <strong>ne dépose aucun cookie de mesure d'audience ni de
          publicité</strong>, et aucun cookie tiers. Le service utilise uniquement le
          stockage local de votre navigateur, pour des finalités strictement nécessaires
          au fonctionnement demandé — ce qui, au sens de l'article 82 de la loi
          Informatique et Libertés, n'est pas soumis au recueil du consentement. C'est
          la raison pour laquelle aucune bannière ne vous demande d'« accepter les
          cookies » : il n'y a rien à accepter.
        </p>

        <div className="mt-4 space-y-3">
          {LOCAL_STORAGE_FAMILIES.map((family) => (
            <div
              key={family.prefix}
              className="rounded-2xl border p-4"
              style={{ borderColor: 'var(--lokadia-gray-100)', background: 'white' }}
            >
              <p
                className="break-words font-mono text-xs font-bold"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                {family.prefix}
              </p>
              <p className="mt-1.5 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
                {family.purpose}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                Conservation : {family.retention}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-4 rounded-2xl p-4"
          style={{ background: 'var(--lokadia-info-bg)', border: '1px solid var(--lokadia-gray-100)' }}
        >
          <p className="text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
            Vous pouvez effacer immédiatement tout ce que Lokadia a enregistré sur cet
            appareil. Cela vous déconnecte et supprime le cache hors connexion ; vos
            voyages enregistrés sur votre compte, eux, ne sont pas affectés.
          </p>
          <button
            type="button"
            onClick={() => setCleared(clearLocalData())}
            className="lk-btn mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            <Trash2 size={16} />
            Effacer les données de cet appareil
          </button>
          {cleared !== null && (
            <p
              className="mt-2 text-sm font-semibold"
              role="status"
              style={{ color: 'var(--lokadia-success)' }}
            >
              {cleared} élément{cleared > 1 ? 's' : ''} effacé{cleared > 1 ? 's' : ''}.
            </p>
          )}
        </div>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation
          et d'opposition, ainsi que d'un droit à la portabilité de vos données. Ces
          droits s'exercent auprès de{' '}
          <LegalField value={LEGAL.contact.email} label="Adresse de contact" /> ; une
          réponse vous est apportée dans un délai d'un mois.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir la Commission nationale
          de l'informatique et des libertés —{' '}
          <a
            href="https://www.cnil.fr/fr/plaintes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            cnil.fr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Les échanges sont chiffrés (HTTPS strict), l'accès aux données est cloisonné
          par compte et par organisation au niveau de la base, les clés d'accès
          privilégiées ne sont jamais présentes dans le code envoyé au navigateur, et
          les appels aux sources officielles passent par des fonctions serveur. Une
          politique de sécurité de contenu restreint les domaines que la page est
          autorisée à contacter.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
