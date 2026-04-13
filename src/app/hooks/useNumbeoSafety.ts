import { useState, useEffect } from "react";
import { fetchNumbeoSafety, type NumbeoSafetyData, invalidateNumbeoCache } from "../services/numbeoService";

interface UseNumbeoSafetyResult {
  safetyData: NumbeoSafetyData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook pour récupérer les données de sécurité Numbeo en temps réel
 * 
 * @param destinationId - ID de la destination (ex: "paris-france")
 * @param autoRefresh - Activer le rafraîchissement automatique toutes les heures (défaut: true)
 */
export function useNumbeoSafety(
  destinationId: string | undefined,
  autoRefresh: boolean = true
): UseNumbeoSafetyResult {
  const [safetyData, setSafetyData] = useState<NumbeoSafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSafetyData = async (forceRefresh = false) => {
    if (!destinationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Forcer une nouvelle requête si demandé
      if (forceRefresh) {
        invalidateNumbeoCache(destinationId);
      }

      const data = await fetchNumbeoSafety(destinationId);
      setSafetyData(data);
      
      console.log("✅ useNumbeoSafety - Données chargées:", data.cityName, data.safetyIndex);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("❌ useNumbeoSafety - Erreur:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand destinationId change
  useEffect(() => {
    loadSafetyData();
  }, [destinationId]);

  // Auto-refresh toutes les heures si activé
  useEffect(() => {
    if (!autoRefresh || !destinationId) return;

    const interval = setInterval(() => {
      console.log("🔄 useNumbeoSafety - Rafraîchissement automatique");
      loadSafetyData(true);
    }, 60 * 60 * 1000); // 1 heure

    return () => clearInterval(interval);
  }, [autoRefresh, destinationId]);

  const refresh = () => {
    console.log("🔄 useNumbeoSafety - Rafraîchissement manuel");
    loadSafetyData(true);
  };

  return {
    safetyData,
    loading,
    error,
    refresh,
  };
}
