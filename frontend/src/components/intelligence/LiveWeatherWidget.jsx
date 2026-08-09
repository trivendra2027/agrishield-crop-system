import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, CloudFog, ThermometerSnowflake, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveWeatherWidget = ({ telemetry }) => {
  // Pre-calculate pressure drops if we had historical data, but for now we'll use a simplified threshold logic
  // based on the raw telemetry data.
  
  let condition = "Calibrating Sensors...";
  let Icon = Cloud;
  let color = "text-slate-400";
  let bg = "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800";
  let description = "Waiting for live environmental data streams...";

  if (telemetry && Object.keys(telemetry).length > 0) {
    const lux = telemetry.light_lux ?? telemetry.light_intensity ?? 0;
    const isRaining = telemetry.rain_detected || telemetry.rain_sensor || false;
    const humidity = telemetry.humidity ?? 0;
    const temp = telemetry.temperature ?? 0;
    const pressure = telemetry.pressure ?? 1013; // 1013 hPa is standard sea level
    
    // Core Decision Matrix (Real-time IoT Weather Algorithms)
    if (isRaining) {
       condition = "Raining";
       Icon = CloudRain;
       color = "text-blue-500";
       bg = "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50";
       description = "Moisture detected on physical rain sensor.";
    } 
    else if (pressure < 1000 && lux < 10000) {
       condition = "Storm Approaching";
       Icon = Zap;
       color = "text-purple-500";
       bg = "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800/50";
       description = "Low barometric pressure & low light indicates storms.";
    }
    else if (humidity > 90 && temp < 18) {
       condition = "Foggy / Frost Risk";
       Icon = CloudFog;
       color = "text-slate-500";
       bg = "bg-slate-100 border-slate-300 dark:bg-slate-800/80 dark:border-slate-700";
       description = "High RH% and low temps nearing the dew point.";
    } 
    else if (lux > 25000) {
       condition = "Sunny & Clear";
       Icon = Sun;
       color = "text-amber-500";
       bg = "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800/50";
       description = "Direct solar irradiance detected (>25k Lux).";
    } 
    else if (lux > 8000) {
       condition = "Partly Cloudy";
       Icon = Cloud;
       color = "text-sky-500";
       bg = "bg-sky-50 border-sky-200 dark:bg-sky-900/30 dark:border-sky-800/50";
       description = "Diffused sunlight detected (8k-25k Lux).";
    } 
    else {
       condition = "Overcast / Night";
       Icon = Cloud;
       color = "text-indigo-400";
       bg = "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800/50";
       description = "Low ambient light levels detected (<8k Lux).";
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border-2 shadow-sm transition-all duration-500 flex items-center justify-between h-full ${bg}`}
    >
      <div>
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color.replace('text', 'bg')}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${color.replace('text', 'bg')}`}></span>
          </span>
          Live IoT Weather Intelligence
        </h3>
        <div className="flex items-center gap-4">
          <Icon className={`w-10 h-10 ${color}`} />
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{condition}</h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="text-right hidden sm:block bg-white/50 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
         <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
           {telemetry?.temperature != null ? `${telemetry.temperature.toFixed(1)}°` : '--°'}
         </div>
         <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
           Feels Like Local
         </div>
      </div>
    </motion.div>
  );
};

export default LiveWeatherWidget;
