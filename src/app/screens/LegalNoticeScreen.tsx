import { Link } from 'react-router-dom';
import { LEGAL } from '../data/legal';
import { LegalField, LegalList, LegalPage, LegalSection } from '../components/LegalPage';

/**
 * Mentions légales — article 6 III de la LCEN.
 *
 * Les informations d'état civil de l'éditeur viennent de `data/legal.ts`
 * et s'affichent en « à compléter » tant qu'elles n'ont pas été fournies.
 */
export default function LegalNoticeScreen() {
  return (
    <LegalPage
      title="Mentions légales"
      intro={
        <p>
          Informations relatives à l'éditeur du site Lokadia, à son hébergement et
          aux droits attachés aux contenus qui y sont publiés.
        </p>
      }
    >
      <LegalSection title="Éditeur du site">
        <LegalList
          items={[
            <>
              Raison sociale :{' '}
              <LegalField value={LEGAL.publisher.name} label="Raison sociale" />
            </>,
            <>
              Forme juridique :{' '}
              <LegalField value={LEGAL.publisher.legalForm} label="Forme juridique" />
              {LEGAL.publisher.capital ? ` — capital social : ${LEGAL.publisher.capital}` : null}
            </>,
            <>
              Siège / adresse de correspondance :{' '}
              <LegalField value={LEGAL.publisher.address} label="Adresse" />
            </>,
            <>
              Immatriculation :{' '}
              <LegalField value={LEGAL.publisher.siren} label="SIREN / SIRET" />
              {LEGAL.publisher.rcs ? ` — RCS ${LEGAL.publisher.rcs}` : null}
            </>,
            <>
              TVA intracommunautaire :{' '}
              <LegalField value={LEGAL.publisher.vat} label="Numéro de TVA" />
            </>,
            <>
              Directeur ou directrice de la publication :{' '}
              <LegalField
                value={LEGAL.publisher.publicationDirector}
                label="Directeur de la publication"
              />
            </>,
            <>
              Contact : <LegalField value={LEGAL.contact.email} label="Adresse de contact" />
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site et ses données sont hébergés par les prestataires suivants, dans le
          cadre de contrats de sous-traitance au sens du RGPD :
        </p>
        <LegalList
          items={LEGAL.hosts.map((host) => (
            <>
              <strong>{host.name}</strong> — {host.role}.{' '}
              <a
                href={host.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                {host.url.replace('https://', '')}
              </a>{' '}
              — <LegalField value={host.address} label="Adresse postale" />
              {host.region ? ` — données hébergées : ${host.region}.` : null}
            </>
          ))}
        />
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          La structure du site, ses textes éditoriaux, son identité visuelle et sa
          méthodologie d'évaluation sont protégés. La formule de calcul du Lokascore,
          ses pondérations et sa matrice de modulation par profil de voyage constituent
          un savoir-faire non divulgué, faisant l'objet d'un dépôt e-Soleau auprès de
          l'INPI.
        </p>
        <p>
          Les données publiées par les organismes officiels (ministères des Affaires
          étrangères, Organisation mondiale de la santé, GDACS, CDC…) restent la
          propriété de leurs émetteurs et sont citées avec un lien vers la publication
          d'origine. Les fonds cartographiques proviennent d'OpenStreetMap, sous licence
          ODbL. Les illustrations de destination proviennent d'Unsplash et de Wikimedia
          Commons, sous leurs licences respectives.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité éditoriale">
        <p>
          Les informations de sécurité, de santé et de formalités affichées sont des
          reprises de sources officielles, accompagnées de leur date et d'un lien direct
          vers la publication d'origine. Le Lokascore est un indicateur{' '}
          <strong>indicatif</strong> : il ne se substitue ni aux conseils aux voyageurs
          de votre ministère des Affaires étrangères, ni à votre propre appréciation.
          Les limites exactes de cet engagement sont détaillées dans les{' '}
          <Link to="/cgu" className="underline" style={{ color: 'var(--lokadia-primary)' }}>
            conditions générales d'utilisation
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Signaler un contenu">
        <p>
          Une erreur factuelle, un lien mort vers une source officielle ou un contenu
          que vous estimez illicite peuvent être signalés à l'adresse de contact
          ci-dessus. Les signalements portant sur une donnée de sécurité sont traités en
          priorité : une information périmée sur un risque est le défaut le plus grave
          que ce site puisse avoir.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données personnelles, les durées de conservation et
          l'exercice de vos droits sont décrits dans la{' '}
          <Link
            to="/confidentialite"
            className="underline"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
