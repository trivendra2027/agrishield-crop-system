import React from 'react';

// 1. Smart Tractor
export const SmartTractor = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-amber-700 dark:bg-amber-900" />
    <div className="absolute top-2 right-6 w-6 h-6 bg-yellow-300 rounded-full blur-[3px]" style={{animation:'anim-pulse-slow 3s ease-in-out infinite'}} />
    <svg className="absolute bottom-[30%] w-14 h-10" viewBox="0 0 70 50" style={{animation:'anim-tractor-drive 12s linear infinite'}}>
      <rect x="10" y="10" width="30" height="20" rx="3" fill="#dc2626"/><rect x="40" y="15" width="15" height="15" rx="2" fill="#991b1b"/>
      <circle cx="18" cy="35" r="7" fill="#1e293b"/><circle cx="18" cy="35" r="3" fill="#475569"/>
      <circle cx="48" cy="35" r="9" fill="#1e293b"/><circle cx="48" cy="35" r="4" fill="#475569"/>
      <rect x="28" y="2" width="4" height="10" fill="#94a3b8" rx="1"/>
    </svg>
  </div>
);

// 2. Agri-Drone
export const AgriDrone = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 to-emerald-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[30%] bg-emerald-500/40 dark:bg-emerald-900/40" />
    <div className="absolute top-3" style={{animation:'anim-drone-hover 6s ease-in-out infinite'}}>
      <svg className="w-12 h-10" viewBox="0 0 50 35"><rect x="15" y="12" width="20" height="8" rx="3" fill="#64748b"/>
        <rect x="5" y="10" width="12" height="2" rx="1" fill="#94a3b8" style={{animation:'anim-propeller 0.08s linear infinite',transformOrigin:'center'}}/>
        <rect x="33" y="10" width="12" height="2" rx="1" fill="#94a3b8" style={{animation:'anim-propeller 0.1s linear infinite',transformOrigin:'center'}}/>
        <path d="M25,20 L20,34 L30,34 Z" fill="rgba(16,185,129,0.3)" style={{animation:'anim-laser-pulse 1.2s linear infinite'}}/>
      </svg>
    </div>
  </div>
);

// 3. Greenhouse
export const Greenhouse = () => (
  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-end justify-center">
    <div className="w-[85%] h-[80%] border-2 border-slate-300 dark:border-slate-700 rounded-t-[40px] relative bg-white/30 dark:bg-slate-800/30 overflow-hidden">
      <div className="absolute top-0 w-full h-3 bg-fuchsia-400/20 blur-sm" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <div className="absolute bottom-0 w-full flex justify-around px-3">
        {[8,12,6,10,7].map((h,i)=>(<div key={i} className="w-3 bg-emerald-500 rounded-t-full" style={{height:`${h}px`,animation:`anim-grow ${8+i}s ease-out forwards`,transformOrigin:'bottom',animationDelay:`${i*0.4}s`}}/>))}
      </div>
    </div>
  </div>
);

// 4. Solar Panels
export const SolarPanels = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-orange-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[35%] bg-amber-800/60 dark:bg-slate-800"/>
    <div className="absolute top-1 right-6 w-8 h-8 bg-orange-400 rounded-full blur-[4px]" style={{animation:'anim-pulse-slow 4s ease-in-out infinite'}}/>
    <div className="absolute bottom-[25%] flex w-full justify-around px-6">
      {[0,1,2,3].map(i=>(<div key={i} className="w-12 h-7 bg-blue-700 border border-blue-500 transform -skew-x-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/20" style={{animation:`anim-glint 3s linear infinite`,animationDelay:`${i*0.6}s`}}/>
      </div>))}
    </div>
  </div>
);

// 5. Wind Turbines
export const WindTurbines = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-emerald-100 dark:from-slate-800 dark:to-emerald-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[30%] bg-emerald-600/50 dark:bg-emerald-900/50 rounded-t-lg"/>
    {[30,55,75].map((l,i)=>(<React.Fragment key={i}>
      <div className="absolute bg-slate-400 dark:bg-slate-600" style={{left:`${l}%`,bottom:'20%',width:'2px',height:`${16+i*4}px`}}/>
      <svg className="absolute" style={{left:`${l-3}%`,bottom:`${38+i*6}%`,width:'16px',height:'16px',animation:`anim-spin ${3+i}s linear infinite`,transformOrigin:'center'}}>
        <line x1="8" y1="0" x2="8" y2="8" stroke="#64748b" strokeWidth="2"/><line x1="2" y1="12" x2="8" y2="8" stroke="#64748b" strokeWidth="2"/><line x1="14" y1="12" x2="8" y2="8" stroke="#64748b" strokeWidth="2"/>
      </svg>
    </React.Fragment>))}
  </div>
);

