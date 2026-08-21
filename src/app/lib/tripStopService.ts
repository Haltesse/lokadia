// Service de gestion des étapes de voyage (TripStops) avec Supabase
import { supabase } from './supabase';
import type { Database } from './database.types';

import type { TransportOption } from './transportService';

type TripStopRow = Database['public']['Tables']['trip_stops']['Row'];
type TripSegmentRow = Database['public']['Tables']['trip_segments']['Row'];
type TripStopUpdate = Database['public']['Tables']['trip_stops']['Update'];
type Json = Database['public']['Tables']['trip_segments']['Row']['metadata'];

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

/**
 * Contenu de la colonne jsonb `metadata` d'un segment. Champs connus
 * explicites, le reste ouvert : c'est du JSON libre côté base.
 */
export interface TripSegmentMetadata {
  /** Mode retenu par le voyageur, prioritaire sur le mode recommandé. */
  selectedMode?: string;
  /** Pass transport conseillé pour la zone (JR Pass, Interrail…). */
  passRecommended?: string;
  bookingAdvice?: string;
  luggageNotes?: string;
  tips?: string[];
  [key: string]: unknown;
}

export interface TripSegment {
  id: string;
  tripId: string;
  fromStopId: string;
  toStopId: string;
  recommendedMode: string;
  alternatives: TransportOption[];
  distanceKm: number;
  durationMinEstimated: number;
  metadata?: TripSegmentMetadata | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/** Normalise une ligne DB → TripStop (timestamps nullables ramenés à ''). */
function mapStopRow(row: TripStopRow): TripStop {
  return {
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
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

/** Normalise une ligne DB → TripSegment. */
function mapSegmentRow(row: TripSegmentRow): TripSegment {
  return {
    id: row.id,
    tripId: row.trip_id,
    fromStopId: row.from_stop_id,
    toStopId: row.to_stop_id,
    recommendedMode: row.recommended_mode,
    alternatives: (row.alternatives ?? []) as unknown as TransportOption[],
    distanceKm: row.distance_km,
    durationMinEstimated: row.duration_min_estimated,
    metadata: row.metadata as TripSegmentMetadata | null,
    source: row.source ?? 'estimation',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
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

  return mapStopRow(data);
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

  return data.map(mapStopRow);
}

/**
 * Met à jour une étape
 */
export async function updateTripStop(
  stopId: string,
  updates: Partial<TripStop>
): Promise<void> {
  const dbUpdates: TripStopUpdate = {};
  
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

  return mapSegmentRow(data);
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

  return data.map(mapSegmentRow);
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
      alternatives: segment.alternatives as unknown as Json,
      distance_km: segment.distanceKm,
      duration_min_estimated: segment.durationMinEstimated,
      metadata: (segment.metadata ?? null) as unknown as Json,
      source: segment.source,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création du segment:', error);
    throw error;
  }

  console.log('✅ Segment créé:', data);

  return mapSegmentRow(data);
}

/**
 * Met à jour le mode de transport choisi par l'utilisateur pour un segment.
 * Stocké dans metadata.selectedMode (jsonb — pas besoin de migration).
 */
export async function updateTripSegmentMode(
  segmentId: string,
  selectedMode: string,
  existingMetadata?: TripSegmentMetadata | null
): Promise<void> {
  const metadata = { ...(existingMetadata || {}), selectedMode };
  const { error } = await supabase
    .from('trip_segments')
    .update({ metadata })
    .eq('id', segmentId);
  if (error) {
    console.error('❌ Erreur mise à jour mode segment:', error);
    throw error;
  }
}

/**
 * Crée les segments manquants pour un voyage (à appeler si trip_segments est vide).
 * Les segments sont calculés à la volée depuis les stops + calculateTransportOptions.
 */
export async function ensureTripSegments(
  tripId: string,
  stops: TripStop[]
): Promise<TripSegment[]> {
  const existing = await getTripSegments(tripId);
  if (existing.length > 0) return existing;
  if (stops.length < 2) return [];

  // Import dynamique pour éviter la dépendance circulaire
  const { createTripSegment: buildSegment } = await import('./transportService');

  const created: TripSegment[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    try {
      const segData = buildSegment(tripId, stops[i], stops[i + 1]);
      const seg = await createTripSegment(segData);
      created.push(seg);
    } catch (e) {
      console.warn('⚠️ Impossible de créer le segment', i, e);
    }
  }
  return created;
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