import { useState, useEffect } from 'react';
import { fetchWeatherData, WeatherData } from '../services/weatherService';

/**
 * Météo courante d'une destination.
 *
 * Prend l'identifiant de la destination (« tokyo-japan »), pas son nom :
 * Open-Meteo est interrogé par coordonnées, résolues depuis
 * `destinationCoordinates`.
 */
export function useWeather(destinationId: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWeatherData(destinationId);
        
        if (isMounted) {
          setWeather(data);
          // `null` = relevé indisponible. On le signale plutôt que de laisser
          // une carte vide : il n'y a aucune valeur de repli à afficher.
          if (!data) setError("Météo indisponible pour cette destination");
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Impossible de charger la météo");
          setLoading(false);
        }
      }
    }

    if (destinationId) {
      loadWeather();
    }

    return () => {
      isMounted = false;
    };
  }, [destinationId]);

  return { weather, loading, error };
}
