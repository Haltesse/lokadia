/**
 * Formalités d'entrée : ce que Lokadia peut affirmer, et ce qu'il ne peut
 * pas.
 *
 * Le problème réglé ici. La fiche destination affichait « Pas de visa
 * nécessaire » avec une coche verte, sans savoir qui lisait. C'est faux
 * pour une bonne partie du monde et potentiellement grave : un voyageur
 * refusé à l'embarquement parce qu'une application lui a dit qu'il n'avait
 * besoin de rien. Le champ `visaRequired` du jeu de données a été écrit
 * depuis un point de vue occidental implicite, sans source ni date.
 *
 * La règle appliquée : **on n'affirme l'absence de visa que lorsqu'elle
 * découle d'un droit vérifiable** — la libre circulation dans l'EEE et la
 * Suisse (directive 2004/38/CE). Partout ailleurs, le verdict est « à
 * vérifier », avec le lien vers l'autorité compétente pour la nationalité
 * déclarée. Aucune base de données visa maison : ne pas savoir se dit.
 */
import {
  findCountry,
  inCountry,
  hasFreeMovement,
  isSchengen,
  type CountryRef,
} from '../data/countries';
import { findNationality, type NationalityRef } from '../data/nationalities';

export type EntryVerdict =
  /** Nationalité non renseignée : rien ne peut être conclu */
  | 'nationality-unknown'
  /** Le voyageur est ressortissant du pays visité */
  | 'own-country'
  /** Droit d'entrée fondé sur la libre circulation EEE + Suisse */
  | 'free-movement'
  /** Tout le reste : à vérifier auprès de la source officielle */
  | 'check-required';

export interface EntryLink {
  label: string;
  detail: string;
  url: string;
}

export interface EntryCheck {
  title: string;
  detail: string;
  /** true quand le point relève d'une obligation à confirmer, pas d'un fait acquis */
  toVerify: boolean;
}

export interface EntryAssessment {
  verdict: EntryVerdict;
  /** Phrase courte affichée en tête, jamais rassurante par défaut */
  headline: string;
  explanation: string;
  /** Fondement juridique, uniquement quand il existe réellement */
  legalBasis?: EntryLink;
  checks: EntryCheck[];
  sources: EntryLink[];
  destination: CountryRef | null;
  nationality: NationalityRef | null;
}

const MAE_BASE =
  'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination';
const MAE_INDEX = 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/';

/**
 * Fiche « Conseils aux voyageurs » du ministère français pour un pays.
 * Renvoie l'index quand le slug n'est pas confirmé : un lien vers une page
 * d'accueil vaut mieux qu'un lien vers une 404.
 */
export function maeCountryUrl(country: CountryRef | null): string {
  return country?.maeSlug ? `${MAE_BASE}/${country.maeSlug}/` : MAE_INDEX;
}

/** Points de vigilance communs à tout franchissement de frontière. */
function commonChecks(destination: CountryRef | null): EntryCheck[] {
  const checks: EntryCheck[] = [
    {
      title: 'Validité du passeport',
      detail:
        "De nombreux pays exigent un passeport valide plusieurs mois après la date de retour — souvent trois ou six. Vérifiez l'exigence exacte du pays visité avant de réserver.",
      toVerify: true,
    },
    {
      title: 'Autorisation de voyage électronique',
      detail:
        "Certains pays imposent une autorisation à demander en ligne avant le départ, même sans visa. Elle se demande uniquement sur le site officiel du pays concerné : les sites intermédiaires facturent un service gratuit ou peu coûteux.",
      toVerify: true,
    },
    {
      title: 'Billet retour et ressources',
      detail:
        "Un justificatif de sortie du territoire et des ressources suffisantes peuvent être demandés à l'embarquement comme à l'arrivée.",
      toVerify: true,
    },
  ];

  if (destination && isSchengen(destination.iso2)) {
    checks.push({
      title: 'Règle des 90 jours (espace Schengen)',
      detail:
        "Pour les ressortissants de pays tiers dispensés de visa, le séjour dans l'espace Schengen est limité à 90 jours par période de 180 jours, tous pays Schengen confondus. Vérifiez ce qui s'applique à votre nationalité.",
      toVerify: true,
    });
  }

  return checks;
}

/** Liens officiels pertinents, sans doublon et sans lien mort. */
function buildSources(
  destination: CountryRef | null,
  nationality: NationalityRef | null,
): EntryLink[] {
  const sources: EntryLink[] = [];

  if (nationality) {
    sources.push({
      label: `Autorité compétente — ${nationality.label}`,
      detail: `${nationality.authority} : conditions d'entrée et conseils officiels pour les ressortissants de votre pays.`,
      url: nationality.url,
    });
  }

  // La fiche pays du ministère français reste utile à tous pour la
  // situation sur place (sécurité, santé) — elle est étiquetée comme telle
  // pour ne pas laisser croire qu'elle traite de toutes les nationalités.
  if (!nationality || nationality.iso2 !== 'FR') {
    sources.push({
      label: 'Situation sur place (source française)',
      detail:
        "Conseils aux voyageurs du ministère français : sécurité, santé et zones déconseillées. Les formalités qui y figurent concernent les ressortissants français.",
      url: maeCountryUrl(destination),
    });
  } else {
    sources.push({
      label: `Fiche pays — ${destination?.nameFr ?? 'destination'}`,
      detail:
        'Conseils aux voyageurs du ministère français : formalités, sécurité, santé et zones déconseillées.',
      url: maeCountryUrl(destination),
    });
  }

  return sources;
}

