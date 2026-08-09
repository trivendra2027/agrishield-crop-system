import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const Spinner = ({ className, size = "md", color = "text-emerald-600" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin shrink-0",
        sizeClasses[size] || sizeClasses.md,
        color,
        className
      )}
    />
  );
};

export { Spinner };
