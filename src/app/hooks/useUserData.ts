// Hook pour gérer les données utilisateur (trips, favorites, checklist, etc.)
// NOTE: Ce hook est désactivé suite à la migration complète vers Supabase
// Utilisez directement les services Supabase (tripService, etc.) à la place

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Trip, Favorite, ChecklistItem } from '../lib/db';

export function useUserData() {
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hook désactivé - Migration Supabase complète
  // Les données sont maintenant gérées par tripService, AuthContext, etc.
  // Note: Le warning console a été supprimé pour éviter les messages d'erreur à l'utilisateur

  // Retourner des fonctions no-op pour éviter les erreurs
  const noOp = useCallback(async () => {
    return null as any;
  }, []);

  return {
    // Data (vides)
    trips: [],
    favorites: [],
    checklistItems: [],
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
    getChecklistForTrip: () => [],
    
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