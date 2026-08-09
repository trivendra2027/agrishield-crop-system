import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sprout, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { Card, Badge, Skeleton } from '../ui/index';
import API from '../../services/api';

export const TimelineCard = ({ stage }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-200 ${
    stage.is_active 
      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-75'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${stage.is_active ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{stage.stage_name}</h4>
      </div>
      <Badge variant={stage.is_active ? "healthy" : "default"}>
        {stage.duration_days} Days
      </Badge>
    </div>

    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
      <p className="font-semibold text-slate-800 dark:text-slate-200">🌱 Key Activities:</p>
      {stage.activities?.map((act, i) => <p key={i}>• {act}</p>)}
      <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">🧪 Fertilizer Protocol:</p>
      {stage.fertilizer_schedule?.map((f, i) => <p key={i}>• {f}</p>)}
    </div>
  </div>
);

export const CropCalendar = React.memo(({ cropName = "Tomato", growthStage = "Vegetative" }) => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/intelligence/crop-calendar', {
        params: { crop_name: cropName, growth_stage: growthStage }
      });
      setCalendarData(res.data);
    } catch (err) {
      console.warn("Crop calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [cropName, growthStage]);

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl w-full" />;
  }

  if (!calendarData) return null;

  return (
    <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Crop Lifecycle Calendar & Milestones</h3>
        </div>
        <Badge variant="healthy">{calendarData.total_lifecycle_days} Days Total</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {calendarData.stages?.map((stage, idx) => (
          <TimelineCard key={idx} stage={stage} />
        ))}
      </div>
    </Card>
  );
});
