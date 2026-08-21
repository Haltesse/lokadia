// Hook pour gérer les données utilisateur (trips, favorites, checklist, etc.)
// NOTE: Ce hook est désactivé suite à la migration complète vers Supabase
// Utilisez directement les services Supabase (tripService, etc.) à la place

import { useCallback } from 'react';
import type { Trip, Favorite, ChecklistItem } from '../lib/db';

// Références stables et typées. Un `[]` littéral serait recréé à chaque rendu
// (les effets des appelants boucleraient) et s'inférerait en `never[]`, ce qui
// casse tout appelant lisant un champ sur les éléments.
const NO_TRIPS: Trip[] = [];
const NO_FAVORITES: Favorite[] = [];
const NO_CHECKLIST_ITEMS: ChecklistItem[] = [];

export function useUserData() {
  // Hook désactivé - Migration Supabase complète
  // Les données sont maintenant gérées par tripService, AuthContext, etc.
  // Note: Le warning console a été supprimé pour éviter les messages d'erreur à l'utilisateur

  // Retourner des fonctions no-op pour éviter les erreurs
  // Renvoie `null` typé `never` : assignable à n'importe quel appelant sans
  // recourir à `any`.
  const noOp = useCallback(async (): Promise<never | null> => null, []);

  return {
    // Data (vides)
    trips: NO_TRIPS,
    favorites: NO_FAVORITES,
    checklistItems: NO_CHECKLIST_ITEMS,
    isLoading: false,

    // Trips (désactivés)
    createTrip: noOp,
    updateTrip: noOp,
    deleteTrip: noOp,

    // Favorites (désactivés)
    addFavorite: noOp,
    removeFavorite: noOp,
    isFavorite: () => false,

    // Checklist (désactivés)
    createChecklistItem: noOp,
    updateChecklistItem: noOp,
    toggleChecklistItem: noOp,
    deleteChecklistItem: noOp,
    getChecklistForTrip: () => NO_CHECKLIST_ITEMS,

    // Stats (vides)
    getStats: () => ({
      totalTrips: 0,
      plannedTrips: 0,
      activeTrips: 0,
      completedTrips: 0,
      totalFavorites: 0,
      totalChecklistItems: 0,
      completedChecklistItems: 0,
      checklistProgress: 0,
    }),

    // Refresh (désactivé)
    refresh: noOp,
  };
}
