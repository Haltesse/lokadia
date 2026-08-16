import type { FaqEntry } from '../lib/seo/structuredData';

/**
 * Questions fréquentes sur le Lokascore.
 *
 * Source unique : ces entrées sont **affichées** sur `/lokascore` et
 * balisées en `FAQPage` pour cette même page. Baliser une FAQ invisible
 * est une infraction aux règles de données structurées — ici les deux ne
 * peuvent pas diverger, elles lisent le même tableau.
 */
export const LOKASCORE_FAQ: FaqEntry[] = [
  {
    question: 'Que signifie exactement un Lokascore « indicatif » ?',
    answer:
      "C'est un indicateur synthétique d'aide à la décision, pas une garantie de sécurité ni une autorisation de départ. Il résume des publications officielles à un instant donné ; il ne connaît ni votre situation personnelle, ni l'événement survenu il y a dix minutes. Les conseils aux voyageurs de votre ministère des Affaires étrangères restent la référence.",
  },
  {
    question: 'Sur quelles sources le score est-il calculé ?',
    answer:
      "Uniquement des sources officielles : conseils aux voyageurs du ministère français des Affaires étrangères, du Foreign Commonwealth & Development Office britannique et du Département d'État américain, alertes sanitaires de l'Organisation mondiale de la santé, alertes catastrophes du GDACS (ONU), et indicateurs d'infrastructure et d'état de droit d'organismes publics. Chaque source est consultable en un clic depuis la fiche destination.",
  },
  {
    question: 'À quelle fréquence est-il mis à jour ?',
    answer:
      "Le calcul est rafraîchi côté serveur toutes les 30 minutes. Chaque score affiché porte la date de la valeur utilisée : si cette date vous paraît ancienne, c'est que la source elle-même n'a pas été mise à jour depuis.",
  },
  {
    question: 'Que faire si le score contredit un avis officiel ?',
    answer:
      "L'avis officiel prime, sans discussion. Le Lokascore agrège plusieurs sources et peut lisser une alerte très récente ou très localisée. Les liens vers les publications d'origine sont affichés à côté du score précisément pour que vous puissiez trancher vous-même.",
  },
  {
    question: 'Le score dépend-il de mon profil de voyage ?',
    answer:
      "Oui : neuf profils de voyage (solo, famille, professionnel, aventure…) modulent la lecture du score, parce qu'un même contexte ne présente pas le même risque selon le voyage. Aucune donnée personnelle n'est demandée pour cela — le profil est un simple réglage, conservé sur votre appareil.",
  },
  {
    question: 'Le score reste-t-il consultable sans connexion ?',
    answer:
      "Oui. Le dernier score consulté pour une destination est conservé sur votre appareil et reste lisible hors connexion, explicitement signalé comme donnée en cache avec la date de sa capture. Vous savez donc toujours si vous lisez une valeur fraîche ou une valeur d'hier.",
  },
];
