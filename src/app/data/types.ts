/**
 * Forme des fiches destination.
 *
 * Ce fichier décrit ce que contiennent réellement les 57 destinations de
 * `destinationData.ts` et de ses compléments. Il avait divergé : une version
 * antérieure déclarait `message`, `healthRequirements`, `scamAlerts`,
 * `visaInfo` et `typicalCosts`, qu'aucune destination n'a jamais renseignés,
 * pendant que les écrans lisaient `summary`, `vaccines`, `commonScams` et
 * `priceGuide`. Les noms ci-dessous sont ceux des données et des écrans.
 *
 * Ce qui n'y figure plus, volontairement : les alertes. Chaque fiche portait
 * un tableau `alerts` écrit à la main, horodaté en relatif (« Aujourd'hui,
 * 14:30 »), donc perpétuellement « frais » pour un évènement figé depuis des
 * mois. Les alertes viennent désormais des seules sources officielles, via
 * `useLokascore(id, { live: true })` — datées et attribuées.
 */

export interface Vaccine {
  name: string;
  status: "none" | "optional" | "recommended" | "required";
}

export interface ScamAlert {
  title: string;
  desc: string;
}

export interface PriceItem {
  item: string;
  price: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
  /** Nom d'icône lucide-react (jamais un emoji). */
  icon: string;
}

export interface DestinationDetails {
  id: string;
  name: string;
  country: string;
  image: string;
  /** @deprecated Ne jamais afficher cette valeur — le score est calculé côté serveur (lokascore-compute) et exposé via useLokascore() */
  lokascoreSeed?: number;
  safetyLevel: "safe" | "vigilance" | "danger";
  timezone: string;
  language: string;
  currency: string;

  // Sécurité
  securitySummary: string;
  dangerousAreas: string[];
  safetyTips: string[];
  commonScams: ScamAlert[];

  // Santé
  vaccines: Vaccine[];
  healthSystem: string;

  // Formalités
  visaRequired: boolean;
  visaDetails: string;
  entryDocuments: string;

  // Pratique
  priceGuide: PriceItem[];
  emergencyNumbers: EmergencyContact[];
  consulateInfo: string;

  // Culture
  localCustoms: string[];
  behaviorsToAvoid: string[];

  /**
   * Champs facultatifs : lus par certains écrans mais renseignés par aucune
   * destination à ce jour. Les consommateurs doivent tolérer `undefined`.
   */
  region?: string;
  popularDistricts?: string[];
  localTransport?: string;
}
