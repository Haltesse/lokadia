import { additionalDestinations } from "./additionalDestinations";
import { newDestinations } from "./newDestinations";
import { moreDetailedDestinations } from "./moreDetailedDestinations";
import { moreDetailedDestinations2 } from "./moreDetailedDestinations2";
import { moreDetailedDestinations3 } from "./moreDetailedDestinations3";
import { moreDetailedDestinations4 } from "./moreDetailedDestinations4";
import type { DestinationDetails, Alert, HealthRequirement, ScamAlert, VisaInfo, TypicalCost, EmergencyContact } from "./types";

// Re-export types for backward compatibility
export type { DestinationDetails, Alert, HealthRequirement, ScamAlert, VisaInfo, TypicalCost, EmergencyContact };

export const destinationsDatabase: Record<string, DestinationDetails> = {
  "paris-france": {
    id: "paris-france",
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    lokascoreSeed: 85,
    safetyLevel: "safe",
    lastUpdate: "Il y a 2 heures",
    timezone: "GMT+1 (CET)",
    language: "Français",
    currency: "Euro (€)",
    securitySummary: "Paris est généralement une destination sûre pour les voyageurs. La ville dispose d'une forte présence policière et d'infrastructures de sécurité modernes. Restez vigilant dans les zones touristiques très fréquentées où les pickpockets opèrent, particulièrement dans le métro et près des attractions majeures comme la Tour Eiffel et le Louvre.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Grève des transports",
        summary: "Perturbations prévues sur les lignes de métro 1, 4 et 14 jeudi 27 février",
        date: "Aujourd'hui, 14:30"
      },
      {
        id: 2,
        type: "vigilance",
        title: "Manifestation prévue",
        summary: "Rassemblement place de la République samedi 28 février - Évitez la zone entre 14h-19h",
        date: "Demain, 15:00"
      }
    ],
    dangerousAreas: [
      "Certaines zones du 18e et 19e arrondissement la nuit",
      "Gare du Nord et alentours après 22h",
      "Bois de Boulogne et Vincennes la nuit",
      "Stations de métro Châtelet-Les Halles après minuit"
    ],
    safetyTips: [
      "Restez vigilant dans le métro et les zones touristiques très fréquentées",
      "Évitez de montrer des objets de valeur (téléphones, bijoux, sacs de luxe)",
      "Gardez vos sacs fermés et devant vous, particulièrement dans les transports",
      "Utilisez des taxis officiels ou applications de transport reconnues (G7, Uber)",
      "Méfiez-vous des personnes trop amicales qui s'approchent dans les lieux touristiques"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés (tétanos, diphtérie)", status: "recommended" }
    ],
    healthSystem: "Excellent système de santé publique et privée. La Carte Européenne d'Assurance Maladie (CEAM) est acceptée pour les citoyens de l'UE. Pharmacies largement disponibles (croix verte). Numéro d'urgence médicale: 15 (SAMU).",
    visaRequired: false,
    visaDetails: "Pas de visa nécessaire pour les ressortissants de l'UE, de l'espace Schengen, et de nombreux autres pays (USA, Canada, Australie, etc.) pour un séjour de moins de 90 jours.",
    entryDocuments: "Carte d'identité ou passeport en cours de validité requis. Pour les non-européens, passeport valide 6 mois après la date de retour.",
    commonScams: [
      {
        title: "Pétition signature",
        desc: "Des personnes vous demandent de signer une pétition tout en vous volant. Refusez poliment et éloignez-vous."
      },
      {
        title: "Bracelets brésiliens",
        desc: "On vous attache un bracelet au poignet près de Sacré-Cœur puis demande 10-20€. Gardez les mains dans les poches."
      },
      {
        title: "Taxis non-officiels",
        desc: "Aux aéroports, des personnes proposent des taxis sans compteur à prix exorbitants. Utilisez uniquement taxis officiels ou G7."
      },
      {
        title: "Jeu de bonneteau",
        desc: "Jeu d'argent illégal dans la rue. Vous perdrez toujours, c'est une arnaque organisée."
      }
    ],
    priceGuide: [
      { item: "Taxi aéroport CDG → centre", price: "50-70€" },
      { item: "Ticket métro simple", price: "2.10€" },
      { item: "Carnet 10 tickets métro", price: "17.35€" },
      { item: "Restaurant milieu de gamme", price: "20-35€" },
      { item: "Café en terrasse", price: "3-5€" },
      { item: "Bière (50cl)", price: "6-8€" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "17", icon: "Shield" },
      { name: "Pompiers", number: "18", icon: "Flame" },
      { name: "SAMU (Urgences médicales)", number: "15", icon: "Ambulance" },
      { name: "Numéro d'urgence européen", number: "112", icon: "AlertCircle" }
    ],
    consulateInfo: "En cas de perte de papiers, d'arrestation ou de problème consulaire majeur, contactez votre ambassade. La plupart se trouvent dans les 7e et 8e arrondissements.",
    localCustoms: [
      "Toujours dire 'Bonjour' en entrant dans un commerce et 'Au revoir' en sortant",
      "Tutoiement et vouvoiement: vouvoyer les personnes inconnues et les seniors",
      "Pourboire de 5-10% apprécié mais non obligatoire (service compris en France)",
      "Ne pas parler fort dans les lieux publics, c'est considéré comme impoli"
    ],
    behaviorsToAvoid: [
      "Parler fort dans les transports en commun ou restaurants",
      "Manger en marchant dans la rue (considéré comme peu élégant)",
      "Boire de l'alcool dans l'espace public (interdit et amendable)"
    ]
  },

  "tokyo-japan": {
    id: "tokyo-japan",
    name: "Tokyo",
    country: "Japon",
    image: "https://images.unsplash.com/photo-1598785933375-9f14c25f720b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwc2t5bGluZXxlbnwxfHx8fDE3NzE5NTUzMTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    lokascoreSeed: 95,
    safetyLevel: "safe",
    lastUpdate: "Il y a 1 heure",
    timezone: "GMT+9 (JST)",
    language: "Japonais",
    currency: "Yen (¥)",
    securitySummary: "Tokyo est l'une des villes les plus sûres au monde. Le taux de criminalité est extrêmement bas et vous pouvez vous promener en toute sécurité à toute heure. Les Japonais sont respectueux et serviables. La ville est très propre et bien organisée.",
    alerts: [
      {
        id: 1,
        type: "info",
        title: "Typhon prévu",
        summary: "Saison des typhons: vérifiez la météo régulièrement en août-septembre",
        date: "Il y a 3 heures"
      }
    ],
    dangerousAreas: [
      "Kabukicho (quartier rouge de Shinjuku) tard le soir - restez vigilant",
      "Roppongi la nuit - présence de rabatteurs insistants"
    ],
    safetyTips: [
      "Évitez les bars où des rabatteurs vous abordent dans la rue (prix exorbitants)",
      "Gardez toujours vos effets personnels - les objets perdus sont quasi toujours retrouvés",
      "Respectez les règles strictes: ne pas manger en marchant, ne pas téléphoner dans le train",
      "Ayez toujours de l'argent liquide (beaucoup d'endroits ne prennent pas la carte)",
      "Téléchargez une application de traduction (peu de gens parlent anglais)"
    ],
    vaccines: [
      { name: "Aucun vaccin obligatoire", status: "none" },
      { name: "Vaccins universels à jour recommandés", status: "recommended" },
      { name: "Encéphalite japonaise si séjour rural prolongé", status: "recommended" }
    ],
    healthSystem: "Système de santé excellent mais coûteux pour les étrangers. Souscrivez impérativement à une assurance voyage. Pharmacies nombreuses mais médicaments différents (apportez les vôtres).",
    visaRequired: false,
    visaDetails: "Exemption de visa pour séjours touristiques de moins de 90 jours pour la plupart des pays occidentaux (France, USA, Canada, etc.).",
    entryDocuments: "Passeport valide pour toute la durée du séjour. Billet retour obligatoire.",
    commonScams: [
      {
        title: "Bars à hôtesses de Roppongi",
        desc: "Des rabatteurs vous invitent dans des bars avec addition de plusieurs milliers d'euros. Refusez toute sollicitation de rue."
      },
      {
        title: "Faux moines bouddhistes",
        desc: "Demandent des dons dans les zones touristiques. Les vrais moines ne sollicitent jamais directement."
      },
      {
        title: "Taxis de l'aéroport",
        desc: "Très chers (200-300€). Utilisez le Narita Express ou Limousine Bus (30-40€)."
      }
    ],
    priceGuide: [
      { item: "Narita Express → Tokyo", price: "¥3,070 (~28€)" },
      { item: "Ticket métro", price: "¥170-320 (~1.5-3€)" },
      { item: "Pass métro journée", price: "¥800 (~7€)" },
      { item: "Ramen restaurant", price: "¥800-1,200 (~7-11€)" },
      { item: "Restaurant milieu de gamme", price: "¥1,500-3,000 (~14-27€)" },
      { item: "Bière locale (500ml)", price: "¥500 (~4.50€)" }
    ],
    emergencyNumbers: [
      { name: "Police", number: "110", icon: "Shield" },
      { name: "Pompiers/Ambulance", number: "119", icon: "Ambulance" },
      { name: "Assistance touristique", number: "050-3816-2787", icon: "Info" }
    ],
    consulateInfo: "Ambassades situées principalement dans les quartiers de Minato et Chiyoda. Service d'assistance 24h/7j disponible.",
    localCustoms: [
      "S'incliner légèrement pour saluer (15-30° suffit pour les touristes)",
      "Enlever ses chaussures en entrant chez quelqu'un ou dans certains restaurants",
      "Ne jamais laisser de pourboire (considéré comme insultant)",
      "Manger les ramen et soba en faisant du bruit (signe d'appréciation)",
      "Ne pas planter ses baguettes verticalement dans le riz (rituel funéraire)",
      "Parler doucement dans les transports en commun"
    ],
    behaviorsToAvoid: [
      "Téléphoner dans les transports (mode silencieux obligatoire)",
      "Manger en marchant dans la rue",
      "Se moucher bruyamment en public (aller aux toilettes)",
      "Pointer du doigt quelqu'un",
      "Embrasser ou s'enlacer en public"
    ]
  },

};

