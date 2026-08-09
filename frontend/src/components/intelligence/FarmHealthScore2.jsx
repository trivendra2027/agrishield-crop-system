import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, Badge, Skeleton, Progress } from '../ui/index';
import API from '../../services/api';

export const FarmHealthScore2 = React.memo(({ farmId }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthScore = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/intelligence/health-score', {
        params: { farm_id: farmId }
      });
      setHealthData(res.data);
    } catch (err) {
      console.warn("Farm health score 2.0 fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthScore();
  }, [farmId]);

  if (loading) {
    return <Skeleton className="h-56 rounded-2xl w-full" />;
  }

  if (!healthData) return null;

  const { overall_score, previous_score, trend, breakdown, improvement_suggestions } = healthData;
  const isUp = trend === 'up';

  return (
    <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Farm Health Index 2.0</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
          isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
        }`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{overall_score}% (Prev: {previous_score}%)</span>
        </div>
      </div>

      {/* Breakdown Contributions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Disease History</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{breakdown.disease_history_contribution} / 35</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Weather</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{breakdown.weather_contribution} / 20</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Irrigation</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{breakdown.irrigation_contribution} / 15</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Growth Stage</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{breakdown.crop_growth_contribution} / 10</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Recovery Trend</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{breakdown.recovery_contribution} / 10</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">AI Certainty</span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{breakdown.ai_confidence_contribution} / 10</p>
        </div>
      </div>

      {/* Suggestions List */}
      {improvement_suggestions?.length > 0 && (
        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 space-y-1 text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-[11px]">🌱 Health Improvement Directives:</span>
          {improvement_suggestions.map((s, i) => (
            <p key={i} className="text-emerald-800 dark:text-emerald-300 font-medium">• {s}</p>
          ))}
        </div>
      )}
    </Card>
  );
});
