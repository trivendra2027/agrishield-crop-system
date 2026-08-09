import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sprout, Bug, FlaskConical } from 'lucide-react';
import { Badge } from '../ui/index';

const TABS = [
  {
    id: 'disease-diag',
    labelKey: 'tabs.disease_diag',
    label: 'Disease Diagnosis',
    icon: Bug,
    descKey: 'tabs.disease_diag_desc',
    description: 'Detect fungal, bacterial & viral crop pathologies',
    badge: 'PyTorch AI'
  },
  {
    id: 'plant-id',
    labelKey: 'tabs.plant_id',
    label: 'Plant Identification',
    icon: Sprout,
    descKey: 'tabs.plant_id_desc',
    description: 'Identify crop variety, botanical species & growth traits',
    badge: 'Species Engine'
  },
  {
    id: 'agro-scan',
    labelKey: 'tabs.agro_scan',
    label: 'Agrochemical Scanner',
    icon: FlaskConical,
    descKey: 'tabs.agro_scan_desc',
    description: 'Scan pesticides, fungicides & fertilizer product labels',
    badge: 'OCR Vision'
  }
];

const ScanCenterTabs = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  return (
    <div role="tablist" aria-label="AI Scan Modules" className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-100/90 dark:bg-slate-900/90 p-2.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col text-left p-5 sm:p-6 rounded-2xl transition-all duration-200 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isActive
                ? 'bg-white dark:bg-slate-800 shadow-md border-2 border-emerald-500 z-10'
                : 'hover:bg-white/60 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="activeTabGlow"
                className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" 
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className={`font-bold text-base ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                  {t(tab.labelKey, tab.label)}
                </span>
              </div>
              <Badge variant={isActive ? "healthy" : "default"}>
                {tab.badge}
              </Badge>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${isActive ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              {t(tab.descKey, tab.description)}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default ScanCenterTabs;
