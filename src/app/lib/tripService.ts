// Service de gestion des voyages avec Supabase
import { supabase } from './supabase';
import { deleteAllTripStops, getTripStops } from './tripStopService';
import { handleAuthError, isAuthError } from './authErrorHandler';

// Re-exporter getTripStops pour faciliter l'import
export { getTripStops } from './tripStopService';

export interface TripStop {
  id: string;
  tripId: string;
  destinationId: string;
  destinationName: string;
  orderIndex: number;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  countryDestinationId: string;
  startDate: string;
  endDate: string;
  travelers: number;
  travelerProfile?: {
    type: 'solo' | 'couple' | 'family' | 'friends';
    pace: 'relax' | 'normal' | 'intense';
    interests: string[];
  } | null;
  activeCityDestinationId?: string | null;
  notes?: string | null;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TripWithChecklist extends Trip {
  checklistItems?: Array<{
    id: string;
    title: string;
    category: string;
    completed: boolean;
  }>;
  destinationCountry?: string;
  destinationImage?: string;
  stops?: TripStop[];
}

/**
 * Crée un nouveau voyage
 */
export async function createTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: trip.userId,
      destination_id: trip.destinationId,
      destination_name: trip.destinationName,
      country_destination_id: trip.countryDestinationId,
      start_date: trip.startDate,
      end_date: trip.endDate,
      travelers: trip.travelers,
      traveler_profile: trip.travelerProfile,
      active_city_destination_id: trip.activeCityDestinationId,
      notes: trip.notes,
      status: trip.status,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création du voyage:', error);
    throw error;
  }

  console.log('✅ Voyage créé:', data);
  
  return {
    id: data.id,
    userId: data.user_id,
    destinationId: data.destination_id,
    destinationName: data.destination_name,
    countryDestinationId: data.country_destination_id,
    startDate: data.start_date,
    endDate: data.end_date,
    travelers: data.travelers,
    travelerProfile: data.traveler_profile,
    activeCityDestinationId: data.active_city_destination_id,
    notes: data.notes,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Récupère tous les voyages d'un utilisateur
 */
export async function getUserTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur lors de la récupération des voyages:', error);
    throw error;
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    countryDestinationId: row.country_destination_id,
    startDate: row.start_date,
    endDate: row.end_date,
    travelers: row.travelers,
    travelerProfile: row.traveler_profile,
    activeCityDestinationId: row.active_city_destination_id,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Récupère les voyages complétés d'un utilisateur
 */
export async function getCompletedTrips(userId: string): Promise<TripWithChecklist[]> {
  const allTrips = await getUserTrips(userId);
  const completedTrips = allTrips.filter(trip => trip.status === 'completed');
  
  // Enrichir avec les données de checklist
  const tripsWithChecklists = await Promise.all(
    completedTrips.map(async (trip) => {
      const { data: checklistItems } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('trip_id', trip.id);

      return {
        ...trip,
        checklistItems: checklistItems?.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          completed: item.completed,
        })) || [],
      } as TripWithChecklist;
    })
  );

  return tripsWithChecklists;
}

/**
 * Récupère les voyages actifs d'un utilisateur
 */
export async function getActiveTrips(userId: string): Promise<Trip[]> {
  const allTrips = await getUserTrips(userId);
  return allTrips.filter(trip => trip.status === 'active' || trip.status === 'planned');
}

/**
 * Met à jour un voyage
 */
export async function updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
  const dbUpdates: any = {};
  
  if (updates.destinationId !== undefined) dbUpdates.destination_id = updates.destinationId;
  if (updates.destinationName !== undefined) dbUpdates.destination_name = updates.destinationName;
  if (updates.countryDestinationId !== undefined) dbUpdates.country_destination_id = updates.countryDestinationId;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.travelers !== undefined) dbUpdates.travelers = updates.travelers;
  if (updates.travelerProfile !== undefined) dbUpdates.traveler_profile = updates.travelerProfile;
  if (updates.activeCityDestinationId !== undefined) dbUpdates.active_city_destination_id = updates.activeCityDestinationId;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { error } = await supabase
    .from('trips')
    .update(dbUpdates)
    .eq('id', tripId);

  if (error) {
    console.error('❌ Erreur lors de la mise à jour du voyage:', error);
    throw error;
  }

  console.log('✅ Voyage mis à jour:', tripId);
}

/**
 * Marque un voyage comme terminé
 */
export async function completeTrip(tripId: string): Promise<void> {
  await updateTrip(tripId, { status: 'completed' });
  console.log('✅ Voyage marqué comme terminé:', tripId);
}

/**
 * Supprime un voyage
 */
export async function deleteTrip(tripId: string): Promise<void> {
  // Les suppressions en cascade sont gérées par Supabase
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (error) {
    console.error('❌ Erreur lors de la suppression du voyage:', error);
    throw error;
  }
  
  console.log('✅ Voyage supprimé:', tripId);
}

/**
 * Récupère un voyage par ID
 */
export async function getTripById(tripId: string): Promise<TripWithChecklist | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error) {
    console.error('❌ Erreur lors de la récupération du voyage:', error);
    return null;
  }

  if (!data) return null;

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('trip_id', tripId);

  const stops = await getTripStops(tripId);
  
  return {
    id: data.id,
    userId: data.user_id,
    destinationId: data.destination_id,
    destinationName: data.destination_name,
    countryDestinationId: data.country_destination_id,
    startDate: data.start_date,
    endDate: data.end_date,
    travelers: data.travelers,
    travelerProfile: data.traveler_profile,
    activeCityDestinationId: data.active_city_destination_id,
    notes: data.notes,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    checklistItems: checklistItems?.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      completed: item.completed,
    })) || [],
    stops,
  } as TripWithChecklist;
}

/**
 * Sauvegarde les items de checklist pour un voyage
 */
export async function saveChecklistForTrip(
  tripId: string, 
  userId: string, 
  items: Array<{ title: string; category: string; completed: boolean }>
): Promise<void> {
  // Supprimer les anciens items
  await supabase
    .from('checklist_items')
    .delete()
    .eq('trip_id', tripId);

  // Ajouter les nouveaux items
  const { error } = await supabase
    .from('checklist_items')
    .insert(
      items.map(item => ({
        user_id: userId,
        trip_id: tripId,
        title: item.title,
        category: item.category,
        completed: item.completed,
      }))
    );

  if (error) {
    console.error('❌ Erreur lors de la sauvegarde de la checklist:', error);
    throw error;
  }

  console.log('✅ Checklist sauvegardée pour le voyage:', tripId);
}

/**
 * Compte le nombre de voyages complétés
 */
export async function getCompletedTripsCount(userId: string): Promise<number> {
  const trips = await getCompletedTrips(userId);
  return trips.length;
}

/**
 * Met à jour la ville active d'un voyage
 */
export async function setActiveCityForTrip(tripId: string, cityDestinationId: string): Promise<void> {
  await updateTrip(tripId, { activeCityDestinationId: cityDestinationId });
  console.log('✅ Ville active mise à jour:', cityDestinationId);
}