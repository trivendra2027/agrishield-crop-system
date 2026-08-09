import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/index';

const FarmHealthScore = ({ score, totalScans, diseasedCount }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let statusColor = '#10b981'; // emerald-500
  let statusText = 'Optimal Health';
  let Icon = ShieldCheck;

  if (score < 50) {
    statusColor = '#ef4444'; // red-500
    statusText = 'Critical Risk';
    Icon = AlertTriangle;
  } else if (score < 80) {
    statusColor = '#f59e0b'; // amber-500
    statusText = 'Needs Attention';
    Icon = Activity;
  }

  return (
    <Card glass className="p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8 border-slate-200/80 dark:border-slate-800">
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="transform -rotate-90 w-36 h-36 sm:w-40 sm:h-40">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            cx="80"
            cy="80"
            r={radius}
            stroke={statusColor}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            className="drop-shadow-md"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{score}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 text-center md:text-left z-10 w-full">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Icon className="w-5 h-5 shrink-0" style={{ color: statusColor }} />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Farm Health Condition</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Overall Crop State: <span style={{ color: statusColor }} className="font-bold">{statusText}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Diagnostics</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{totalScans}</p>
          </div>
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Disease Outbreaks</p>
            <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{diseasedCount}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FarmHealthScore;
