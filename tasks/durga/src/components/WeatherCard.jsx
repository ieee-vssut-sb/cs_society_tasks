import { useEffect, useState } from 'react';
import { FiThermometer, FiDroplet, FiWind, FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiZap, FiAlertCircle } from 'react-icons/fi';
import { fetchWeatherDetails } from '../services/api';

export default function WeatherCard({ friend1, friend2 }) {
  const [weather1, setWeather1] = useState(null);
  const [weather2, setWeather2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!friend1 || !friend2) return;

    const loadWeather = async () => {
      setLoading(true);
      setError('');
      try {
        const [w1, w2] = await Promise.all([
          fetchWeatherDetails(friend1.lat, friend1.lon),
          fetchWeatherDetails(friend2.lat, friend2.lon)
        ]);
        setWeather1(w1);
        setWeather2(w2);
      } catch (err) {
        setError('Failed to retrieve climate details from Open-Meteo.');
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [friend1, friend2]);

  if (!friend1 || !friend2) return null;

  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <FiSun className="w-8 h-8 text-amber-400 animate-spin-slow" />;
    if (code === 2 || code === 3) return <FiCloud className="w-8 h-8 text-blue-300" />;
    if (code === 45 || code === 48) return <FiCloud className="w-8 h-8 text-slate-400 opacity-60" />;
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return <FiCloudRain className="w-8 h-8 text-blue-400" />;
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return <FiCloudSnow className="w-8 h-8 text-sky-200" />;
    }
    if ([95, 96, 99].includes(code)) return <FiZap className="w-8 h-8 text-purple-400 animate-pulse" />;
    return <FiCloud className="w-8 h-8 text-slate-300" />;
  };

  const getWeatherText = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if ([51, 53, 55].includes(code)) return 'Drizzle';
    if ([61, 63, 65].includes(code)) return 'Rainy';
    if ([66, 67].includes(code)) return 'Freezing Rain';
    if ([71, 73, 75].includes(code)) return 'Snowfall';
    if ([80, 81, 82].includes(code)) return 'Rain Showers';
    if ([85, 86].includes(code)) return 'Snow Showers';
    if ([95, 96, 99].includes(code)) return 'Thunderstorm';
    return 'Cloudy';
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-6 text-zinc-100 flex items-center gap-2">
        <FiThermometer className="w-5 h-5 text-orange-500" />
        Atmospheric Conditions Comparison
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <span className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-500 font-medium">Fetching meteorological models...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : weather1 && weather2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-orange-500/10">
          <div className="space-y-4 pb-6 md:pb-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-orange-400">{friend1.city || 'Friend 1 Location'}</span>
              <div className="flex items-center gap-2">
                {getWeatherIcon(weather1.weather_code)}
                <span className="text-sm font-semibold text-white">{getWeatherText(weather1.weather_code)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-orange-500/[0.03] border border-orange-500/10 p-3 rounded-xl flex flex-col items-center">
                <FiThermometer className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-xs text-zinc-500 font-semibold uppercase">Temp</span>
                <span className="text-base font-bold text-white">{weather1.temperature_2m}°C</span>
              </div>
              <div className="bg-orange-500/[0.03] border border-orange-500/10 p-3 rounded-xl flex flex-col items-center">
                <FiDroplet className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-xs text-zinc-500 font-semibold uppercase">Humidity</span>
                <span className="text-base font-bold text-white">{weather1.relative_humidity_2m}%</span>
              </div>
              <div className="bg-orange-500/[0.03] border border-orange-500/10 p-3 rounded-xl flex flex-col items-center">
                <FiWind className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-xs text-zinc-500 font-semibold uppercase">Wind</span>
                <span className="text-base font-bold text-white text-center truncate max-w-full">{weather1.wind_speed_10m} km/h</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400">{friend2.city || 'Friend 2 Location'}</span>
              <div className="flex items-center gap-2">
                {getWeatherIcon(weather2.weather_code)}
                <span className="text-sm font-semibold text-white">{getWeatherText(weather2.weather_code)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-500/[0.03] border border-amber-500/10 p-3 rounded-xl flex flex-col items-center">
                <FiThermometer className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs text-zinc-500 font-semibold uppercase">Temp</span>
                <span className="text-base font-bold text-white">{weather2.temperature_2m}°C</span>
              </div>
              <div className="bg-amber-500/[0.03] border border-amber-500/10 p-3 rounded-xl flex flex-col items-center">
                <FiDroplet className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs text-zinc-500 font-semibold uppercase">Humidity</span>
                <span className="text-base font-bold text-white">{weather2.relative_humidity_2m}%</span>
              </div>
              <div className="bg-amber-500/[0.03] border border-amber-500/10 p-3 rounded-xl flex flex-col items-center">
                <FiWind className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs text-zinc-500 font-semibold uppercase">Wind</span>
                <span className="text-base font-bold text-white text-center truncate max-w-full">{weather2.wind_speed_10m} km/h</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
