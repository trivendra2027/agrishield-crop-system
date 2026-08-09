import React from 'react';

export const AuroraBorealis = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden"><div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#020617_0%,#10b981_50%,#020617_100%)] opacity-40 mix-blend-screen blur-[30px]" style={{animation:'anim-spin-slow 20s linear infinite'}}/><div className="absolute top-0 right-[-30%] w-[100%] h-[150%] bg-[conic-gradient(from_180deg_at_50%_50%,#020617_0%,#0ea5e9_50%,#020617_100%)] opacity-30 mix-blend-screen blur-[40px]" style={{animation:'anim-spin-reverse-slow 25s linear infinite'}}/></div>);

export const LiquidChrome = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(148,163,184,0.4),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(15,23,42,0.8),transparent_50%)] blur-xl"/><div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.1)_50%,transparent_80%)] opacity-60 mix-blend-overlay" style={{animation:'anim-shine 4s ease-in-out infinite alternate'}}/></div>);

export const GlassmorphicOrbs = () => (<div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden"><div className="absolute w-12 h-12 bg-emerald-500 rounded-full mix-blend-screen filter blur-[15px] opacity-70" style={{animation:'anim-orb-1 10s ease-in-out infinite'}}/><div className="absolute w-16 h-16 bg-cyan-500 rounded-full mix-blend-screen filter blur-[20px] opacity-70" style={{animation:'anim-orb-2 12s ease-in-out infinite'}}/><div className="absolute w-10 h-10 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[15px] opacity-70" style={{animation:'anim-orb-3 8s ease-in-out infinite'}}/><div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"/></div>);

export const DeepSpace = () => (<div className="absolute inset-0 bg-[#050505] overflow-hidden">{[...Array(30)].map((_,i)=>(<div key={i} className="absolute w-[1px] h-[1px] bg-white rounded-full" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`anim-star-zoom ${3+Math.random()*2}s linear infinite`,animationDelay:`${Math.random()*3}s`,opacity:Math.random()}}/>))}</div>);

export const AbyssalBlue = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_150%,#0369a1_0%,transparent_60%)] opacity-50"/><div className="absolute top-0 w-[200%] h-[200%] left-[-50%] bg-[linear-gradient(180deg,rgba(14,165,233,0.15)_0%,transparent_100%)] transform-gpu" style={{animation:'anim-ocean-rays 10s ease-in-out infinite alternate'}}/></div>);

export const NeonEdge = () => (<div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden"><div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" style={{animation:'anim-neon-edge-top 2s linear infinite'}}/><div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-transparent via-fuchsia-400 to-transparent" style={{animation:'anim-neon-edge-bottom 2s linear infinite'}}/></div>);

export const CarbonFiber = () => (<div className="absolute inset-0 bg-[#111] overflow-hidden"><div className="absolute w-[200%] h-[200%] bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a)] bg-[length:10px_10px] bg-[position:0_0,5px_5px] opacity-70" style={{animation:'anim-carbon-shift 4s linear infinite'}}/></div>);

export const VercelDark = () => (<div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center"><div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{animation:'anim-vercel-sweep 3s ease-in-out infinite'}}/></div>);

export const HyperSpeed = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden transform -skew-x-12 scale-110"><div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_20%,rgba(99,102,241,0.3)_50%,transparent_80%)] bg-[length:200%_100%]" style={{animation:'anim-hyperspeed 2s linear infinite'}}/><div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_40%,rgba(236,72,153,0.3)_50%,transparent_60%)] bg-[length:150%_100%]" style={{animation:'anim-hyperspeed-fast 1.5s linear infinite'}}/></div>);

export const SonicWave = () => (<div className="absolute inset-0 bg-[#020617] flex items-center justify-center gap-[2px] overflow-hidden">{[...Array(15)].map((_,i)=>(<div key={i} className="w-[2px] bg-cyan-400/80 rounded-full" style={{height:`${10+Math.random()*20}px`,animation:`anim-sonic-bar 0.8s ease-in-out infinite`,animationDelay:`${Math.random()*0.5}s`}}/>))}</div>);


