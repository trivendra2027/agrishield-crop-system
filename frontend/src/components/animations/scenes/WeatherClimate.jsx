import React from 'react';

export const GentleRain = () => (<div className="absolute inset-0 bg-slate-700 overflow-hidden"><div className="absolute inset-0 opacity-40" style={{backgroundImage:'radial-gradient(ellipse at center,rgba(255,255,255,0.8) 0%,transparent 8%)',backgroundSize:'8px 12px',animation:'anim-rain 0.4s linear infinite'}}/><div className="absolute top-0 w-full h-6 bg-slate-600/80 blur-sm"/></div>);

export const HeavyStorm = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden" style={{animation:'anim-lightning 8s infinite'}}><div className="absolute inset-0 opacity-50" style={{backgroundImage:'radial-gradient(ellipse at center,rgba(255,255,255,0.9) 0%,transparent 8%)',backgroundSize:'6px 10px',animation:'anim-rain 0.3s linear infinite'}}/><svg className="absolute top-3 left-[40%] w-6 h-8 opacity-0" style={{animation:'anim-bolt 8s infinite'}} viewBox="0 0 24 24" fill="#fbbf24"><path d="M13,2L3,14h9l-1,10L21,10H12Z"/></svg></div>);

export const Snowfall = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden">{[...Array(18)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={{left:`${Math.random()*100}%`,animation:`anim-snow ${3+Math.random()*3}s linear infinite`,animationDelay:`-${Math.random()*5}s`}}/>))}<div className="absolute bottom-0 w-full h-3 bg-white/70 rounded-t-lg"/></div>);

export const MistyMorning = () => (<div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 overflow-hidden"><div className="absolute bottom-0 w-[200%] h-full bg-gradient-to-t from-white/70 via-white/30 to-transparent dark:from-slate-400/30 dark:via-slate-500/10" style={{animation:'anim-fog 25s linear infinite'}}/><div className="absolute bottom-0 w-[200%] h-full bg-gradient-to-t from-white/50 via-white/10 to-transparent dark:from-slate-300/20" style={{animation:'anim-fog 35s linear infinite reverse'}}/></div>);

export const GoldenSunrise = () => (<div className="absolute inset-0 bg-gradient-to-t from-orange-400 via-amber-300 to-sky-300 dark:from-orange-900 dark:via-amber-800 dark:to-indigo-900 overflow-hidden"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-yellow-300 rounded-t-full blur-[6px]" style={{animation:'anim-grow 6s ease-out infinite',transformOrigin:'bottom'}}/><div className="absolute bottom-0 w-full h-[20%] bg-black/20"/></div>);

export const PurpleSunset = () => (<div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-rose-500 to-violet-700 overflow-hidden"><div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-12 h-6 bg-orange-300 rounded-t-full blur-[4px] opacity-80"/><div className="absolute bottom-0 w-full h-[25%] bg-black/30"/></div>);

export const HeatwaveShimmer = () => (<div className="absolute inset-0 bg-gradient-to-b from-amber-400 to-orange-300 dark:from-amber-900 dark:to-orange-950 overflow-hidden"><div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.3)_3px,rgba(255,255,255,0.3)_6px)]" style={{animation:'anim-ocean-rays 3s ease-in-out infinite alternate'}}/></div>);

