// API interne pour gérer toutes les opérations de données

import { db, Trip, Favorite, FollowedTip, ChecklistItem } from './db';
import { generateId } from './crypto';

/**
 * TRIPS - Gestion des voyages
 */

export async function createTrip(
  userId: string,
  destinationId: string,
  destinationName: string,
  startDate: string,
  endDate: string,
  travelers: number,
  notes?: string
): Promise<Trip> {
  const now = new Date().toISOString();
  
  const trip: Trip = {
    id: generateId(),
    userId,
    destinationId,
    destinationName,
    startDate,
    endDate,
    travelers,
    notes,
    status: 'planned',
    createdAt: now,
    updatedAt: now,
  };

  await db.add('trips', trip);
  console.log('✅ Voyage créé:', trip.destinationName);
  return trip;
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const trips = await db.getAllByIndex<Trip>('trips', 'userId', userId);
  return trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  return await db.get<Trip>('trips', tripId);
}

export async function updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
  const trip = await db.get<Trip>('trips', tripId);
  if (!trip) {
    throw new Error('TRIP_NOT_FOUND');
  }

  const updatedTrip: Trip = {
    ...trip,
    ...updates,
    id: trip.id,
    userId: trip.userId,
    updatedAt: new Date().toISOString(),
  };

  await db.update('trips', updatedTrip);
  console.log('✅ Voyage mis à jour:', updatedTrip.destinationName);
  return updatedTrip;
}

export async function deleteTrip(tripId: string): Promise<void> {
  await db.delete('trips', tripId);
  // Supprimer aussi les checklist items associés
  await db.deleteAllByIndex('checklistItems', 'tripId', tripId);
  console.log('✅ Voyage supprimé');
}

export async function getTripsByStatus(userId: string, status: Trip['status']): Promise<Trip[]> {
  const allTrips = await getUserTrips(userId);
  return allTrips.filter(trip => trip.status === status);
}

/**
 * FAVORITES - Gestion des destinations favorites
 */

export async function addFavorite(userId: string, destinationId: string): Promise<Favorite> {
  // Vérifier si déjà en favori
  const existing = await getUserFavorites(userId);
  const alreadyFavorite = existing.some(fav => fav.destinationId === destinationId);
  
  if (alreadyFavorite) {
    throw new Error('ALREADY_FAVORITE');
  }

  const favorite: Favorite = {
    id: generateId(),
    userId,
    destinationId,
    createdAt: new Date().toISOString(),
  };

  await db.add('favorites', favorite);
  console.log('✅ Favori ajouté:', destinationId);
  return favorite;
}

export async function removeFavorite(userId: string, destinationId: string): Promise<void> {
  const favorites = await getUserFavorites(userId);
  const favorite = favorites.find(fav => fav.destinationId === destinationId);
  
  if (favorite) {
    await db.delete('favorites', favorite.id);
    console.log('✅ Favori retiré:', destinationId);
  }
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  return await db.getAllByIndex<Favorite>('favorites', 'userId', userId);
}

export async function isFavorite(userId: string, destinationId: string): Promise<boolean> {
  const favorites = await getUserFavorites(userId);
  return favorites.some(fav => fav.destinationId === destinationId);
}

/**
 * FOLLOWED TIPS - Gestion des conseils suivis
 */

export async function followTip(userId: string, tipId: string): Promise<FollowedTip> {
  // Vérifier si déjà suivi
  const existing = await getFollowedTips(userId);
  const alreadyFollowed = existing.some(tip => tip.tipId === tipId);
  
  if (alreadyFollowed) {
    throw new Error('ALREADY_FOLLOWED');
  }

  const followedTip: FollowedTip = {
    id: generateId(),
    userId,
    tipId,
    createdAt: new Date().toISOString(),
  };

  await db.add('followedTips', followedTip);
  console.log('✅ Conseil suivi:', tipId);
  return followedTip;
}

