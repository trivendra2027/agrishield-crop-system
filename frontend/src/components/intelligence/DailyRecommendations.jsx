import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, Badge, Skeleton } from '../ui/index';
import API from '../../services/api';

export const DailyRecommendations = React.memo(({ farmId, cropName = "Tomato", growthStage = "Vegetative" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/intelligence/recommendations', {
        params: { farm_id: farmId, crop_name: cropName, growth_stage: growthStage }
      });
      setData(res.data);
    } catch (err) {
      console.warn("Daily recommendations fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [farmId, cropName, growthStage]);

  if (loading) {
    return <Skeleton className="h-52 rounded-2xl w-full" />;
  }

  if (!data?.recommendations) return null;

  return (
    <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Prioritized Daily AI Farming Actions</span>
        </div>
        <Badge variant="healthy">{data.recommendations.length} Active Advice</Badge>
      </div>

      <div className="space-y-3">
        {data.recommendations.map((item) => (
          <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{item.recommendation}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {item.confidence}% Confidence
              </span>
            </div>
            {item.reasoning?.length > 0 && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                {item.reasoning.map((r, i) => (
                  <p key={i}>• {r}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
});
