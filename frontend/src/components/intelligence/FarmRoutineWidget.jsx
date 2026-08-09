import React, { useState, useEffect } from 'react';
import { Sunrise, Sun, Sunset, Moon, Clock, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const FarmRoutineWidget = () => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const routines = [
    {
      id: 'morning',
      title: "Dawn Routine",
      time: "06:00 - 09:00",
      start: 6,
      end: 9,
      icon: Sunrise,
      color: "text-amber-500",
      bg: "bg-amber-100 dark:bg-amber-900/40",
      border: "border-amber-200 dark:border-amber-800",
      desc: "Frost check & baseline soil scanning."
    },
    {
      id: 'day',
      title: "Active Monitoring",
      time: "09:00 - 17:00",
      start: 9,
      end: 17,
      icon: Sun,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/40",
      border: "border-orange-200 dark:border-orange-800",
      desc: "High-freq telemetry & heat stress tracking."
    },
    {
      id: 'evening',
      title: "Twilight Sync",
      time: "17:00 - 20:00",
      start: 17,
      end: 20,
      icon: Sunset,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-900/40",
      border: "border-purple-200 dark:border-purple-800",
      desc: "Optimal spray window & daily farm summary."
    },
    {
      id: 'night',
      title: "Deep Sleep",
      time: "20:00 - 06:00",
      start: 20,
      end: 6, // Wraps around
      icon: Moon,
      color: "text-indigo-500",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
      border: "border-indigo-200 dark:border-indigo-800",
      desc: "Ultra-low power mode. Wakes on rain interrupt."
    }
  ];

  const getActiveRoutine = () => {
    return routines.find(r => {
      if (r.start < r.end) {
        return currentHour >= r.start && currentHour < r.end;
      } else {
        // Nighttime wrap around (e.g. 20 to 6)
        return currentHour >= r.start || currentHour < r.end;
      }
    }) || routines[0];
  };

  const activeRoutine = getActiveRoutine();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-2xl border-2 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Autonomous Farm Schedule
        </h3>
        <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="flex flex-col gap-3 relative">
        {/* Vertical line connecting the steps */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>

        {routines.map((routine, index) => {
          const isActive = activeRoutine.id === routine.id;
          const isPast = (routine.start < activeRoutine.start && activeRoutine.start < 20) || 
                         (activeRoutine.id === 'night' && routine.id !== 'night');
          
          const Icon = routine.icon;

          return (
            <div key={routine.id} className={`relative z-10 flex gap-4 p-3 rounded-xl transition-all duration-300 ${isActive ? `border-2 ${routine.bg} ${routine.border}` : 'border-2 border-transparent opacity-60'}`}>
              
              <div className="flex flex-col items-center justify-center mt-1">
                {isActive ? (
                  <div className={`relative flex h-4 w-4`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${routine.color.replace('text', 'bg')}`}></span>
                    <span className={`relative inline-flex rounded-full h-4 w-4 ${routine.color.replace('text', 'bg')} border-2 border-white dark:border-slate-900`}></span>
                  </div>
                ) : isPast ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-white dark:bg-slate-900" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 bg-white dark:bg-slate-900" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? routine.color : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                      {routine.title}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? routine.color : 'text-slate-400'}`}>
                    {routine.time}
                  </span>
                </div>
                {isActive && (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                    {routine.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FarmRoutineWidget;
