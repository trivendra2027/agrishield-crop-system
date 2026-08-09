import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bug, Sprout, FlaskConical, Droplets, CloudRain, Sparkles, Filter } from 'lucide-react';
import { Card, Badge, Skeleton } from '../ui/index';
import API from '../../services/api';

const CATEGORY_ICONS = {
  "Disease": Bug,
  "Plant Identification": Sprout,
  "Agrochemical": FlaskConical,
  "Irrigation": Droplets,
  "Weather": CloudRain,
  "AI Recommendation": Sparkles,
  "Fertilizer": Sprout,
  "Harvest": Activity
};

export const TimelineItem = ({ event }) => {
  const Icon = CATEGORY_ICONS[event.category] || Activity;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-0.5 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{event.title}</h4>
          <span className="text-[10px] text-slate-400 font-semibold">{new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' , timeZone: 'Asia/Kolkata'})}</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};

export const FarmTimeline = React.memo(({ farmId }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchTimeline = async (cat = selectedCategory) => {
    setLoading(true);
    try {
      const res = await API.get('/api/intelligence/timeline', {
        params: { farm_id: farmId, category: cat, limit: 15 }
      });
      setTimelineData(res.data);
    } catch (err) {
      console.warn("Timeline fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(selectedCategory);
  }, [farmId, selectedCategory]);

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl w-full" />;
  }

  if (!timelineData) return null;

  return (
    <Card glass className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Farm Intelligence Activity Stream</h3>
        </div>
        <Badge variant="healthy">{timelineData.events?.length || 0} Events</Badge>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {timelineData.available_categories?.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {timelineData.events?.map((evt) => (
          <TimelineItem key={evt.id} event={evt} />
        ))}
      </div>
    </Card>
  );
});
