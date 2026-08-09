import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../lib/utils";

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No Data Found",
  description = "There are no records to display at this time.",
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50",
        className
      )}
    >
      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-3 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export { EmptyState };
