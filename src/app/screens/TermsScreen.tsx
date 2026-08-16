import { Link } from 'react-router-dom';
import { LEGAL } from '../data/legal';
import { LegalField, LegalList, LegalPage, LegalSection } from '../components/LegalPage';

/**
 * Conditions générales d'utilisation.
 *
 * Le cœur du texte est l'article 3 : la portée exacte des informations
 * fournies. C'est là que se joue la responsabilité de Lokadia, et c'est
 * écrit en clair plutôt qu'enfoui dans une clause de non-responsabilité.
 */
export default function TermsScreen() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      intro={
        <p>
          Version {LEGAL.termsVersion}. Ces conditions régissent l'utilisation du site
          et de l'application Lokadia. Les utiliser vaut acceptation.
        </p>
      }
    >
      <LegalSection title="1. Objet du service">
        <p>
          Lokadia est un service d'aide à la préparation de voyage. Il rassemble et met
          en forme des informations publiées par des organismes officiels, autour de
          quatre usages : un niveau de sécurité indicatif par destination (le
          Lokascore), des alertes de sécurité et de santé, les formalités d'entrée, et
          la mise en relation avec des partenaires de réservation.
        </p>
      </LegalSection>

      <LegalSection title="2. Accès au service">
        <p>
          La consultation des destinations, du Lokascore et des alertes est libre et
          gratuite. Certaines fonctions (enregistrer un voyage, construire un
          itinéraire, retrouver ses favoris) nécessitent un compte. Vous êtes
          responsable de la confidentialité de vos identifiants et des actions
          effectuées depuis votre compte.
        </p>
        <p>
          Le service est fourni en l'état, sans garantie de disponibilité continue.
          L'application reste consultable hors connexion pour les données déjà
          chargées : elles sont alors présentées comme telles, avec leur date de
          capture.
        </p>
      </LegalSection>

      <LegalSection title="3. Portée exacte des informations fournies">
        <p>
          Cet article est le plus important. Il définit ce que Lokadia affirme — et ce
          qu'il n'affirme pas.
        </p>
        <LegalList
          items={[
            <>
              <strong>Le Lokascore est indicatif.</strong> C'est un indicateur
              synthétique d'aide à la décision, calculé à partir de publications
              officielles. Ce n'est ni une garantie de sécurité, ni une autorisation de
              départ, ni un avis personnalisé.
            </>,
            <>
              <strong>Les sources officielles priment.</strong> En cas de divergence
              entre une information affichée ici et la publication d'origine (ministère
              des Affaires étrangères, Organisation mondiale de la santé, autorité
              consulaire), c'est la publication d'origine qui fait foi. Le lien vers
              celle-ci est affiché à côté de chaque information.
            </>,
            <>
              <strong>Les formalités d'entrée ne remplacent pas une vérification
              consulaire.</strong> Elles dépendent de votre nationalité, de votre
              itinéraire et de la date du voyage, et peuvent changer sans préavis. Un
              refus d'embarquement ou d'entrée sur un territoire ne saurait engager la
              responsabilité de Lokadia.
            </>,
            <>
              <strong>Les alertes ne sont pas exhaustives ni instantanées.</strong>{' '}
              Elles reprennent ce que les organismes publient, au rythme où ils le
              publient. L'absence d'alerte ne signifie pas l'absence de risque.
            </>,
            <>
              <strong>Les contenus éditoriaux</strong> (bonnes périodes, coûts moyens,
              usages locaux) sont fournis à titre d'orientation et portent leur date de
              consolidation.
            </>,
          ]}
        />
        <p>
          En conséquence, la décision de partir, de rester ou de modifier un voyage vous
          appartient. Lokadia ne peut être tenu responsable des conséquences d'une
          décision de voyage prise sur la seule base des informations affichées.
        </p>
      </LegalSection>

      <LegalSection title="4. Réservation et partenaires">
        <p>
          Lokadia n'est ni une agence de voyages, ni un vendeur de prestations. Les
          offres de vols, d'hébergements, d'activités, d'assurance ou d'e-SIM sont
          proposées par des partenaires identifiés : le contrat se conclut avec eux,
          selon leurs propres conditions, et le paiement s'effectue chez eux.
        </p>
        <p>
          Certains de ces liens sont rémunérés par commission d'affiliation. Ces
          contenus sont signalés comme tels dans l'interface. Cette rémunération ne
          modifie ni le Lokascore, ni les alertes, ni les formalités affichées.
        </p>
      </LegalSection>

      <LegalSection title="5. Vos obligations">
        <LegalList
          items={[
            "Ne pas extraire de manière massive ou automatisée le contenu du service.",
            "Ne pas tenter de contourner les mesures de sécurité ni d'accéder aux données d'autres utilisateurs.",
            "Ne pas publier de contenu illicite via les fonctions collaboratives.",
            "Ne pas présenter les informations de Lokadia comme un avis officiel auprès de tiers.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Propriété intellectuelle">
        <p>
          Les contenus produits par Lokadia (textes éditoriaux, interface, méthodologie
          du Lokascore) sont protégés. Les données officielles reprises restent la
          propriété de leurs émetteurs. Voir les{' '}
          <Link
            to="/mentions-legales"
            className="underline"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            mentions légales
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Données personnelles">
        <p>
          Le détail des traitements, des durées de conservation et de l'exercice de vos
          droits figure dans la{' '}
          <Link
            to="/confidentialite"
            className="underline"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            politique de confidentialité
          </Link>
          , qui fait partie intégrante des présentes conditions.
        </p>
      </LegalSection>

      <LegalSection title="8. Résiliation">
        <p>
          Vous pouvez cesser d'utiliser le service à tout moment et demander la
          suppression de votre compte, ce qui entraîne l'effacement des données
          associées. Lokadia peut suspendre un compte en cas de manquement caractérisé
          aux présentes conditions.
        </p>
      </LegalSection>

      <LegalSection title="9. Évolution des conditions">
        <p>
          Ces conditions peuvent être modifiées. La version en vigueur est celle publiée
          sur cette page, avec son numéro de version et sa date. Une modification
          substantielle est signalée dans l'application.
        </p>
      </LegalSection>

      <LegalSection title="10. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de
          différend, une solution amiable sera recherchée en priorité, à l'adresse{' '}
          <LegalField value={LEGAL.contact.email} label="Adresse de contact" />.
        </p>
        <p>
          Consommateurs : conformément à l'article L612-1 du code de la consommation,
          vous pouvez recourir gratuitement à un médiateur de la consommation —{' '}
          <LegalField value={LEGAL.contact.mediator} label="Médiateur de la consommation" />.
          À défaut d'accord, les tribunaux français sont compétents.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
