import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const Tooltip = ({ content, children, position = "top", className }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-1",
    bottom: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full mt-1",
    left: "top-1/2 -left-2 -translate-y-1/2 -translate-x-full mr-1",
    right: "top-1/2 -right-2 -translate-y-1/2 translate-x-full ml-1",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 pointer-events-none px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-lg whitespace-nowrap dark:bg-slate-100 dark:text-slate-900",
              positionClasses[position],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Tooltip };