// --- Phase 2: Premium Abstract ---

// QuantumFluct - quantum fluctuation particles
export const QuantumFluct = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    {Array.from({length:18}).map((_,i)=>(
      <div key={i} className="absolute rounded-full" style={{
        left:`${(i*17+5)%100}%`,top:`${(i*23+10)%100}%`,
        width:`${2+i%4}px`,height:`${2+i%4}px`,
        background:`hsl(${200+i*20},80%,60%)`,
        animation:`anim-pulse-slow ${0.8+i*0.15}s ease-in-out infinite`,
        animationDelay:`${i*0.07}s`,opacity:0.7
      }}/>
    ))}
    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-cyan-900/10"/>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-violet-400">QUANTUM FIELD</div>
  </div>
);

// NeonGrid - glowing neon grid
export const NeonGrid = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      {[0,1,2,3,4,5,6].map(i=>(
        <line key={`v${i}`} x1={i*34} y1="0" x2={i*34} y2="56" stroke="#06b6d4" strokeWidth="0.5" opacity={0.3+i*0.05}/>
      ))}
      {[0,1,2,3,4].map(i=>(
        <line key={`h${i}`} x1="0" y1={i*14} x2="200" y2={i*14} stroke="#8b5cf6" strokeWidth="0.5" opacity={0.3+i*0.05}/>
      ))}
      <circle cx="100" cy="28" r="12" fill="none" stroke="#22d3ee" strokeWidth="1" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <circle cx="100" cy="28" r="4" fill="#22d3ee" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}/>
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">NEON GRID</div>
  </div>
);

// HoloCore - holographic core projection
export const HoloCore = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    {[36,28,20,12].map((r,i)=>(
      <div key={i} className="absolute rounded-full" style={{
        width:r*2,height:r*2,
        border:`1px solid hsl(${160+i*30},80%,60%)`,
        opacity:0.6-i*0.1,
        animation:`anim-spin ${3+i*1.5}s linear infinite`,
        animationDirection: i%2===0?'normal':'reverse'
      }}/>
    ))}
    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}/>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">HOLO CORE</div>
  </div>
);

