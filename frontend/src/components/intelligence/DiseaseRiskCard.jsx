import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { Card, Badge, Skeleton, Progress } from '../ui/index';
import API from '../../services/api';

export const RiskGauge = ({ percentage, level, color }) => (
  <div className="flex items-center gap-4">
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
        <motion.circle
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: 200 - (percentage / 100) * 200 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          cx="40" cy="40" r="32" stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={200} strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-extrabold text-sm text-slate-900 dark:text-slate-100">{percentage}%</span>
    </div>
    <div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pathology Outbreak Risk</span>
      <h4 className="text-xl font-extrabold" style={{ color }}>{level} Risk Level</h4>
    </div>
  </div>
);

export const DiseaseRiskCard = React.memo(({ farmId, cropName = "Tomato" }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/intelligence/disease-risk', {
        params: { farm_id: farmId, crop_name: cropName }
      });
      setRiskData(res.data);
    } catch (err) {
      console.warn("Disease risk fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, [farmId, cropName]);

  if (loading) {
    return <Skeleton className="h-56 rounded-2xl w-full" />;
  }

  if (!riskData) return null;

  return (
    <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Explainable Disease Risk Forecast</h3>
        </div>
        <Badge variant="purple">Confidence: {riskData.confidence_score}%</Badge>
      </div>

      <RiskGauge percentage={riskData.risk_percentage} level={riskData.risk_level} color={riskData.risk_color} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
        {riskData.factors_increasing_risk?.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800 space-y-1">
            <span className="font-bold text-rose-900 dark:text-rose-200 block text-[11px]">⚠️ Risk Elevating Factors:</span>
            {riskData.factors_increasing_risk.map((f, i) => (
              <p key={i} className="text-rose-800 dark:text-rose-300 font-medium">• {f}</p>
            ))}
          </div>
        )}

        {riskData.preventive_actions?.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 space-y-1">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-[11px]">🛡️ Recommended Preventive Protocol:</span>
            {riskData.preventive_actions.map((a, i) => (
              <p key={i} className="text-emerald-800 dark:text-emerald-300 font-medium">• {a}</p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
});
