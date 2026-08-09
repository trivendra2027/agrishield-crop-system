import React from 'react';

export const DripIrrigation = () => (<div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-slate-900 dark:to-emerald-950 overflow-hidden"><div className="absolute bottom-0 w-full h-[35%] bg-amber-700/50"/><div className="absolute top-[30%] w-full h-[1px] bg-slate-400/50"/>{[20,40,60,80].map(x=>(<div key={x} className="absolute w-1 h-2 bg-blue-400 rounded-b-full" style={{left:`${x}%`,top:'30%',animation:`anim-drip 2s linear infinite`,animationDelay:`${x*0.02}s`}}/>))}</div>);

export const RiverFlow = () => (<div className="absolute inset-0 bg-emerald-900 overflow-hidden"><svg className="absolute w-[200%] h-full opacity-50" viewBox="0 0 400 50"><path d="M0,25 Q50,15 100,25 Q150,35 200,25 Q250,15 300,25 Q350,35 400,25" fill="none" stroke="#38bdf8" strokeWidth="3" style={{animation:'anim-quantum-wave 3s linear infinite'}}/><path d="M0,30 Q50,20 100,30 Q150,40 200,30 Q250,20 300,30 Q350,40 400,30" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.5" style={{animation:'anim-quantum-wave 3s linear infinite',animationDelay:'-0.5s'}}/></svg></div>);

export const WaterPump = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden flex items-center justify-center"><div className="w-10 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center"><div className="w-4 h-4 border-2 border-blue-400 rounded-full" style={{animation:'anim-spin 1s linear infinite'}}/></div><div className="absolute right-[20%] w-12 h-[2px] bg-gradient-to-r from-blue-400 to-transparent" style={{animation:'anim-fiber-pulse 1s linear infinite'}}/></div>);

export const HydroponicSystem = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden"><div className="absolute top-[30%] w-full h-[2px] bg-blue-500/30"/><div className="absolute top-[60%] w-full h-[2px] bg-blue-500/30"/>{[20,40,60,80].map((x,i)=>(<div key={i} className="absolute w-3 bg-emerald-500 rounded-t-full" style={{left:`${x}%`,top:'15%',height:`${8+i*2}px`,animation:`anim-grow ${3+i}s ease-out infinite`,transformOrigin:'bottom'}}/>))}<div className="absolute w-full h-1 bottom-[38%] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" style={{animation:'anim-fiber-pulse 2s linear infinite'}}/></div>);

export const ReservoirFill = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden flex items-center justify-center"><div className="w-16 h-12 border-2 border-slate-600 rounded-b-lg relative overflow-hidden"><div className="absolute bottom-0 w-full bg-blue-500/60" style={{animation:'anim-grow 4s ease-out infinite',transformOrigin:'bottom',height:'100%'}}/><div className="absolute bottom-0 w-[200%] h-2 bg-blue-400/30 rounded-full" style={{animation:'anim-hydro-wave-1 2s ease-in-out infinite'}}/></div></div>);

export const CanalNetwork = () => (<div className="absolute inset-0 bg-emerald-900 overflow-hidden"><svg className="absolute w-full h-full opacity-50" viewBox="0 0 200 50"><path d="M0,25 L50,25 L50,10 L100,10 M50,25 L50,40 L100,40 M100,10 L150,10 L150,25 L200,25 M100,40 L150,40 L150,25" fill="none" stroke="#38bdf8" strokeWidth="2"/>{[50,100,150].map((x,i)=>(<circle key={i} cx={x} cy={[25,10,25][i]} r="2" fill="#38bdf8" style={{animation:`anim-pulse-slow 1s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>))}</svg></div>);

export const RainHarvest = () => (<div className="absolute inset-0 bg-slate-700 overflow-hidden">{[...Array(8)].map((_,i)=>(<div key={i} className="absolute w-0.5 h-2 bg-blue-300/60 rounded-full" style={{left:`${10+Math.random()*80}%`,animation:`anim-drip ${1.5+Math.random()}s linear infinite`,animationDelay:`${Math.random()*2}s`}}/>))}<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-6 border-2 border-slate-500 rounded-b-lg overflow-hidden"><div className="absolute bottom-0 w-full h-[50%] bg-blue-500/50" style={{animation:'anim-grow 5s ease-out infinite',transformOrigin:'bottom'}}/></div></div>);

export const FloodWarning = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden"><div className="absolute bottom-0 w-full bg-blue-600/50" style={{height:'40%',animation:'anim-grow 3s ease-in-out infinite alternate',transformOrigin:'bottom'}}/><div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1"><svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}><path d="M1,21L12,2L23,21H1z M12,18h0v0h0v0z M12,16h0V10h0V16z"/></svg><span className="text-[7px] text-amber-400 font-mono font-bold">FLOOD</span></div></div>);

export const WaterQuality = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center gap-4 px-4">{[{l:'pH',v:'6.8',c:'#22c55e'},{l:'TDS',v:'450',c:'#0ea5e9'},{l:'EC',v:'1.2',c:'#a855f7'}].map((d,i)=>(<div key={i} className="flex flex-col items-center"><span className="text-[7px] font-mono" style={{color:d.c,opacity:0.6}}>{d.l}</span><span className="text-xs font-bold font-mono" style={{color:d.c,animation:`anim-pulse-slow 2s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}>{d.v}</span></div>))}</div>);

export const Fogponics = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden">{[...Array(15)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-blue-300/40 rounded-full blur-[1px]" style={{left:`${Math.random()*100}%`,bottom:`${Math.random()*40}%`,animation:`anim-photosynthesis ${2+Math.random()*2}s linear infinite`,animationDelay:`${Math.random()*3}s`}}/>))}<div className="absolute bottom-0 w-full h-[20%] bg-emerald-900/40"/>{[20,50,80].map(x=>(<div key={x} className="absolute w-1 bg-emerald-500/50 rounded-t-full" style={{left:`${x}%`,bottom:'15%',height:'12px'}}/>))}</div>);