// SynthWave - synthwave retro scene
export const SynthWave = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-pink-950"/>
    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-orange-400 to-pink-500 rounded-full opacity-80"/>
    <svg className="absolute bottom-0 w-full h-[60%]" viewBox="0 0 200 34" preserveAspectRatio="none">
      {[0,1,2,3,4].map(i=>(
        <path key={i} d={`M0,${8+i*5} L200,${8+i*5}`} fill="none" stroke="#ec4899" strokeWidth="0.5" opacity={0.4-i*0.06}/>
      ))}
      {[0,1,2,3,4,5].map(i=>(
        <path key={i} d={`M${i*40},0 L100,34`} fill="none" stroke="#8b5cf6" strokeWidth="0.4" opacity="0.3"/>
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-pink-300">SYNTH WAVE</div>
  </div>
);

// CyberFluid - flowing metallic fluid
export const CyberFluid = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    {[0,1,2,3].map(i=>(
      <div key={i} className="absolute left-0 right-0 rounded-full opacity-60" style={{
        height:`${8+i*4}px`,
        top:`${10+i*20}%`,
        background:`linear-gradient(90deg, hsl(${180+i*20},80%,40%), hsl(${200+i*20},80%,60%), hsl(${180+i*20},80%,40%))`,
        animation:`anim-data-flow ${2+i*0.5}s linear infinite`,
        animationDelay:`${i*0.4}s`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">CYBER FLUID</div>
  </div>
);

// PrismLight - prism rainbow dispersion
export const PrismLight = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <polygon points="100,5 60,50 140,50" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <line x1="40" y1="28" x2="68" y2="28" stroke="white" strokeWidth="1.5"/>
      {['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6'].map((c,i)=>(
        <line key={i} x1="132" y1="50" x2="195" y2={14+i*6} stroke={c} strokeWidth="1.5" opacity="0.8"/>
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-white/60">PRISM LIGHT</div>
  </div>
);

// TesseractSpin - 4D hypercube rotation
export const TesseractSpin = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-20" viewBox="0 0 80 80">
      <rect x="20" y="20" width="40" height="40" fill="none" stroke="#3b82f6" strokeWidth="1.5"
        style={{animation:'anim-spin 6s linear infinite',transformOrigin:'40px 40px'}}/>
      <rect x="28" y="28" width="24" height="24" fill="none" stroke="#06b6d4" strokeWidth="1"
        style={{animation:'anim-spin 4s linear infinite reverse',transformOrigin:'40px 40px'}}/>
      {[[20,20],[60,20],[20,60],[60,60],[28,28],[52,28],[28,52],[52,52]].filter((_,i)=>i<4).map(([x1,y1],i)=>(
        <line key={i} x1={x1} y1={y1} x2={[28,52,28,52][i]} y2={[28,28,52,52][i]} stroke="#8b5cf6" strokeWidth="0.5"/>
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-blue-400">TESSERACT</div>
  </div>
);

// DarkMatter - invisible mass lensing
export const DarkMatter = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    {[0,1,2,3,4,5,6,7].map(i=>(
      <div key={i} className="absolute rounded-full border border-violet-500/30" style={{
        width:`${8+i*10}px`,height:`${8+i*10}px`,
        animation:`anim-pulse-slow ${1+i*0.3}s ease-in-out infinite`,
        animationDelay:`${i*0.15}s`,opacity:0.5-i*0.05
      }}/>
    ))}
    <div className="w-4 h-4 rounded-full bg-black border-2 border-violet-500" style={{boxShadow:'0 0 15px #8b5cf6'}}/>
    {Array.from({length:8}).map((_,i)=>(
      <div key={i} className="absolute w-1 h-1 rounded-full bg-white/40" style={{
        left:`${30+40*Math.cos(i*45*Math.PI/180)}%`,
        top:`${30+40*Math.sin(i*45*Math.PI/180)}%`,
        animation:`anim-pulse-slow ${0.8+i*0.1}s ease-in-out infinite`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-violet-400">DARK MATTER</div>
  </div>
);

// PlasmaFlow - plasma energy streams
export const PlasmaFlow = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    {[0,1,2,3,4].map(i=>(
      <svg key={i} className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
        <path d={`M0,${10+i*8} Q50,${28+Math.sin(i)*12} 100,${10+i*8} T200,${10+i*8}`}
          fill="none" stroke={`hsl(${280+i*15},90%,60%)`} strokeWidth="1.5" opacity="0.6"
          style={{animation:`anim-data-flow ${3+i*0.5}s linear infinite`,animationDelay:`${i*0.3}s`}}/>
      </svg>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-purple-400">PLASMA FLOW</div>
  </div>
);

// NovaBurst - supernova explosion
export const NovaBurst = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    {[0,1,2,3,4,5,6,7].map(i=>(
      <div key={i} className="absolute rounded-full" style={{
        width:'4px',height:'4px',
        background:`hsl(${30+i*40},90%,60%)`,
        animation:`anim-nova-burst 2s ease-out infinite`,
        animationDelay:`${i*0.1}s`,
        transform:`rotate(${i*45}deg) translateX(0px)`
      }}/>
    ))}
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500" style={{boxShadow:'0 0 20px #f59e0b,0 0 40px #f97316',animation:'anim-pulse-slow 1s ease-in-out infinite'}}/>
    {[16,24,32].map((r,i)=>(
      <div key={i} className="absolute rounded-full border" style={{
        width:r*2,height:r*2,
        borderColor:`hsl(${30+i*30},90%,60%)`,
        animation:`anim-nova-ring ${1.5+i*0.5}s ease-out infinite`,
        animationDelay:`${i*0.2}s`,opacity:0.6-i*0.15
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-orange-400">NOVA BURST</div>
  </div>
);
