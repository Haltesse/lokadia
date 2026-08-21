/**
 * Effacement des données personnelles du voyageur (RGPD, article 17).
 *
 * L'écran profil appelait auparavant `resetUserData` importée de `./demo` —
 * une fonction qui n'a jamais existé. L'import dynamique échouait, l'erreur
 * était capturée par le `try/catch` du bouton, et « Supprimer mon compte »
 * affichait simplement un message d'erreur : aucune donnée n'était effacée.
 *
 * Ce que fait cette fonction : supprimer, sous l'identité de la personne
 * elle-même — donc dans les limites que RLS lui accorde —, toutes les lignes
 * qui lui appartiennent.
 *
 * Ce qu'elle ne fait pas : supprimer l'identité `auth.users`. Cela demande la
 * clé `service_role`, qui n'a rien à faire dans un navigateur. Tant qu'une
 * Edge Function dédiée n'existe pas, l'identifiant survit à un compte vidé de
 * son contenu ; `eraseTravelerData` le signale via `authIdentityRemoved`.
 */

import { supabase } from './supabase';
import { getUserTrips, deleteTrip } from './tripService';
import { clearLocalData } from '../data/legal';

/** Tables dont chaque ligne porte directement le `user_id` du voyageur. */
const USER_SCOPED_TABLES = [
  'checklist_items',
  'traveler_watchlist',
  'traveler_alerts',
  'traveler_push_subscriptions',
] as const;

export interface ErasureReport {
  /** Voyages supprimés (avec leurs étapes, segments et checklists). */
  tripsDeleted: number;
  /** Clés de stockage local effacées. */
  localKeysCleared: number;
  /** Tables que RLS ou le réseau ont empêché de nettoyer. */
  failedTables: string[];
  /**
   * Toujours `false` aujourd'hui : voir l'en-tête de ce fichier. L'appelant
   * doit adapter son message plutôt que promettre une suppression totale.
   */
  authIdentityRemoved: boolean;
}

export async function eraseTravelerData(userId: string): Promise<ErasureReport> {
  const failedTables: string[] = [];

  // 1. Les voyages d'abord : `deleteTrip` connaît déjà l'ordre de suppression
  //    des étapes, segments et éléments de checklist rattachés.
  let tripsDeleted = 0;
  try {
    const trips = await getUserTrips(userId);
    for (const trip of trips) {
      await deleteTrip(trip.id);
      tripsDeleted++;
    }
  } catch (error) {
    console.error('Effacement : échec sur les voyages', error);
    failedTables.push('trips');
  }

  // 2. Le reste des lignes personnelles, y compris ce qui aurait survécu à la
  //    suppression d'un voyage (checklists orphelines, alertes, abonnements).
  for (const table of USER_SCOPED_TABLES) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.error(`Effacement : échec sur ${table}`, error);
      failedTables.push(table);
    }
  }

  // 3. Le stockage local, qui contient préférences et cache hors connexion.
  const localKeysCleared = clearLocalData();

  return { tripsDeleted, localKeysCleared, failedTables, authIdentityRemoved: false };
}