// --- Phase 2: Water & Irrigation ---

// Aquifer - underground water table
export const Aquifer = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-0 w-full h-[35%] bg-amber-800"/>
    <div className="absolute" style={{top:'35%',width:'100%',height:'15%',background:'repeating-linear-gradient(90deg,#92400e 0,#92400e 8px,#78350f 8px,#78350f 16px)'}}/>
    <div className="absolute bottom-0 w-full h-[50%] bg-blue-900/80"/>
    <div className="absolute" style={{top:'50%',left:0,right:0,bottom:0,background:'radial-gradient(ellipse 80% 60% at 50% 80%,rgba(56,189,248,0.3) 0%,transparent 100%)',animation:'anim-pulse-slow 4s ease-in-out infinite'}}/>
    <div className="absolute bottom-4 left-0 right-0 text-center text-[7px] font-mono text-blue-300">AQUIFER</div>
  </div>
);

// CenterPivot - pivot arm rotating
export const CenterPivot = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-emerald-100 dark:from-slate-900 dark:to-emerald-950 overflow-hidden flex items-center justify-center">
    <div className="absolute bottom-0 w-full h-[40%] bg-emerald-600/40 dark:bg-emerald-900/60"/>
    <div className="absolute bottom-[35%] left-1/2 w-0.5 h-0.5 bg-slate-700 rounded-full"/>
    <div className="absolute bottom-[35%] left-1/2" style={{width:'70%',height:'4px',background:'linear-gradient(90deg,#475569,#64748b)',borderRadius:'2px',transformOrigin:'left center',animation:'anim-spin 8s linear infinite'}}>
      {[30,50,70,90].map(pct=>(
        <div key={pct} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-2 bg-blue-400/80" style={{left:`${pct}%`}}/>
      ))}
    </div>
  </div>
);

// MicroSprinkler - tiny oscillating water jets
export const MicroSprinkler = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-900 dark:to-emerald-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[30%] bg-emerald-600/50 dark:bg-emerald-900/50 rounded-t"/>
    {[20,40,60,80].map((x,i)=>(
      <div key={i} className="absolute" style={{left:`${x}%`,bottom:'25%'}}>
        <div className="w-px h-3 bg-slate-400 mx-auto"/>
        {[[-1,1],[1,1]].map(([dx,dy],j)=>(
          <svg key={j} className="absolute" style={{left:`${dx*6}px`,bottom:'0',width:'16px',height:'20px'}} viewBox="0 0 16 20">
            <path d={`M8,18 Q${dx<0?2:14},8 ${dx<0?0:16},4`} fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2 2"
              style={{animation:`anim-water-arc ${0.5+i*0.1}s linear infinite`,animationDelay:`${j*0.2+i*0.15}s`}}/>
          </svg>
        ))}
      </div>
    ))}
  </div>
);

