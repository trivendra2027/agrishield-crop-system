import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const Switch = ({ checked = false, onChange, disabled = false, label, description, className }) => {
  return (
    <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
      <div
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          checked ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>}
          {description && <span className="text-[11px] text-slate-500 dark:text-slate-400">{description}</span>}
        </div>
      )}
    </label>
  );
};

export { Switch };
