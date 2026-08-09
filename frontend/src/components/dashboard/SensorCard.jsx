import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/index';

const SensorCard = ({ title, value, unit, icon: Icon, trend, trendValue, color, delay = 0 }) => {
  const isPositive = trend === 'up';

  return (
    <Card 
      glass 
      hover 
      className="p-5 rounded-2xl relative overflow-hidden group border-t-4 transition-all duration-200"
      style={{ borderTopColor: color }}
    >
      <div 
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
          <Icon className="w-5 h-5 shrink-0" style={{ color }} />
        </div>
        
        {trendValue && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isPositive ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <h3 className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{value}</span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{unit}</span>
        </div>
      </div>
    </Card>
  );
};

export default SensorCard;
