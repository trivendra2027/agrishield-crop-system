import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Wind, Droplets, Sun, Clock, ThermometerSnowflake } from 'lucide-react';
import { motion } from 'framer-motion';

const SprayAdvisorWidget = ({ telemetry }) => {
  let status = "Waiting for Data";
  let message = "Calculating optimal application windows...";
  let isOptimal = false;
  let color = "text-slate-400";
  let bg = "bg-slate-50 dark:bg-slate-900/50";
  let bgGradient = "";
  
  let tempStatus = "ok";
  let windStatus = "ok"; 
  let rainStatus = "ok";
  let sunStatus = "ok";

  if (telemetry && Object.keys(telemetry).length > 0) {
    const lux = telemetry.light_lux ?? telemetry.light_intensity ?? 0;
    const isRaining = telemetry.rain_detected || telemetry.rain_sensor || false;
    const humidity = telemetry.humidity ?? 0;
    const temp = telemetry.temperature ?? 0;
    const pressure = telemetry.pressure ?? 1013;

    // Evaluate individual conditions
    
    // 1. Rain check (Chemicals will wash away)
    if (isRaining) rainStatus = "bad";
    else if (pressure < 1000) rainStatus = "warn"; // Storm approaching
    
    // 2. Temp check (Leaves burn if sprayed > 28C, chemicals ineffective < 10C)
    if (temp > 28 || temp < 10) tempStatus = "bad";
    else if (temp > 25 || temp < 15) tempStatus = "warn";
    
    // 3. Sun check (Direct UV breaks down chemicals and burns wet leaves)
    if (lux > 25000) sunStatus = "bad";
    else if (lux > 15000) sunStatus = "warn";
    
    // 4. Humidity/Evaporation check (Too dry = chemicals evaporate before absorbing)
    if (humidity < 40) windStatus = "bad"; // Proxy for high evap rate

    // Calculate final decision
    if (rainStatus === "bad" || tempStatus === "bad" || sunStatus === "bad") {
      isOptimal = false;
      status = "Do Not Spray";
      color = "text-rose-500";
      bg = "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900";
      bgGradient = "from-rose-500/10 to-transparent";
      
      if (rainStatus === "bad") message = "Active precipitation. Chemicals will wash off instantly.";
      else if (tempStatus === "bad") message = "Extreme temperatures. High risk of crop burn.";
      else if (sunStatus === "bad") message = "Peak solar irradiance. Chemicals will degrade/burn leaves.";
    } 
    else if (rainStatus === "warn" || tempStatus === "warn" || sunStatus === "warn" || windStatus === "bad") {
      isOptimal = false;
      status = "Marginal Window";
      color = "text-amber-500";
      bg = "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900";
      bgGradient = "from-amber-500/10 to-transparent";
      message = "Conditions are not ideal. Wait for twilight or cooler temperatures.";
    } 
    else {
      isOptimal = true;
      status = "Optimal Spray Window";
      color = "text-emerald-500";
      bg = "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900";
      bgGradient = "from-emerald-500/10 to-transparent";
      message = "Perfect conditions for pesticide or foliar fertilizer application.";
    }
  }

  const ConditionPill = ({ label, state, icon: Icon }) => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      state === "ok" ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400" :
      state === "warn" ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400" :
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400"
    }`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-5 rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col justify-between ${bg}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} pointer-events-none`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Application Advisor
          </h3>
          {isOptimal ? <CheckCircle className={`w-6 h-6 ${color}`} /> : <ShieldAlert className={`w-6 h-6 ${color}`} />}
        </div>
        
        <h2 className={`text-2xl font-black mb-1 ${color}`}>{status}</h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-5">{message}</p>
        
        <div className="flex flex-wrap gap-2">
          <ConditionPill label="Rain" state={rainStatus} icon={Droplets} />
          <ConditionPill label="Temp" state={tempStatus} icon={ThermometerSnowflake} />
          <ConditionPill label="Sun" state={sunStatus} icon={Sun} />
          <ConditionPill label="Evap" state={windStatus} icon={Wind} />
        </div>
      </div>
    </motion.div>
  );
};

export default SprayAdvisorWidget;
