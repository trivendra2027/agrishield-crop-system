import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const Progress = ({ value = 0, max = 100, className, barClassName, label, showValue = false }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        className={cn(
          "w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative",
          className
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full bg-emerald-600 rounded-full", barClassName)}
        />
      </div>
    </div>
  );
};

export { Progress };