// Chaque identifiant n'est défini que dans UN seul fichier : ces sources
// sont complémentaires, jamais concurrentes. Un doublon serait un bug —
// il est détecté ci-dessous en développement.
Object.assign(
  destinationsDatabase,
  additionalDestinations,
  newDestinations,
  moreDetailedDestinations,
  moreDetailedDestinations2,
  moreDetailedDestinations3,
  moreDetailedDestinations4,
);

if (import.meta.env?.DEV) {
  const sources = {
    additionalDestinations,
    newDestinations,
    moreDetailedDestinations,
    moreDetailedDestinations2,
    moreDetailedDestinations3,
    moreDetailedDestinations4,
  };
  const seen = new Map<string, string>();
  for (const [file, table] of Object.entries(sources)) {
    for (const id of Object.keys(table)) {
      const previous = seen.get(id);
      if (previous) {
        console.warn(
          `[destinations] « ${id} » est défini dans ${previous} ET ${file} : ` +
            `seule la version de ${file} est servie. Supprimez le doublon.`,
        );
      }
      seen.set(id, file);
    }
  }
}

/** Fiche d'une destination, ou null si l'identifiant est inconnu. */
export function getDestinationData(destinationId: string): DestinationDetails | null {
  return destinationsDatabase[destinationId] ?? null;
}
// Fonction pour chercher une destination par nom
export function findDestinationByName(name: string): DestinationDetails | null {
  const normalized = name.toLowerCase();
  const found = Object.values(destinationsDatabase).find(
    dest => dest.name.toLowerCase() === normalized || 
            dest.id.includes(normalized)
  );
  return found || null;
}