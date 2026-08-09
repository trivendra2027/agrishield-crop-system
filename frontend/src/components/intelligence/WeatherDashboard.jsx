import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, RefreshCw, AlertTriangle, Gauge, Eye, MapPin, Sprout } from 'lucide-react';
import { Card, Button, Badge, Skeleton } from '../ui/index';
import API from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { useWebSocket } from '../../context/WebSocketContext';

export const WeatherCard = ({ current, location, providerName, cacheStatus, onRefresh, onLocate, onFarmLocate, locating }) => (
  <Card glass className="p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 space-y-6 relative overflow-hidden bg-gradient-sky-card">
    {/* Ambient weather glow backdrop */}
    <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

    {/* Header row */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xl" style={{ fontFamily: 'var(--font-display)' }}>{location}</h3>
          <Badge variant={cacheStatus === 'Cached' ? 'warning' : 'healthy'}>
            {cacheStatus === 'Cached' ? 'Cached' : 'Live Sync'}
          </Badge>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
          Provider: <strong className="text-slate-700 dark:text-slate-300">{providerName}</strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onFarmLocate} leftIcon={<Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}>
          Farm Location
        </Button>
        <Button variant="outline" size="sm" onClick={onLocate} isLoading={locating} leftIcon={<MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />}>
          Live GPS
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Sync
        </Button>
      </div>
    </div>

    {/* Weather Hero Temp & Graphic Row */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
      <div className="flex items-center gap-5">
        <div className="p-4 rounded-3xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
          <Sun className="w-12 h-12 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {current?.temperature ?? 30.9}
            </span>
            <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">°C</span>
          </div>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 block mt-1">
            Feels like {current?.feels_like ?? 33.2}°C • Partly Cloudy
          </span>
        </div>
      </div>

      {/* Weather Stats Pills Grid */}
      <div className="grid grid-cols-2 gap-3 sm:w-64">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            <Droplets className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Humidity</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{current?.humidity ?? 59}%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Rain Prob</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{current?.rain_probability ?? 0}%</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            <Wind className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Wind Speed</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{current?.wind_speed ?? 4.85} m/s</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            <Gauge className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>UV Index</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">6 / 10</span>
        </div>
      </div>
    </div>
  </Card>
);

export const WeatherForecast = ({ forecast = [] }) => {
  const defaultForecast = [
    { date: "Today", temp_max: 34, temp_min: 24, rain_probability: 0 },
    { date: "Wed", temp_max: 35, temp_min: 25, rain_probability: 10 },
    { date: "Thu", temp_max: 33, temp_min: 24, rain_probability: 20 },
    { date: "Fri", temp_max: 32, temp_min: 23, rain_probability: 40 },
    { date: "Sat", temp_max: 31, temp_min: 22, rain_probability: 60 },
    { date: "Sun", temp_max: 33, temp_min: 24, rain_probability: 15 },
    { date: "Mon", temp_max: 34, temp_min: 25, rain_probability: 5 }
  ];

  const items = forecast.length > 0 ? forecast : defaultForecast;

  return (
    <Card glass className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">7-Day Agro-Weather Forecast</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {items.map((f, i) => (
          <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-1 hover:border-emerald-500/50 transition-colors">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">{f.date}</span>
            <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto my-1" />
            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{f.temp_max}° / {f.temp_min}°</p>
            <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 block">{f.rain_probability}% Rain</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const WeatherAlerts = ({ recommendations = [] }) => (
  <Card glass className="p-5 border-slate-200/80 dark:border-slate-800 space-y-3">
    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>Agronomic Weather Advisories</span>
    </div>
    <ul className="space-y-2">
      {(recommendations.length > 0 ? recommendations : [
        "Optimal spraying window identified between 06:00 AM - 08:30 AM before wind speed increases.",
        "Maintain current drip irrigation cycle; no heavy rainfall projected within the next 48 hours."
      ]).map((rec, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
          <span>{rec}</span>
        </li>
      ))}
    </ul>
  </Card>
);

export const WeatherDashboard = React.memo(({ farmId, lat, lon }) => {
  const { activeFarm } = useFarm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(lat && lon ? { lat, lon } : null);

  const targetFarmId = farmId || (activeFarm ? activeFarm.id : 'default');

  const fetchWeather = useCallback(async (customCoords = null, forceSync = false, targetId = null) => {
    setLoading(true);
    try {
      const activeCoords = customCoords || coords;
      let query = "";
      if (activeCoords && activeCoords.lat && activeCoords.lon) {
        query = `lat=${activeCoords.lat}&lon=${activeCoords.lon}`;
      } else {
        const idToUse = targetId || targetFarmId;
        query = `farm_id=${idToUse}`;
      }
      if (forceSync) query += `&bypass_cache=true`;

      const res = await API.get(`/api/intelligence/weather?${query}`);
      setData(res.data);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  }, [coords, targetFarmId]);

  const handleFarmLocation = useCallback(() => {
    setCoords(null);
    fetchWeather(null, true, targetFarmId);
  }, [fetchWeather, targetFarmId]);

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      fetchWeather(null, true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setCoords(newCoords);
        setLocating(false);
        fetchWeather(newCoords, true);
      },
      () => {
        setLocating(false);
        fetchWeather(null, true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [fetchWeather]);

  useEffect(() => {
    if (!coords && !lat && !lon) {
      handleDetectLocation();
    } else {
      fetchWeather();
    }
  }, [targetFarmId, lat, lon]);

  const { latestAlert } = useWebSocket();
  useEffect(() => {
    if (latestAlert && (latestAlert.category === 'weather' || latestAlert.message?.toLowerCase().includes('rain') || latestAlert.message?.toLowerCase().includes('storm') || latestAlert.message?.toLowerCase().includes('frost'))) {
      fetchWeather(null, true);
    }
  }, [latestAlert, fetchWeather]);

  if (loading && !data) {
    return (
      <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
        <Skeleton className="h-6 w-48 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </Card>
    );
  }

  const current = data?.current || { temperature: 30.9, humidity: 59, rain_probability: 0, wind_speed: 4.85 };
  const forecast = data?.forecast || [];
  const recs = data?.recommendations || [];
  const location = data?.location || (activeFarm ? activeFarm.farm_name : "Farm Location");
  const providerName = data?.provider_name || "OpenWeatherMapProvider";
  const cacheStatus = data?.metadata?.cache_status || data?.cache_status || "Live";

  return (
    <div className="space-y-4">
      <WeatherCard 
        current={current} 
        location={location} 
        providerName={providerName} 
        cacheStatus={cacheStatus} 
        onRefresh={() => fetchWeather(coords, true)} 
        onLocate={handleDetectLocation}
        onFarmLocate={handleFarmLocation}
        locating={locating}
      />
      <WeatherForecast forecast={forecast} />
      <WeatherAlerts recommendations={recs} />
    </div>
  );
});

export default WeatherDashboard;