// 6. Smart Sprinklers
export const SmartSprinklers = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[35%] bg-emerald-600/70 dark:bg-emerald-900/70 rounded-t-lg"/>
    {[25,75].map((x,i)=>(<React.Fragment key={i}>
      <div className="absolute bg-slate-400" style={{left:`${x}%`,bottom:'25%',width:'2px',height:'12px'}}/>
      <svg className="absolute opacity-70" style={{left:`${x-8}%`,bottom:'35%',width:'40px',height:'30px'}} viewBox="0 0 40 30" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3">
        <path d={`M20,20 Q${i?30:10},5 ${i?38:2},15`} style={{animation:'anim-water-arc 0.6s linear infinite'}}/><path d={`M20,20 Q${i?10:30},5 ${i?2:38},15`} style={{animation:'anim-water-arc 0.6s linear infinite reverse'}}/>
      </svg>
    </React.Fragment>))}
  </div>
);

// 7. Harvest Robot
export const HarvestRobot = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 to-green-50 dark:from-slate-900 dark:to-emerald-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-emerald-700/50 dark:bg-emerald-900/60"/>
    <div className="absolute bottom-[30%] left-[20%] w-6 h-10 bg-emerald-500 rounded-t-full"/>
    <svg className="absolute bottom-[35%] left-[45%] w-16 h-16" viewBox="0 0 60 60">
      <rect x="20" y="30" width="20" height="25" rx="3" fill="#475569"/>
      <line x1="40" y1="35" x2="55" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" style={{animation:'anim-alien-sway 2s ease-in-out infinite',transformOrigin:'40px 35px'}}/>
      <circle cx="55" cy="18" r="4" fill="#64748b" style={{animation:'anim-alien-sway 2s ease-in-out infinite',transformOrigin:'40px 35px'}}/>
    </svg>
  </div>
);

// 8. Conveyor Belt
export const ConveyorBelt = () => (
  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden flex items-center">
    <div className="absolute bottom-[40%] w-full h-3 bg-slate-400 dark:bg-slate-700"/>
    {[0,1,2,3,4].map(i=>(<div key={i} className="absolute w-4 h-4 rounded bg-orange-400 dark:bg-orange-600 bottom-[48%]" style={{animation:'anim-tractor-drive 8s linear infinite',animationDelay:`${i*1.6}s`}}/>))}
    <div className="absolute bottom-[40%] w-full h-[2px] bg-slate-500 dark:bg-slate-600" style={{backgroundImage:'repeating-linear-gradient(90deg,transparent,transparent 8px,#94a3b8 8px,#94a3b8 10px)',animation:'anim-grid-fly 0.5s linear infinite'}}/>
  </div>
);

// 9. Crop Rows
export const CropRows = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-amber-100 dark:from-slate-800 dark:to-amber-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[50%] bg-amber-700/60 dark:bg-amber-900/60"/>
    {[20,35,50,65,80].map((x,i)=>(<div key={i} className="absolute bg-emerald-500 dark:bg-emerald-600 rounded-t-full" style={{left:`${x}%`,bottom:'35%',width:'4px',height:`${10+Math.sin(i)*4}px`,animation:`anim-wave ${2+i*0.3}s ease-in-out infinite`,transformOrigin:'bottom'}}/>))}
  </div>
);

// 10. Fence Patrol Drone
export const FencePatrol = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[25%] bg-emerald-900/50"/>
    <div className="absolute bottom-[20%] w-full h-[2px] bg-amber-700/50"/>
    {[20,40,60,80].map(i=>(<div key={i} className="absolute bg-amber-700/70 bottom-[20%]" style={{left:`${i}%`,width:'2px',height:'10px'}}/>))}
    <div className="absolute w-3 h-2 bg-slate-400 rounded top-[30%]" style={{animation:'anim-drone-hover 8s ease-in-out infinite'}}>
      <div className="w-1 h-1 bg-red-500 rounded-full mx-auto" style={{animation:'anim-laser-pulse 0.5s linear infinite'}}/>
    </div>
  </div>
);

// --- Phase 2: Precision Agriculture ---