// FurrowFlow - water flowing along furrows
export const FurrowFlow = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    {[0,1,2,3].map(i=>(
      <div key={i} className="absolute left-0 right-0" style={{top:`${15+i*20}%`,height:'3px',background:'#78350f'}}/>
    ))}
    {[0,1,2,3].map(i=>(
      <div key={i} className="absolute left-0 right-0" style={{top:`${17+i*20}%`,height:'4px',background:'rgba(56,189,248,0.5)',animation:`anim-data-flow ${2+i*0.3}s linear infinite`,animationDelay:`${i*0.4}s`}}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-blue-300">FURROW FLOW</div>
  </div>
);

// FloodGate - gate opening/closing
export const FloodGate = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <rect x="60" y="0" width="12" height="56" fill="#334155"/>
      <rect x="128" y="0" width="12" height="56" fill="#334155"/>
      <rect x="72" y="0" width="56" height="24" rx="2" fill="#475569">
        <animate attributeName="height" values="24;4;24" dur="4s" repeatCount="indefinite"/>
      </rect>
      <rect x="72" y="30" width="56" height="26" fill="#1e40af" opacity="0.6">
        <animate attributeName="height" values="0;26;0" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="y" values="56;30;56" dur="4s" repeatCount="indefinite"/>
      </rect>
      <text x="100" y="52" textAnchor="middle" fill="#60a5fa" fontSize="4" fontFamily="monospace">GATE CONTROL</text>
    </svg>
  </div>
);

// DamRelease - water spilling over dam
export const DamRelease = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-blue-900/70"/>
    <div className="absolute bottom-[38%] left-0 right-0 h-3 bg-blue-400/20" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    <div className="absolute left-1/4 right-1/4 bottom-[35%] top-0 bg-slate-700 rounded-b-lg"/>
    <div className="absolute" style={{left:'38%',bottom:'35%',width:'24%',height:'6px',background:'linear-gradient(180deg,#38bdf8,transparent)',animation:'anim-drone-hover 1.5s ease-in-out infinite'}}/>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-blue-300">DAM RELEASE</div>
  </div>
);

// EvapoRate - evaporation arrows from water surface
export const EvapoRate = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-blue-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-blue-700/60"/>
    {[15,30,45,60,75,88].map((x,i)=>(
      <svg key={i} className="absolute" style={{left:`${x}%`,bottom:'38%',width:'10px',height:'20px',animation:`anim-float-up ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}} viewBox="0 0 10 20">
        <line x1="5" y1="18" x2="5" y2="4" stroke="#7dd3fc" strokeWidth="1.5"/>
        <polygon points="5,0 2,6 8,6" fill="#7dd3fc"/>
      </svg>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-sky-300">EVAPOTRANSPIRATION</div>
  </div>
);

// SoilTension - tensiometer gauge
export const SoilTension = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <div className="absolute bottom-0 w-full h-[55%] bg-amber-950/80"/>
    <svg className="absolute bottom-[48%] left-1/2 -translate-x-1/2 w-10 h-24" viewBox="0 0 40 96">
      <rect x="14" y="50" width="12" height="40" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
      <circle cx="20" cy="8" r="14" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
      <path d="M20,8 m-10,0 a10,10 0 0,1 20,0" fill="none" stroke="#334155" strokeWidth="1"/>
      <line x1="20" y1="8" x2="28" y2="4" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" style={{animation:'anim-spin 4s ease-in-out infinite',transformOrigin:'20px 8px'}}/>
      <circle cx="20" cy="8" r="2" fill="#0e7490"/>
      <text x="20" y="35" textAnchor="middle" fill="#94a3b8" fontSize="3" fontFamily="monospace">kPa</text>
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">SOIL TENSION</div>
  </div>
);

// PipePressure - pressure gauge with animated needle
export const PipePressure = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-16" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
      <path d="M14,42 A20,20 0 0,1 50,42" fill="none" stroke="#334155" strokeWidth="3"/>
      <path d="M14,42 A20,20 0 0,1 32,14" fill="none" stroke="#22c55e" strokeWidth="3"/>
      <path d="M32,14 A20,20 0 0,1 50,42" fill="none" stroke="#ef4444" strokeWidth="3"/>
      <line x1="32" y1="32" x2="32" y2="18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
        style={{animation:'anim-spin 6s ease-in-out infinite',transformOrigin:'32px 32px'}}/>
      <circle cx="32" cy="32" r="3" fill="#64748b"/>
      <text x="32" y="52" textAnchor="middle" fill="#94a3b8" fontSize="4" fontFamily="monospace">PSI</text>
    </svg>
  </div>
);

// FilterWash - water filtering through layers
export const FilterWash = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-24 h-full" viewBox="0 0 96 56" preserveAspectRatio="xMidYMid meet">
      <rect x="24" y="2" width="48" height="6" rx="1" fill="#334155"/>
      <rect x="26" y="8" width="44" height="8" rx="1" fill="#1e40af" opacity="0.7"/>
      <rect x="26" y="16" width="44" height="8" rx="1" fill="#92400e" opacity="0.7"/>
      <rect x="26" y="24" width="44" height="8" rx="1" fill="#57534e" opacity="0.7"/>
      <rect x="24" y="32" width="48" height="6" rx="1" fill="#334155"/>
      {[35,48,60].map((x,i)=>(
        <g key={i}>
          <line x1={x} y1="4" x2={x} y2="10" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" style={{animation:`anim-drone-hover ${1+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
          <line x1={x} y1="36" x2={x} y2="54" stroke="#a5f3fc" strokeWidth="1" opacity="0.6" style={{animation:`anim-drone-hover ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
        </g>
      ))}
      <text x="48" y="54" textAnchor="middle" fill="#38bdf8" fontSize="4" fontFamily="monospace">FILTERED</text>
    </svg>
  </div>
);