/**
 * Évalue les conditions d'entrée pour une nationalité et une destination.
 *
 * @param nationalityIso2 nationalité déclarée par le voyageur, ou null
 * @param destinationCountry nom du pays de destination, tel qu'il figure
 *   dans le jeu de données (français, anglais ou variante)
 */
export function assessEntry(
  nationalityIso2: string | null,
  destinationCountry: string,
): EntryAssessment {
  const destination = findCountry(destinationCountry);
  const nationality = findNationality(nationalityIso2);
  const sources = buildSources(destination, nationality);
  const destinationName = destination?.nameFr ?? destinationCountry;
  // « au Maroc », « aux États-Unis »… plutôt qu'un « en » systématique.
  const inDestination = inCountry(destination, destinationCountry);

  if (!nationalityIso2) {
    return {
      verdict: 'nationality-unknown',
      headline: 'Indiquez votre nationalité',
      explanation:
        "Les formalités d'entrée dépendent entièrement de votre nationalité : la même destination peut être accessible sans visa pour l'un et exiger deux semaines de démarches pour l'autre. Sans cette information, Lokadia ne vous dira rien plutôt que de vous dire quelque chose de faux.",
      checks: commonChecks(destination),
      sources,
      destination,
      nationality,
    };
  }

  if (destination && nationalityIso2 === destination.iso2) {
    return {
      verdict: 'own-country',
      headline: `Vous êtes ressortissant·e de ${destinationName}`,
      explanation:
        "Aucune formalité d'entrée ne s'applique : un pays ne peut pas refuser l'entrée à ses propres ressortissants. Pensez tout de même à un titre d'identité en cours de validité pour le transporteur.",
      checks: [],
      sources,
      destination,
      nationality,
    };
  }

  if (
    destination &&
    hasFreeMovement(destination.iso2) &&
    hasFreeMovement(nationalityIso2)
  ) {
    return {
      verdict: 'free-movement',
      headline: 'Libre circulation : pas de visa',
      explanation: `En tant que ressortissant·e d'un État de l'Espace économique européen ou de la Suisse, vous avez le droit d'entrer ${inDestination} avec une carte d'identité ou un passeport en cours de validité. Aucun visa n'est requis. Au-delà de trois mois de séjour, des formalités d'enregistrement peuvent s'appliquer sur place.`,
      legalBasis: {
        label: 'Directive 2004/38/CE',
        detail:
          "Droit des citoyens de l'Union et des membres de leur famille de circuler et de séjourner librement sur le territoire des États membres.",
        url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32004L0038',
      },
      checks: [
        {
          title: "Titre d'identité en cours de validité",
          detail:
            "Le droit d'entrée s'exerce sur présentation d'une carte d'identité ou d'un passeport valide. Un titre périmé ne suffit pas, même dans l'Union.",
          toVerify: false,
        },
        {
          title: 'Couverture santé',
          detail:
            "La carte européenne d'assurance maladie donne accès aux soins publics dans les mêmes conditions que les résidents. Elle ne couvre ni le rapatriement, ni les soins privés.",
          toVerify: true,
        },
      ],
      sources: [
        ...sources,
        {
          label: "Vos droits dans l'Union — Commission européenne",
          detail:
            "Conditions d'entrée et de séjour, documents acceptés, droits en cas de refus d'embarquement.",
          url: 'https://europa.eu/youreurope/citizens/travel/entry-exit/index_fr.htm',
        },
      ],
      destination,
      nationality,
    };
  }

  return {
    verdict: 'check-required',
    headline: 'Formalités à vérifier auprès de la source officielle',
    explanation: nationality
      ? `Lokadia ne dispose pas de règle vérifiée pour un séjour ${inDestination} avec la nationalité que vous avez indiquée (${nationality.label}). Plutôt que d'avancer une réponse invérifiable sur un sujet où une erreur coûte un embarquement refusé, voici les autorités qui font foi.`
      : `Lokadia ne dispose pas de règle vérifiée pour votre nationalité. Consultez le ministère des affaires étrangères de votre pays, ainsi que la représentation diplomatique la plus proche du pays de destination (${destinationName}) : ce sont les seules sources qui engagent.`,
    checks: commonChecks(destination),
    sources,
    destination,
    nationality,
  };
}

/** Couleur de lecture du verdict, alignée sur les jetons de thème. */
export function verdictTone(verdict: EntryVerdict): 'positive' | 'neutral' | 'attention' {
  if (verdict === 'free-movement' || verdict === 'own-country') return 'positive';
  if (verdict === 'nationality-unknown') return 'neutral';
  return 'attention';
}