export async function unfollowTip(userId: string, tipId: string): Promise<void> {
  const tips = await getFollowedTips(userId);
  const tip = tips.find(t => t.tipId === tipId);
  
  if (tip) {
    await db.delete('followedTips', tip.id);
    console.log('✅ Conseil non suivi:', tipId);
  }
}

export async function getFollowedTips(userId: string): Promise<FollowedTip[]> {
  return await db.getAllByIndex<FollowedTip>('followedTips', 'userId', userId);
}

export async function isFollowingTip(userId: string, tipId: string): Promise<boolean> {
  const tips = await getFollowedTips(userId);
  return tips.some(tip => tip.tipId === tipId);
}

/**
 * CHECKLIST - Gestion des listes de vérification
 */

export async function createChecklistItem(
  userId: string,
  title: string,
  category: string,
  tripId?: string
): Promise<ChecklistItem> {
  const now = new Date().toISOString();
  
  const item: ChecklistItem = {
    id: generateId(),
    userId,
    tripId,
    title,
    category,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('checklistItems', item);
  console.log('✅ Item checklist créé:', item.title);
  return item;
}

export async function getUserChecklistItems(userId: string, tripId?: string): Promise<ChecklistItem[]> {
  const allItems = await db.getAllByIndex<ChecklistItem>('checklistItems', 'userId', userId);
  
  if (tripId) {
    return allItems.filter(item => item.tripId === tripId);
  }
  
  return allItems;
}

export async function updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
  const item = await db.get<ChecklistItem>('checklistItems', itemId);
  if (!item) {
    throw new Error('ITEM_NOT_FOUND');
  }

  const updatedItem: ChecklistItem = {
    ...item,
    ...updates,
    id: item.id,
    userId: item.userId,
    updatedAt: new Date().toISOString(),
  };

  await db.update('checklistItems', updatedItem);
  console.log('✅ Item checklist mis à jour');
  return updatedItem;
}

export async function toggleChecklistItem(itemId: string): Promise<ChecklistItem> {
  const item = await db.get<ChecklistItem>('checklistItems', itemId);
  if (!item) {
    throw new Error('ITEM_NOT_FOUND');
  }

  const updatedItem: ChecklistItem = {
    ...item,
    completed: !item.completed,
    updatedAt: new Date().toISOString(),
  };

  await db.update('checklistItems', updatedItem);
  console.log('✅ Item checklist basculé:', updatedItem.completed);
  return updatedItem;
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  await db.delete('checklistItems', itemId);
  console.log('✅ Item checklist supprimé');
}

/**
 * STATISTICS - Statistiques utilisateur
 */

export async function getUserStats(userId: string) {
  const trips = await getUserTrips(userId);
  const favorites = await getUserFavorites(userId);
  const followedTips = await getFollowedTips(userId);
  const checklistItems = await getUserChecklistItems(userId);

  return {
    totalTrips: trips.length,
    plannedTrips: trips.filter(t => t.status === 'planned').length,
    activeTrips: trips.filter(t => t.status === 'active').length,
    completedTrips: trips.filter(t => t.status === 'completed').length,
    totalFavorites: favorites.length,
    totalFollowedTips: followedTips.length,
    totalChecklistItems: checklistItems.length,
    completedChecklistItems: checklistItems.filter(i => i.completed).length,
  };
}

/**
 * Initialise les données par défaut pour un nouvel utilisateur
 * NOTE: Cette fonction est maintenant désactivée car nous utilisons Supabase.
 * Les données par défaut peuvent être créées via des triggers SQL si nécessaire.
 */
export async function initializeDefaultData(userId: string): Promise<void> {
  console.log('📦 Initialisation des données par défaut pour:', userId);
  console.log('ℹ️  Fonction désactivée - Migration Supabase complète');
  
  // Cette fonction était utilisée pour initialiser IndexedDB
  // Avec Supabase, l'initialisation se fait via des triggers SQL
  // ou lors de la première utilisation de l'application
  
  console.log('✅ Données par défaut prêtes (Supabase)');
}