// AutoSteer - steering wheel with GPS signal
export const AutoSteer = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden flex items-center justify-center">
    <svg className="absolute w-full h-full opacity-10" viewBox="0 0 200 56"><line x1="0" y1="28" x2="200" y2="28" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="4 4"/></svg>
    <svg className="w-14 h-14" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="26" fill="none" stroke="#475569" strokeWidth="4"/>
      <circle cx="30" cy="30" r="18" fill="none" stroke="#334155" strokeWidth="2"/>
      <line x1="30" y1="4" x2="30" y2="12" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" style={{animation:'anim-spin 4s linear infinite',transformOrigin:'30px 30px'}}/>
      <line x1="30" y1="30" x2="30" y2="12" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" style={{animation:'anim-spin 4s linear infinite',transformOrigin:'30px 30px'}}/>
      <circle cx="30" cy="30" r="4" fill="#22d3ee"/>
    </svg>
    <div className="absolute top-2 right-3 text-[8px] font-mono text-cyan-400" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}>GPS ●</div>
    <div className="absolute bottom-2 left-0 right-0 flex justify-center"><div className="h-1 w-20 bg-cyan-500/30 rounded-full"><div className="h-1 bg-cyan-400 rounded-full" style={{width:'60%',animation:'anim-data-flow 2s ease-in-out infinite'}}/></div></div>
  </div>
);

// DroneSwarm - multiple mini drones orbiting
export const DroneSwarm = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-950 to-slate-900 overflow-hidden">
    {[0,1,2,3,4].map(i=>(
      <div key={i} className="absolute" style={{
        width:'8px',height:'6px',top:'50%',left:'50%',
        animation:`anim-orbit-${i%3===0?'fast':'slow'} ${3+i*0.7}s linear infinite`,
        animationDelay:`${i*0.6}s`,transform:`rotate(${i*72}deg) translateX(22px)`
      }}>
        <svg viewBox="0 0 8 6" width="8" height="6">
          <rect x="2" y="2" width="4" height="2" rx="1" fill="#94a3b8"/>
          <line x1="1" y1="1" x2="3" y2="2" stroke="#64748b" strokeWidth="0.8"/>
          <line x1="5" y1="1" x2="7" y2="2" stroke="#64748b" strokeWidth="0.8"/>
        </svg>
      </div>
    ))}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-500/30" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400"/>
  </div>
);

// SmartSilo - grain silo with fill animation
export const SmartSilo = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden flex items-end justify-center">
    <svg className="w-24 h-full" viewBox="0 0 80 56" preserveAspectRatio="xMidYMax meet">
      <rect x="20" y="16" width="40" height="34" rx="2" fill="#292524"/>
      <ellipse cx="40" cy="16" rx="20" ry="6" fill="#44403c"/>
      <rect x="21" y="38" width="38" height="12" rx="1" fill="#57534e"/>
      <rect x="21" y="38" width="38" height="12" rx="1" fill="url(#siloFill)">
        <animate attributeName="height" from="0" to="12" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="y" from="50" to="38" dur="3s" repeatCount="indefinite"/>
      </rect>
      <defs><linearGradient id="siloFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#b45309"/></linearGradient></defs>
      <rect x="36" y="10" width="4" height="6" fill="#78716c"/>
      <text x="40" y="52" textAnchor="middle" fill="#fbbf24" fontSize="4" fontFamily="monospace">SILO</text>
    </svg>
  </div>
);

// AgriBotV2 - agricultural robot arm
export const AgriBotV2 = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-emerald-950 overflow-hidden flex items-end justify-center">
    <div className="absolute bottom-0 w-full h-[20%] bg-emerald-900/60"/>
    <svg className="absolute bottom-[18%] w-20 h-28" viewBox="0 0 60 80">
      <rect x="20" y="60" width="20" height="15" rx="3" fill="#334155"/>
      <rect x="25" y="45" width="10" height="18" rx="2" fill="#475569" style={{animation:'anim-conveyor 3s ease-in-out infinite',transformOrigin:'30px 60px'}}/>
      <rect x="22" y="30" width="16" height="18" rx="2" fill="#64748b" style={{animation:'anim-drone-hover 2s ease-in-out infinite',transformOrigin:'30px 45px'}}/>
      <rect x="18" y="22" width="24" height="10" rx="4" fill="#475569"/>
      <circle cx="30" cy="18" r="5" fill="#22d3ee"/>
      <circle cx="30" cy="18" r="2" fill="#0e7490" style={{animation:'anim-laser-pulse 1s linear infinite'}}/>
      <line x1="30" y1="23" x2="30" y2="55" stroke="#334155" strokeWidth="2"/>
    </svg>
  </div>
);

// LidarScan - rotating lidar rings
export const LidarScan = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    {[28,22,16,10].map((r,i)=>(
      <div key={i} className="absolute rounded-full border border-emerald-400/60" style={{width:r*2,height:r*2,animation:`anim-pulse-slow ${1.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.2}s`,opacity:0.4-i*0.08}}/>
    ))}
    <div className="absolute w-[56px] h-[56px]" style={{animation:'anim-spin 3s linear infinite'}}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-7 bg-gradient-to-b from-emerald-400 to-transparent rounded-full"/>
    </div>
    <div className="absolute w-2 h-2 rounded-full bg-emerald-400" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}/>
    <div className="absolute bottom-3 text-[7px] font-mono text-emerald-400/70">LIDAR ACTIVE</div>
  </div>
);

