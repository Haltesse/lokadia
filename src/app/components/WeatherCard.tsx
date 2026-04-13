import React from 'react';
import { Wind, Droplets, Sunrise, Sunset, CloudOff } from 'lucide-react';
import { WeatherData, getWeatherEmoji, getTemperatureColor } from '../services/weatherService';

interface WeatherCardProps {
  weather: WeatherData;
  cityName: string;
}

export function WeatherCard({ weather, cityName }: WeatherCardProps) {
  const emoji = getWeatherEmoji(weather.condition);
  const gradientClass = getTemperatureColor(weather.temperature);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-6 text-white shadow-lg`}>
      {/* En-tête avec ville et emoji */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold opacity-90">Météo actuelle</h3>
          <p className="text-sm opacity-75">{cityName}</p>
        </div>
        <div className="text-5xl">{emoji}</div>
      </div>

      {/* Température principale */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold">{weather.temperature}°</span>
          <span className="text-2xl opacity-75">C</span>
        </div>
        <p className="text-lg capitalize mt-1 opacity-90">{weather.description}</p>
        <p className="text-sm opacity-75 mt-1">Ressenti {weather.feelsLike}°C</p>
      </div>

      {/* Détails météo */}
      <div className="grid grid-cols-2 gap-4">
        {/* Humidité */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <Droplets className="w-5 h-5" />
          <div>
            <p className="text-xs opacity-75">Humidité</p>
            <p className="text-lg font-semibold">{weather.humidity}%</p>
          </div>
        </div>

        {/* Vent */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <Wind className="w-5 h-5" />
          <div>
            <p className="text-xs opacity-75">Vent</p>
            <p className="text-lg font-semibold">{weather.windSpeed} km/h</p>
          </div>
        </div>

        {/* Lever du soleil */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <Sunrise className="w-5 h-5" />
          <div>
            <p className="text-xs opacity-75">Lever</p>
            <p className="text-sm font-semibold">{formatTime(weather.sunrise)}</p>
          </div>
        </div>

        {/* Coucher du soleil */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <Sunset className="w-5 h-5" />
          <div>
            <p className="text-xs opacity-75">Coucher</p>
            <p className="text-sm font-semibold">{formatTime(weather.sunset)}</p>
          </div>
        </div>
      </div>

      {/* Note API */}
      <div className="mt-4 text-xs opacity-60 text-center">
        Données météo en temps réel
      </div>
    </div>
  );
}

interface WeatherCardSkeletonProps {
  error?: boolean;
}

export function WeatherCardSkeleton({ error }: WeatherCardSkeletonProps) {
  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-center">
          <CloudOff className="mx-auto mb-2" size={48} />
          <p className="text-lg font-semibold mb-2">Météo indisponible</p>
          <p className="text-sm opacity-75">Impossible de charger les données météo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl p-6 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-5 w-32 bg-white/30 rounded mb-2"></div>
          <div className="h-4 w-20 bg-white/20 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-white/30 rounded-full"></div>
      </div>

      <div className="mb-6">
        <div className="h-16 w-32 bg-white/30 rounded mb-2"></div>
        <div className="h-5 w-40 bg-white/20 rounded mb-1"></div>
        <div className="h-4 w-28 bg-white/20 rounded"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/10 rounded-xl p-3">
            <div className="h-4 w-16 bg-white/20 rounded mb-1"></div>
            <div className="h-5 w-12 bg-white/30 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}