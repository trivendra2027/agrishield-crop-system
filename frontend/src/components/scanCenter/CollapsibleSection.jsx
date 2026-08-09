import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CollapsibleSection = ({ title, icon: Icon, badge, defaultOpen = true, children, className = '', headerBg = 'bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200 ${className}`}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 flex items-center justify-between transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${headerBg}`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-xs">
              <Icon size={18} />
            </div>
          )}
          <span className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg">{title}</span>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
              {badge}
            </span>
          )}
        </div>

        <div className={`text-slate-500 dark:text-slate-400 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleSection;
