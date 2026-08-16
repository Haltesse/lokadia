/**
 * Identité légale de l'éditeur et éléments de conformité.
 *
 * ⚠️ Rien n'est inventé ici. Les champs qui relèvent de l'état civil de
 * l'entreprise (raison sociale, SIREN, adresse, directeur de publication)
 * valent `null` tant qu'ils n'ont pas été fournis : les pages légales
 * affichent alors un marqueur « à compléter » explicite, et un
 * avertissement s'affiche en développement. Une mention légale inventée
 * serait pire que pas de mention du tout.
 *
 * À remplir avant toute mise en ligne publique — l'article 6 III de la
 * LCEN rend ces informations obligatoires.
 */

/** Valeur non fournie : affichée comme « à compléter », jamais devinée. */
export type LegalValue = string | null;

export interface LegalIdentity {
  /** Raison sociale ou nom de la personne physique éditrice */
  name: LegalValue;
  /** Forme juridique (SAS, SARL, auto-entrepreneur, association…) */
  legalForm: LegalValue;
  /** Capital social, si société */
  capital: LegalValue;
  /** Adresse du siège ou de correspondance */
  address: LegalValue;
  /** Numéro SIREN / SIRET */
  siren: LegalValue;
  /** Ville d'immatriculation au RCS */
  rcs: LegalValue;
  /** Numéro de TVA intracommunautaire */
  vat: LegalValue;
  /** Directeur ou directrice de la publication */
  publicationDirector: LegalValue;
}

export interface LegalHost {
  name: string;
  role: string;
  address: LegalValue;
  url: string;
}

export const LEGAL = {
  /** Date de dernière mise à jour des textes légaux (ISO). */
  updatedOn: '2026-08-16',

  /** Version des CGU, incrémentée à chaque modification de fond. */
  termsVersion: '1.0',

  publisher: {
    name: null,
    legalForm: null,
    capital: null,
    address: null,
    siren: null,
    rcs: null,
    vat: null,
    publicationDirector: null,
  } satisfies LegalIdentity as LegalIdentity,

  contact: {
    /** Contact général et exercice des droits RGPD */
    email: null as LegalValue,
    /** Délégué à la protection des données, s'il en est désigné un */
    dpo: null as LegalValue,
    /** Médiateur de la consommation — obligatoire dès qu'une offre payante existe */
    mediator: null as LegalValue,
  },

  /**
   * Hébergeurs. Les prestataires sont connus (ils sont dans le dépôt :
   * `vercel.json`, client Supabase) ; leurs adresses postales exactes et
   * la région d'hébergement des données restent à confirmer auprès d'eux
   * plutôt qu'à recopier de mémoire.
   */
  hosts: [
    {
      name: 'Vercel Inc.',
      role: "Hébergement du site et du service worker",
      address: null,
      url: 'https://vercel.com',
    },
    {
      name: 'Supabase',
      role: "Base de données, authentification et fonctions serveur",
      address: null,
      url: 'https://supabase.com',
    },
  ] satisfies LegalHost[] as LegalHost[],
};

/** Libellés des champs, pour l'avertissement de configuration. */
const FIELD_LABELS: Record<string, string> = {
  'publisher.name': "Raison sociale de l'éditeur",
  'publisher.legalForm': 'Forme juridique',
  'publisher.address': 'Adresse',
  'publisher.siren': 'SIREN / SIRET',
  'publisher.publicationDirector': 'Directeur de la publication',
  'contact.email': 'Adresse de contact (droits RGPD)',
  'hosts.address': 'Adresse postale des hébergeurs',
};

/**
 * Champs légalement obligatoires encore vides. Utilisé par les pages pour
 * afficher un avertissement en développement — sur un site en ligne, il
 * vaut mieux voir le trou que de croire la page complète.
 */
export function missingLegalFields(): string[] {
  const missing: string[] = [];
  const required: [string, LegalValue][] = [
    ['publisher.name', LEGAL.publisher.name],
    ['publisher.legalForm', LEGAL.publisher.legalForm],
    ['publisher.address', LEGAL.publisher.address],
    ['publisher.siren', LEGAL.publisher.siren],
    ['publisher.publicationDirector', LEGAL.publisher.publicationDirector],
    ['contact.email', LEGAL.contact.email],
  ];
  for (const [key, value] of required) {
    if (!value) missing.push(FIELD_LABELS[key] ?? key);
  }
  if (LEGAL.hosts.some((host) => !host.address)) {
    missing.push(FIELD_LABELS['hosts.address']);
  }
  return missing;
}

/**
 * Familles de données stockées sur l'appareil.
 *
 * Cette liste est la vérité affichée dans la politique de confidentialité.
 * Elle est tenue à jour avec le code : toute nouvelle clé `lokadia_*`
 * doit y apparaître.
 */
export interface LocalStorageFamily {
  prefix: string;
  purpose: string;
  retention: string;
}

export const LOCAL_STORAGE_FAMILIES: LocalStorageFamily[] = [
  {
    prefix: 'lokadia-auth · lokadia_access_token',
    purpose: "Maintenir votre session ouverte entre deux visites (jeton d'authentification).",
    retention: "Jusqu'à la déconnexion ou l'expiration du jeton.",
  },
  {
    prefix: 'lokadia_language · lokadia_selected_currency · lokadia_travel_profile',
    purpose: 'Mémoriser vos préférences d’affichage : langue, devise, profil de voyage.',
    retention: "Jusqu'à effacement par vos soins.",
  },
  {
    prefix: 'lokadia_cache_v1:*',
    purpose:
      'Garder consultables hors connexion les derniers Lokascore, alertes, formalités et météo affichés, avec leur date de capture.',
    retention: 'Purge automatique au bout de 30 jours.',
  },
  {
    prefix: 'lokadia_checklist_* · lokadia_cart_v1 · lokadia_trip_bookings_v1',
    purpose:
      'Conserver vos checklists de départ et vos demandes de réservation en cours sur cet appareil.',
    retention: "Jusqu'à effacement par vos soins.",
  },
  {
    prefix:
      'lokadia_install_dismissed · lokadia_notification_prefs · lokadia_storage_notice_ack',
    purpose:
      "Se souvenir que vous avez refusé la proposition d'installation, de vos préférences de notification, et de la date à laquelle l'information sur le stockage vous a été présentée.",
    retention: "Jusqu'à effacement par vos soins.",
  },
];

/**
 * Efface tout ce que Lokadia a écrit sur l'appareil.
 *
 * Le préfixe `lokadia` couvre l'ensemble des clés du produit — on ne vide
 * pas le `localStorage` en entier, qui peut contenir des données d'autres
 * applications servies sur le même domaine.
 *
 * @returns le nombre de clés supprimées
 */
export function clearLocalData(): number {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.toLowerCase().startsWith('lokadia')) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
  return keys.length;
}
