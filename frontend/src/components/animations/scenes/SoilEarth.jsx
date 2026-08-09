import React from 'react';

export const SoilLayers = () => (<div className="absolute inset-0 overflow-hidden flex flex-col"><div className="h-[25%] bg-amber-600"/><div className="h-[25%] bg-amber-800"/><div className="h-[25%] bg-stone-700"/><div className="h-[25%] bg-stone-800"/><div className="absolute w-full h-full opacity-20" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 12px,rgba(255,255,255,0.1) 12px,rgba(255,255,255,0.1) 13px)'}}/></div>);

export const MoistureGradient = () => (<div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-800 to-stone-900 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-blue-500/40" style={{animation:'anim-edge-glow 5s linear infinite'}}/><div className="absolute bottom-1 left-2 text-[7px] text-amber-300/60 font-mono">DRY</div><div className="absolute bottom-1 right-2 text-[7px] text-blue-300/60 font-mono">WET</div></div>);

export const MineralCrystals = () => (<div className="absolute inset-0 bg-stone-900 overflow-hidden">{[...Array(8)].map((_,i)=>(<div key={i} className="absolute" style={{left:`${Math.random()*90}%`,top:`${Math.random()*90}%`}}><div className="w-2 h-3 bg-cyan-400/40 rotate-45" style={{animation:`anim-pulse-slow ${2+Math.random()*2}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`,clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'}}/></div>))}</div>);

export const EarthwormTunnel = () => (<div className="absolute inset-0 bg-amber-900 overflow-hidden"><svg className="absolute w-full h-full opacity-50" viewBox="0 0 200 50"><path d="M0,25 Q30,10 60,25 Q90,40 120,25 Q150,10 200,25" fill="none" stroke="#92400e" strokeWidth="4" strokeLinecap="round"/><circle cx="0" cy="25" r="3" fill="#d97706" style={{animation:'anim-fiber-pulse 5s linear infinite'}}/></svg></div>);

export const ErosionFlow = () => (<div className="absolute inset-0 bg-amber-800 overflow-hidden"><div className="absolute top-0 left-0 w-full h-full" style={{background:'linear-gradient(160deg,transparent 40%,rgba(147,197,253,0.3) 50%,transparent 60%)',animation:'anim-shine 3s ease-in-out infinite alternate'}}/>{[...Array(6)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-amber-500 rounded-full" style={{top:`${20+Math.random()*40}%`,animation:`anim-fiber-pulse ${1+Math.random()}s linear infinite`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);

export const CompostCycle = () => (<div className="absolute inset-0 bg-gradient-to-b from-stone-800 to-amber-900 overflow-hidden"><div className="absolute bottom-0 w-full h-[60%] bg-stone-700/80"/>{[...Array(5)].map((_,i)=>(<div key={i} className="absolute w-6 h-[1px] bg-gradient-to-b from-orange-400/30 to-transparent" style={{left:`${15+i*18}%`,bottom:'40%',height:'8px',animation:`anim-photosynthesis ${2+Math.random()}s linear infinite`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);

export const TopoContours = () => (<div className="absolute inset-0 bg-emerald-950 overflow-hidden"><svg className="absolute w-full h-full opacity-40" viewBox="0 0 200 50" fill="none" stroke="#10b981" strokeWidth="0.5"><path d="M0,25 Q50,35 100,25 T200,15" style={{animation:'anim-topo-1 5s ease-in-out infinite'}}/><path d="M0,30 Q50,40 100,30 T200,20" style={{animation:'anim-topo-2 6s ease-in-out infinite'}}/><path d="M0,35 Q50,45 100,35 T200,25" style={{animation:'anim-topo-3 7s ease-in-out infinite'}}/></svg></div>);

export const VolcanicSoil = () => (<div className="absolute inset-0 bg-stone-950 overflow-hidden"><div className="absolute bottom-0 w-full h-[50%] bg-gradient-to-t from-red-900/40 to-transparent"/>{[...Array(8)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-orange-500/60 rounded-full blur-[1px]" style={{left:`${Math.random()*100}%`,bottom:'30%',animation:`anim-photosynthesis ${2+Math.random()*2}s linear infinite`,animationDelay:`${Math.random()*3}s`}}/>))}</div>);

export const DesertDunes = () => (<div className="absolute inset-0 bg-gradient-to-b from-amber-200 to-amber-400 dark:from-amber-900 dark:to-amber-950 overflow-hidden"><svg className="absolute bottom-0 w-[200%] h-[60%] opacity-50" viewBox="0 0 400 50"><path d="M0,30 Q50,10 100,30 Q150,50 200,30 Q250,10 300,30 Q350,50 400,30 L400,50 L0,50 Z" fill="#d97706"/></svg>{[...Array(4)].map((_,i)=>(<div key={i} className="absolute w-0.5 h-0.5 bg-amber-300/50 rounded-full" style={{top:`${Math.random()*50}%`,animation:`anim-fiber-pulse ${3+Math.random()*2}s linear infinite`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);

export const PermafrostThaw = () => (<div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-800 overflow-hidden"><div className="absolute bottom-0 w-full h-[50%] bg-blue-950"/>{[...Array(10)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-cyan-300/40 rotate-45" style={{left:`${Math.random()*100}%`,top:`${30+Math.random()*60}%`,animation:`anim-pulse-slow ${2+Math.random()*2}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`}}/>))}<div className="absolute top-[45%] w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"/></div>);


// --- Phase 2: Soil & Earth ---

// NitrogenFix - nitrogen molecule in soil
export const NitrogenFix = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <rect x="0" y="35" width="200" height="21" fill="#292524"/>
      <circle cx="60" cy="28" r="10" fill="#3730a3" stroke="#818cf8" strokeWidth="1.5" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <text x="60" y="32" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">N₂</text>
      {[[80,25],[85,28],[90,24]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2" fill="#4ade80" style={{animation:`anim-float-up 1.5s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
      ))}
      <circle cx="140" cy="30" r="8" fill="#14532d" stroke="#4ade80" strokeWidth="1"/>
      <text x="140" y="34" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace">NH₃</text>
      <text x="100" y="52" textAnchor="middle" fill="#a78bfa" fontSize="4" fontFamily="monospace">N-FIXATION</text>
    </svg>
  </div>
);

// Phosphorus - phosphate ion diffusing
export const Phosphorus = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-orange-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <rect x="0" y="32" width="200" height="24" fill="#292524"/>
      <circle cx="100" cy="26" r="12" fill="#c2410c" stroke="#fb923c" strokeWidth="1.5"/>
      <text x="100" y="30" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace">P</text>
      {[[0,1],[1,2],[2,1],[-1,2],[-2,1]].map(([dx,dy],i)=>(
        <circle key={i} cx={100+dx*18} cy={26+dy*12} r="3" fill="#fed7aa" style={{animation:`anim-drone-hover ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
      ))}
      <text x="100" y="52" textAnchor="middle" fill="#fb923c" fontSize="4" fontFamily="monospace">PHOSPHORUS</text>
    </svg>
  </div>
);

// Potassium - K+ ion flow
export const Potassium = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-violet-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <path d="M20,28 Q60,10 100,28 T180,28" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="5 3" style={{animation:'anim-data-flow 3s linear infinite'}}/>
      {[40,80,120,160].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy="28" r="6" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" style={{animation:`anim-pulse-slow ${1+i*0.2}s ease-in-out infinite`}}/>
          <text x={x} y="31" textAnchor="middle" fill="white" fontSize="5" fontFamily="monospace">K⁺</text>
        </g>
      ))}
      <text x="100" y="52" textAnchor="middle" fill="#a78bfa" fontSize="4" fontFamily="monospace">POTASSIUM ION</text>
    </svg>
  </div>
);

// Microbiome - diverse bacteria ecosystem
export const Microbiome = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[50%] bg-amber-950/70"/>
    {[
      {x:20,y:55,w:12,h:5,c:'#84cc16'},{x:40,y:58,w:8,h:4,c:'#f59e0b'},
      {x:60,y:54,w:10,h:4,c:'#22c55e'},{x:75,y:57,w:6,h:3,c:'#f97316'},
      {x:85,y:55,w:8,h:4,c:'#10b981'},{x:10,y:60,w:6,h:3,c:'#a3e635'},
    ].map((b,i)=>(
      <div key={i} className="absolute rounded-full" style={{
        left:`${b.x}%`,top:`${b.y}%`,width:`${b.w}px`,height:`${b.h}px`,
        background:b.c,animation:`anim-pulse-slow ${1+i*0.25}s ease-in-out infinite`,animationDelay:`${i*0.2}s`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-amber-400">SOIL MICROBIOME</div>
  </div>
);

// Mycorrhizae - fungal network connecting roots
export const Mycorrhizae = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <path d="M40,10 L40,35 Q60,45 80,38 Q100,32 120,40 Q140,48 160,35 L160,10" fill="none" stroke="#4ade80" strokeWidth="0.8" opacity="0.5"/>
      {[[40,35],[80,38],[120,40],[160,35]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="#166534" stroke="#4ade80" strokeWidth="1" style={{animation:`anim-pulse-slow ${1+i*0.3}s ease-in-out infinite`}}/>
      ))}
      {[[60,48],[100,50],[140,47]].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#78350f" stroke="#a78bfa" strokeWidth="1" style={{animation:`anim-pulse-slow ${1.5+i*0.3}s ease-in-out infinite`}}/>
        </g>
      ))}
      <path d="M40,35 Q60,48 80,38" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.6"/>
      <path d="M80,38 Q100,50 120,40" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.6"/>
      <path d="M120,40 Q140,47 160,35" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.6"/>
    </svg>
  </div>
);

// HumusLayer - layered organic matter
export const HumusLayer = () => (
  <div className="absolute inset-0 overflow-hidden flex flex-col">
    {[
      {color:'#d4a96a',label:'Topsoil',h:'15%'},
      {color:'#a16207',label:'Humus',h:'20%'},
      {color:'#78350f',label:'Sub-soil',h:'25%'},
      {color:'#57534e',label:'Bedrock',h:'40%'},
    ].map((l,i)=>(
      <div key={i} className="relative" style={{height:l.h,background:l.color}}>
        <div className="absolute right-2 top-1 text-[6px] font-mono text-white/70">{l.label}</div>
        {i===1 && <div className="absolute inset-0 bg-amber-900/30" style={{animation:'anim-pulse-slow 3s ease-in-out infinite'}}/>}
      </div>
    ))}
  </div>
);

// ClayParticles - clay platelet structure
export const ClayParticles = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-amber-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      {[10,25,40].map((y,row)=>(
        [20,55,90,125,160].map((x,col)=>(
          <rect key={`${row}-${col}`} x={x+row*5} y={y+5} width="28" height="4" rx="1"
            fill={`hsl(${20+row*10},40%,35%)`} stroke="#57534e" strokeWidth="0.5"
            style={{animation:`anim-pulse-slow ${2+row*0.3}s ease-in-out infinite`,animationDelay:`${col*0.1}s`}}/>
        ))
      ))}
      <text x="100" y="54" textAnchor="middle" fill="#a16207" fontSize="4" fontFamily="monospace">CLAY PLATELETS</text>
    </svg>
  </div>
);

// SiltFlow - silt particles flowing in water
export const SiltFlow = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-800 to-blue-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[50%] bg-blue-900/60"/>
    {[10,20,35,50,65,80,90].map((x,i)=>(
      <div key={i} className="absolute bg-amber-400/70 rounded-full" style={{
        left:`${x}%`,top:`${35+i%3*5}%`,
        width:'4px',height:'4px',
        animation:`anim-float-up ${2+i*0.3}s ease-in-out infinite`,
        animationDelay:`${i*0.25}s`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-blue-300">SILT FLOW</div>
  </div>
);

// SandTexture - sand grain zoom texture
export const SandTexture = () => (
  <div className="absolute inset-0 bg-amber-800 overflow-hidden">
    {Array.from({length:30}).map((_,i)=>(
      <div key={i} className="absolute rounded-full bg-amber-600/60" style={{
        left:`${(i*17)%100}%`,top:`${(i*23)%100}%`,
        width:`${4+i%4}px`,height:`${3+i%3}px`,
        transform:`rotate(${i*37}deg)`,
        animation:`anim-pulse-slow ${1+i*0.05}s ease-in-out infinite`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-amber-200">SAND TEXTURE</div>
  </div>
);

// Bedrock - cracked rock strata
export const Bedrock = () => (
  <div className="absolute inset-0 bg-slate-700 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      {['M0,18 L60,15 L100,20 L150,16 L200,19','M0,30 L40,28 L90,33 L140,29 L200,32','M0,44 L50,41 L100,46 L160,42 L200,45'].map((d,i)=>(
        <path key={i} d={d} fill="none" stroke="#475569" strokeWidth="1.5"/>
      ))}
      {[[30,22],[70,35],[120,25],[170,38]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2" fill="#94a3b8" opacity="0.6"/>
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-slate-300">BEDROCK</div>
  </div>
);
