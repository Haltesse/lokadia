// Service de gestion des étapes de voyage (TripStops) avec Supabase
import { supabase } from './supabase';

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

export interface TripSegment {
  id: string;
  tripId: string;
  fromStopId: string;
  toStopId: string;
  recommendedMode: string;
  alternatives: any;
  distanceKm: number;
  durationMinEstimated: number;
  metadata?: any | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crée une nouvelle étape de voyage
 */
export async function createTripStop(
  stop: Omit<TripStop, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TripStop> {
  const { data, error } = await supabase
    .from('trip_stops')
    .insert({
      trip_id: stop.tripId,
      destination_id: stop.destinationId,
      destination_name: stop.destinationName,
      order_index: stop.orderIndex,
      start_date: stop.startDate,
      end_date: stop.endDate,
      notes: stop.notes,
      latitude: stop.latitude,
      longitude: stop.longitude,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création de l\'étape:', error);
    throw error;
  }

  console.log('✅ Étape créée:', data);
  
  return {
    id: data.id,
    tripId: data.trip_id,
    destinationId: data.destination_id,
    destinationName: data.destination_name,
    orderIndex: data.order_index,
    startDate: data.start_date,
    endDate: data.end_date,
    notes: data.notes,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Récupère toutes les étapes d'un voyage (triées par ordre)
 */
export async function getTripStops(tripId: string): Promise<TripStop[]> {
  const { data, error } = await supabase
    .from('trip_stops')
    .select('*')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('❌ Erreur lors de la récupération des étapes:', error);
    throw error;
  }

  return data.map(row => ({
    id: row.id,
    tripId: row.trip_id,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    orderIndex: row.order_index,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Met à jour une étape
 */
export async function updateTripStop(
  stopId: string,
  updates: Partial<TripStop>
): Promise<void> {
  const dbUpdates: any = {};
  
  if (updates.destinationId !== undefined) dbUpdates.destination_id = updates.destinationId;
  if (updates.destinationName !== undefined) dbUpdates.destination_name = updates.destinationName;
  if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
  if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;

  const { error } = await supabase
    .from('trip_stops')
    .update(dbUpdates)
    .eq('id', stopId);

  if (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'étape:', error);
    throw error;
  }

  console.log('✅ Étape mise à jour:', stopId);
}

/**
 * Supprime une étape
 */
export async function deleteTripStop(stopId: string): Promise<void> {
  // Les suppressions en cascade sont gérées par Supabase
  const { error } = await supabase
    .from('trip_stops')
    .delete()
    .eq('id', stopId);

  if (error) {
    console.error('❌ Erreur lors de la suppression de l\'étape:', error);
    throw error;
  }

  console.log('✅ Étape supprimée:', stopId);
}

/**
 * Supprime toutes les étapes d'un voyage
 */
export async function deleteAllTripStops(tripId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_stops')
    .delete()
    .eq('trip_id', tripId);

  if (error) {
    console.error('❌ Erreur lors de la suppression des étapes:', error);
    throw error;
  }

  console.log('✅ Toutes les étapes supprimées pour le voyage:', tripId);
}

/**
 * Réordonne les étapes d'un voyage
 */
export async function reorderTripStops(
  tripId: string,
  stopIds: string[]
): Promise<void> {
  for (let i = 0; i < stopIds.length; i++) {
    await updateTripStop(stopIds[i], { orderIndex: i });
  }

  console.log('✅ Étapes réordonnées');
}

/**
 * Récupère un segment de trajet
 */
export async function getTripSegment(segmentId: string): Promise<TripSegment | null> {
  const { data, error } = await supabase
    .from('trip_segments')
    .select('*')
    .eq('id', segmentId)
    .single();

  if (error) {
    console.error('❌ Erreur lors de la récupération du segment:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    tripId: data.trip_id,
    fromStopId: data.from_stop_id,
    toStopId: data.to_stop_id,
    recommendedMode: data.recommended_mode,
    alternatives: data.alternatives,
    distanceKm: data.distance_km,
    durationMinEstimated: data.duration_min_estimated,
    metadata: data.metadata,
    source: data.source,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Récupère tous les segments d'un voyage
 */
export async function getTripSegments(tripId: string): Promise<TripSegment[]> {
  const { data, error } = await supabase
    .from('trip_segments')
    .select('*')
    .eq('trip_id', tripId);

  if (error) {
    console.error('❌ Erreur lors de la récupération des segments:', error);
    throw error;
  }

  return data.map(row => ({
    id: row.id,
    tripId: row.trip_id,
    fromStopId: row.from_stop_id,
    toStopId: row.to_stop_id,
    recommendedMode: row.recommended_mode,
    alternatives: row.alternatives,
    distanceKm: row.distance_km,
    durationMinEstimated: row.duration_min_estimated,
    metadata: row.metadata,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Crée un segment de trajet
 */
export async function createTripSegment(
  segment: Omit<TripSegment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TripSegment> {
  const { data, error } = await supabase
    .from('trip_segments')
    .insert({
      trip_id: segment.tripId,
      from_stop_id: segment.fromStopId,
      to_stop_id: segment.toStopId,
      recommended_mode: segment.recommendedMode,
      alternatives: segment.alternatives,
      distance_km: segment.distanceKm,
      duration_min_estimated: segment.durationMinEstimated,
      metadata: segment.metadata,
      source: segment.source,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création du segment:', error);
    throw error;
  }

  console.log('✅ Segment créé:', data);

  return {
    id: data.id,
    tripId: data.trip_id,
    fromStopId: data.from_stop_id,
    toStopId: data.to_stop_id,
    recommendedMode: data.recommended_mode,
    alternatives: data.alternatives,
    distanceKm: data.distance_km,
    durationMinEstimated: data.duration_min_estimated,
    metadata: data.metadata,
    source: data.source,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Supprime un segment
 */
export async function deleteTripSegment(segmentId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_segments')
    .delete()
    .eq('id', segmentId);

  if (error) {
    console.error('❌ Erreur lors de la suppression du segment:', error);
    throw error;
  }

  console.log('✅ Segment supprimé:', segmentId);
}

/**
 * Ajoute une étape à un voyage (fonction helper)
 */
export async function addStopToTrip(
  tripId: string,
  destinationId: string,
  destinationName: string,
  latitude?: number,
  longitude?: number
): Promise<TripStop> {
  // Récupérer les étapes existantes pour déterminer l'index
  const existingStops = await getTripStops(tripId);
  const orderIndex = existingStops.length;

  return await createTripStop({
    tripId,
    destinationId,
    destinationName,
    orderIndex,
    latitude: latitude || null,
    longitude: longitude || null,
  });
}