// GPSTrack - satellite signal and path
export const GPSTrack = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <path d="M10,45 Q50,20 100,35 T190,15" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" style={{strokeDashoffset:0,animation:'anim-data-flow 4s linear infinite'}}/>
      {[[30,40],[80,30],[140,38],[170,20]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2" fill="#60a5fa" style={{animation:`anim-pulse-slow ${1+i*0.3}s ease-in-out infinite`}}/>
      ))}
    </svg>
    <div className="absolute top-3 right-5" style={{animation:'anim-drone-hover 4s ease-in-out infinite'}}>
      <svg width="12" height="12" viewBox="0 0 20 20"><polygon points="10,2 18,18 10,13 2,18" fill="#facc15"/></svg>
    </div>
    <div className="absolute bottom-2 left-3 text-[7px] font-mono text-blue-300 opacity-80">GPS TRACK</div>
  </div>
);

// AutoHarvester - combine harvester moving across field
export const AutoHarvester = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-950 dark:to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[35%] bg-amber-600/70 dark:bg-amber-900/60"/>
    {[0,1,2,3,4,5,6,7].map(i=>(
      <div key={i} className="absolute bottom-[30%] bg-amber-400 dark:bg-amber-600" style={{left:`${i*14}%`,width:'6px',height:`${20+Math.sin(i)*8}px`,borderRadius:'3px 3px 0 0'}}/>
    ))}
    <svg className="absolute bottom-[28%]" style={{animation:'anim-tractor-drive 10s linear infinite'}} width="50" height="28" viewBox="0 0 50 28">
      <rect x="4" y="8" width="28" height="14" rx="2" fill="#ca8a04"/>
      <rect x="0" y="10" width="10" height="10" rx="1" fill="#a16207"/>
      <rect x="32" y="10" width="14" height="12" rx="2" fill="#92400e"/>
      <circle cx="10" cy="24" r="5" fill="#1e293b"/><circle cx="10" cy="24" r="2" fill="#475569"/>
      <circle cx="38" cy="24" r="4" fill="#1e293b"/><circle cx="38" cy="24" r="2" fill="#475569"/>
    </svg>
  </div>
);

// RoboWeed - laser targeting weeds
export const RoboWeed = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[35%] bg-emerald-900/80"/>
    {[20,50,80].map((x,i)=>(
      <div key={i} className="absolute bottom-[30%] bg-emerald-600" style={{left:`${x}%`,width:'3px',height:'14px',borderRadius:'2px 2px 0 0',animationDelay:`${i*0.3}s`}}>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 bg-red-500" style={{height:'22px',animation:`anim-laser-pulse ${0.8+i*0.2}s linear infinite`,animationDelay:`${i*0.4}s`}}/>
      </div>
    ))}
    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-6 bg-slate-800 rounded flex items-center justify-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{animation:'anim-laser-pulse 0.6s linear infinite'}}/>
      <div className="text-[7px] font-mono text-red-400">TARGETING</div>
    </div>
  </div>
);

// LaserLevel - precision laser line across field
export const LaserLevel = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-slate-800/60"/>
    <div className="absolute top-[40%] left-0 right-0 h-0.5 bg-red-500/80" style={{boxShadow:'0 0 8px 2px rgba(239,68,68,0.5)',animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    <div className="absolute top-[38%] left-3 w-5 h-5 bg-slate-700 rounded flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-red-600" style={{animation:'anim-laser-pulse 0.5s linear infinite'}}/>
    </div>
    <div className="absolute top-[38%] right-3 w-3 h-3 rounded-full border-2 border-red-500/60" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    <div className="absolute bottom-3 left-0 right-0 flex justify-center text-[7px] font-mono text-red-400/80">LEVEL: 0.000°</div>
  </div>
);

// YieldMonitor - bar chart filling up
export const YieldMonitor = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden flex items-end justify-around px-3 pb-4">
    <div className="absolute top-2 left-0 right-0 text-center text-[7px] font-mono text-amber-400">YIELD MONITOR</div>
    {[65,80,45,90,70,55].map((h,i)=>(
      <div key={i} className="flex flex-col items-center gap-0.5">
        <div className="w-4 bg-slate-700 rounded-t overflow-hidden flex items-end" style={{height:'30px'}}>
          <div className="w-full rounded-t" style={{height:`${h}%`,background:`hsl(${40+i*10},80%,55%)`,animation:'anim-grow 2s ease-out forwards',animationDelay:`${i*0.15}s`,transformOrigin:'bottom'}}/>
        </div>
      </div>
    ))}
  </div>
);

