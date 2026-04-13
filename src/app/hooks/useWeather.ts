import { useState, useEffect } from 'react';
import { fetchWeatherData, WeatherData } from '../services/weatherService';

export function useWeather(cityName: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWeatherData(cityName);
        
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Impossible de charger la météo');
          setLoading(false);
        }
      }
    }

    if (cityName) {
      loadWeather();
    }

    return () => {
      isMounted = false;
    };
  }, [cityName]);

  return { weather, loading, error };
}