export const RainbowArc = () => (<div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden"><svg className="absolute w-full h-full opacity-40" viewBox="0 0 200 50"><path d="M20,45 Q100,-20 180,45" fill="none" stroke="red" strokeWidth="2"/><path d="M25,45 Q100,-15 175,45" fill="none" stroke="orange" strokeWidth="2"/><path d="M30,45 Q100,-10 170,45" fill="none" stroke="yellow" strokeWidth="2"/><path d="M35,45 Q100,-5 165,45" fill="none" stroke="green" strokeWidth="2"/><path d="M40,45 Q100,0 160,45" fill="none" stroke="blue" strokeWidth="2"/><path d="M45,45 Q100,5 155,45" fill="none" stroke="indigo" strokeWidth="2"/></svg><div className="absolute inset-0" style={{animation:'anim-pulse-slow 4s ease-in-out infinite'}}/></div>);

export const WindGusts = () => (<div className="absolute inset-0 bg-sky-200 dark:bg-slate-800 overflow-hidden">{[...Array(5)].map((_,i)=>(<div key={i} className="absolute h-[1px] bg-gradient-to-r from-transparent via-slate-400/60 to-transparent" style={{top:`${15+i*15}%`,width:'60%',animation:`anim-fiber-pulse ${1+Math.random()}s linear infinite`,animationDelay:`${Math.random()*2}s`}}/>))}{[...Array(4)].map((_,i)=>(<svg key={`l${i}`} className="absolute w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="#65a30d" style={{top:`${Math.random()*80}%`,animation:`anim-fiber-pulse ${2+Math.random()}s linear infinite`,animationDelay:`${Math.random()*3}s`}}><path d="M12,2C12,2 22,8 22,15C22,19 18,22 12,22C6,22 2,19 2,15C2,8 12,2 12,2Z"/></svg>))}</div>);

export const CloudDrift = () => (<div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">{[{t:15,s:30,d:0},{t:35,s:20,d:3},{t:25,s:25,d:6}].map((c,i)=>(<div key={i} className="absolute bg-white/70 dark:bg-slate-500/50 rounded-full blur-[2px]" style={{top:`${c.t}%`,width:`${c.s}px`,height:`${c.s/2.5}px`,animation:`anim-fiber-pulse ${12+i*4}s linear infinite`,animationDelay:`${c.d}s`}}/>))}</div>);


// --- Phase 2: Weather & Climate ---

// Tornado - rotating funnel cloud
export const Tornado = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-500 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      {[0,1,2,3,4,5].map(i => (
        <ellipse key={i} cx="100" cy={10+i*7} rx={4+i*8} ry={2+i*1.5}
          fill="none" stroke="#64748b" strokeWidth="1.5"
          style={{animation:`anim-spin ${2-i*0.2}s linear infinite`,transformOrigin:`100px ${10+i*7}px`}}/>
      ))}
      <path d="M88,50 L100,56 L112,50" fill="#475569"/>
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-slate-200">TORNADO ALERT</div>
  </div>
);

// Hailstorm - hail bouncing off ground
export const Hailstorm = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 overflow-hidden">
    {[10,25,40,55,70,85].map((x,i)=>(
      <div key={i} className="absolute rounded-full bg-slate-100/80" style={{
        left:`${x}%`,width:'6px',height:'6px',
        animation:`anim-hailfall ${0.8+i*0.15}s linear infinite`,
        animationDelay:`${i*0.2}s`
      }}/>
    ))}
    <div className="absolute bottom-0 w-full h-3 bg-slate-700"/>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-slate-200">HAILSTORM</div>
  </div>
);

// FrostWarning - ice crystals forming
export const FrostWarning = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-20" viewBox="0 0 80 80">
      {[0,30,60,90,120,150].map((a,i)=>(
        <line key={i} x1="40" y1="40" x2={40+30*Math.cos(a*Math.PI/180)} y2={40+30*Math.sin(a*Math.PI/180)}
          stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round"
          style={{animation:`anim-grow ${1+i*0.1}s ease-out forwards`,animationDelay:`${i*0.1}s`}}/>
      ))}
      {[0,30,60,90,120,150].map((a,i)=>(
        <g key={i} transform={`rotate(${a} 40 40) translate(0,-22)`}>
          <line x1="40" y1="40" x2="36" y2="36" stroke="#93c5fd" strokeWidth="1"/>
          <line x1="40" y1="40" x2="44" y2="36" stroke="#93c5fd" strokeWidth="1"/>
        </g>
      ))}
      <text x="40" y="75" textAnchor="middle" fill="#bfdbfe" fontSize="4" fontFamily="monospace">FROST</text>
    </svg>
  </div>
);

// DewDrop - dewdrop forming on leaf edge
export const DewDrop = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <path d="M40,10 Q100,40 160,10" fill="#166534" stroke="#22c55e" strokeWidth="1.5"/>
      {[60,100,140].map((x,i)=>(
        <g key={i}>
          <ellipse cx={x} cy="22" rx="5" ry="8" fill="url(#dewGrad)" style={{animation:`anim-drone-hover ${2+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
          <ellipse cx={x-1} cy="19" rx="2" ry="2" fill="rgba(255,255,255,0.3)"/>
        </g>
      ))}
      <defs><radialGradient id="dewGrad" cx="30%" cy="30%"><stop offset="0%" stopColor="#e0f2fe"/><stop offset="100%" stopColor="#38bdf8"/></radialGradient></defs>
    </svg>
  </div>
);

// MonsoonRain - heavy diagonal rain
export const MonsoonRain = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
    {Array.from({length:16}).map((_,i)=>(
      <div key={i} className="absolute bg-blue-300/60 rounded-full" style={{
        left:`${(i*7)%100}%`,top:'-10%',
        width:'1px',height:'12px',
        transform:'rotate(15deg)',
        animation:`anim-rain-fall ${0.6+Math.random()*0.4}s linear infinite`,
        animationDelay:`${Math.random()*1}s`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-blue-300">MONSOON</div>
  </div>
);

// DroughtHeat - heat shimmer waves
export const DroughtHeat = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-orange-400 to-amber-800 overflow-hidden">
    <div className="absolute top-2 right-6 w-8 h-8 bg-yellow-300 rounded-full" style={{boxShadow:'0 0 20px #fbbf24',animation:'anim-pulse-slow 3s ease-in-out infinite'}}/>
    {[0,1,2,3].map(i=>(
      <div key={i} className="absolute left-0 right-0 border-t border-orange-300/30 rounded-full"
        style={{top:`${40+i*12}%`,animation:`anim-heat-shimmer ${2+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
    ))}
    <div className="absolute bottom-0 w-full h-[30%] bg-amber-900/80"/>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-orange-200">DROUGHT ALERT</div>
  </div>
);

// Microclimate - temp zones side by side
export const Microclimate = () => (
  <div className="absolute inset-0 overflow-hidden flex">
    <div className="flex-1 bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col items-center justify-center">
      <div className="text-blue-300 text-lg">❄</div>
      <div className="text-[7px] font-mono text-blue-300">18°C</div>
    </div>
    <div className="w-px bg-white/20" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    <div className="flex-1 bg-gradient-to-b from-orange-900 to-red-950 flex flex-col items-center justify-center">
      <div className="text-orange-300 text-lg">☀</div>
      <div className="text-[7px] font-mono text-orange-300">34°C</div>
    </div>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-white/60">MICROCLIMATE</div>
  </div>
);

// Barometer - animated pressure gauge
export const Barometer = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-16" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#334155" strokeWidth="1"/>
      {[0,30,60,90,120,150,180,210,240].map((a,i)=>(
        <line key={i} x1={32+20*Math.cos((a-90)*Math.PI/180)} y1={32+20*Math.sin((a-90)*Math.PI/180)}
          x2={32+24*Math.cos((a-90)*Math.PI/180)} y2={32+24*Math.sin((a-90)*Math.PI/180)}
          stroke="#64748b" strokeWidth="1"/>
      ))}
      <line x1="32" y1="32" x2="32" y2="12" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"
        style={{animation:'anim-spin 6s ease-in-out infinite',transformOrigin:'32px 32px'}}/>
      <circle cx="32" cy="32" r="3" fill="#0e7490"/>
      <text x="32" y="52" textAnchor="middle" fill="#94a3b8" fontSize="4" fontFamily="monospace">hPa</text>
    </svg>
  </div>
);

// WindRose - compass rose showing wind
export const WindRose = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-20" viewBox="0 0 80 80">
      {['N','E','S','W'].map((d,i)=>(
        <text key={i} x={40+(i===1?24:i===3?-24:0)} y={40+(i===2?26:i===0?-18:5)} textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="monospace">{d}</text>
      ))}
      <circle cx="40" cy="40" r="22" fill="none" stroke="#334155" strokeWidth="1"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1="40" y1="40" x2={40+20*Math.cos((a-90)*Math.PI/180)} y2={40+20*Math.sin((a-90)*Math.PI/180)}
          stroke={i<4?"#60a5fa":"#334155"} strokeWidth={i<4?1.5:0.8}/>
      ))}
      <g style={{animation:'anim-spin 4s linear infinite',transformOrigin:'40px 40px'}}>
        <polygon points="40,20 37,40 40,38 43,40" fill="#3b82f6"/>
        <polygon points="40,58 37,40 40,42 43,40" fill="#64748b"/>
      </g>
      <circle cx="40" cy="40" r="3" fill="#1d4ed8"/>
    </svg>
  </div>
);

// OzoneLayer - atmospheric layers diagram
export const OzoneLayer = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    {[
      {color:'#1e3a5f',label:'Troposphere',y:'75%'},
      {color:'#164e63',label:'Stratosphere',y:'55%'},
      {color:'#0c4a6e',label:'Ozone Layer',y:'40%'},
      {color:'#0369a1',label:'Mesosphere',y:'22%'},
    ].map((l,i)=>(
      <div key={i} className="absolute left-0 right-0" style={{top:l.y,height:'18%',background:l.color,opacity:0.8+(i*0.05)}}>
        <div className="absolute right-2 top-1 text-[6px] font-mono text-sky-300 opacity-80">{l.label}</div>
      </div>
    ))}
    <div className="absolute top-[40%] left-0 right-0 h-[5%] bg-emerald-400/30" style={{animation:'anim-pulse-slow 3s ease-in-out infinite'}}/>
    <div className="absolute top-1 right-2 text-[6px] font-mono text-amber-300">☀ UV</div>
  </div>
);
