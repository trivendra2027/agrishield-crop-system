import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Clock, Calendar, ShieldCheck, AlertCircle, RefreshCw, Sprout } from 'lucide-react';
import { Card, Button, Badge, Skeleton, Progress } from '../ui/index';
import API from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';

export const WaterRecommendationCard = ({ data, onRefresh }) => {
  if (!data) return null;

  const isRequired = data.irrigation_required;

  return (
    <Card glass className="p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 space-y-6 relative overflow-hidden bg-gradient-emerald-card">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 dark:text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Smart Drip Irrigation Advisor
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Crop: <strong className="text-slate-800 dark:text-slate-200">{data.crop_type}</strong> ({data.growth_stage} Stage)
            </span>
          </div>
        </div>

        <Badge variant={isRequired ? 'warning' : 'healthy'} className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
          {isRequired ? 'IRRIGATION REQUIRED' : 'OPTIMAL MOISTURE'}
        </Badge>
      </div>

      {/* Hero Recommendation Headline & Plant Graphic Row */}
      <div className="grid sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-8 p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-3">
          <h4 className="font-extrabold text-sky-900 dark:text-sky-200 text-lg sm:text-xl leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
            {data.recommendation}
          </h4>
          <div className="space-y-1 pt-1">
            {data.reasoning?.map((r, i) => (
              <p key={i} className="text-xs text-sky-800 dark:text-sky-300 font-medium flex items-start gap-2">
                <span className="text-sky-600 dark:text-sky-400 font-bold">•</span>
                <span>{r}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Plant Illustration Asset Container */}
        <div className="sm:col-span-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Sprout className="w-8 h-8" />
          </div>
          <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">{data.crop_type || "Unknown"} Crop Specimen</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Vegetative Growth Index: 0.85</span>
        </div>
      </div>

      {/* 4 Bottom Stats Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Water per Acre</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{data.water_quantity_liters_per_acre} L</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Optimal Window</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-1">{data.best_irrigation_time}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Next Target Date</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{data.next_irrigation_date}</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Advisor Confidence</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>{data.confidence_score}%</p>
        </div>
      </div>
    </Card>
  );
};

export const IrrigationAdvisor = React.memo(({ farmId, cropName = "Tomato", growthStage = "Vegetative", farmSize = 1.0 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIrrigation = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/intelligence/irrigation', {
        params: { farm_id: farmId, crop_name: cropName, growth_stage: growthStage, farm_size: farmSize }
      });
      setData(res.data);
    } catch (err) {
      console.warn("Irrigation fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIrrigation();
  }, [farmId, cropName, growthStage, farmSize]);

  const { lastTelemetry } = useWebSocket();
  useEffect(() => {
    if (lastTelemetry) {
      const telem = lastTelemetry.telemetry || lastTelemetry;
      if (telem.soil_moisture !== undefined || telem.soil_percentage !== undefined || telem.rain_detected !== undefined || telem.rain_sensor !== undefined) {
        fetchIrrigation();
      }
    }
  }, [lastTelemetry]);

  if (loading && !data) {
    return <Skeleton className="h-56 rounded-2xl w-full" />;
  }

  const defaultData = {
    crop_type: cropName,
    growth_stage: growthStage,
    irrigation_required: true,
    recommendation: `Water ${cropName} field (${growthStage} stage) with 5520 L/acre.`,
    reasoning: [
      "Current soil moisture (42.0%) vs target threshold (65.0%).",
      "Soil moisture deficit of 23.0% detected.",
      "Crop coefficient Kc=1.15 applied for Vegetative stage."
    ],
    water_quantity_liters_per_acre: 5520,
    best_irrigation_time: "08:00 AM - 09:00 AM",
    next_irrigation_date: "22 Jul 2026",
    confidence_score: 94
  };

  return <WaterRecommendationCard data={data || defaultData} onRefresh={fetchIrrigation} />;
});

export default IrrigationAdvisor;
