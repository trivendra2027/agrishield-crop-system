import React from 'react';

export const DiseaseScan = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-14 opacity-70" viewBox="0 0 60 50"><path d="M10,40 Q20,10 30,25 Q40,10 50,40 Z" fill="#22c55e"/></svg>
    <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" style={{animation:'anim-vercel-sweep 2s linear infinite'}}/>
    <div className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}/>
  </div>
);

export const SporeAlert = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    {[...Array(12)].map((_,i)=>(<div key={i} className="absolute w-1.5 h-1.5 bg-red-500/70 rounded-full blur-[1px]" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`anim-photosynthesis ${2+Math.random()*2}s linear infinite reverse`,animationDelay:`${Math.random()*3}s`}}/>))}
    <div className="absolute inset-0 border-2 border-red-500/20 rounded-lg" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
  </div>
);

export const AiDiagnosis = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-10 h-10 opacity-60" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#0ea5e9" strokeWidth="1" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/><circle cx="20" cy="20" r="8" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" style={{animation:'anim-radar-sweep 3s linear infinite'}}/><circle cx="20" cy="20" r="2" fill="#0ea5e9"/></svg>
    <svg className="absolute right-4 top-3 w-8 h-8 opacity-40" viewBox="0 0 30 30"><path d="M5,25 Q10,5 15,15 Q20,5 25,25 Z" fill="#22c55e"/></svg>
    <div className="absolute left-4 top-4 text-[8px] text-cyan-400/60 font-mono">AI SCAN</div>
  </div>
);

export const MicroscopeView = () => (
  <div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center">
    <div className="w-20 h-20 rounded-full border-4 border-slate-700 bg-emerald-950/50 flex items-center justify-center overflow-hidden">
      <div className="w-12 h-12 rounded-full border border-emerald-500/30" style={{animation:'anim-pulse-slow 3s ease-in-out infinite'}}>
        <div className="w-6 h-6 rounded-full border border-emerald-500/20 mx-auto mt-3"/>
      </div>
    </div>
    <div className="absolute w-[1px] h-full bg-emerald-500/20"/><div className="absolute w-full h-[1px] bg-emerald-500/20"/>
  </div>
);

export const HealthSpectrum = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center px-6">
    <div className="w-full h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 relative overflow-hidden">
      <div className="absolute top-0 h-full w-1 bg-white shadow-[0_0_8px_white] rounded-full" style={{animation:'anim-edge-glow 4s linear infinite'}}/>
    </div>
    <div className="absolute top-2 left-6 text-[7px] text-red-400 font-mono">DISEASED</div>
    <div className="absolute top-2 right-6 text-[7px] text-emerald-400 font-mono">HEALTHY</div>
  </div>
);

export const LeafXray = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-14 opacity-60" viewBox="0 0 60 50"><path d="M30,5 Q10,20 15,40 Q20,35 30,45 Q40,35 45,40 Q50,20 30,5 Z" fill="none" stroke="#22c55e" strokeWidth="1"/>
      <line x1="30" y1="10" x2="30" y2="42" stroke="#22c55e" strokeWidth="0.5" opacity="0.5"/>
      <line x1="20" y1="25" x2="30" y2="20" stroke="#22c55e" strokeWidth="0.5" opacity="0.4"/><line x1="40" y1="25" x2="30" y2="20" stroke="#22c55e" strokeWidth="0.5" opacity="0.4"/>
    </svg>
    <div className="absolute inset-0 bg-emerald-500/5" style={{animation:'anim-pulse-slow 3s ease-in-out infinite'}}/>
  </div>
);

export const PathogenTrack = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-14 h-12 opacity-50" viewBox="0 0 50 40"><path d="M25,5 Q10,15 15,35 Q20,30 25,38 Q30,30 35,35 Q40,15 25,5 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1"/></svg>
    {[...Array(6)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-red-500 rounded-full" style={{left:`${30+Math.random()*40}%`,top:`${20+Math.random()*60}%`,animation:`anim-pulse-slow ${1+Math.random()}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`}}/>))}
  </div>
);

export const ConfidenceMeter = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-16" viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="#1e293b" strokeWidth="4"/>
      <circle cx="30" cy="30" r="22" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="138 138" strokeDashoffset="14" strokeLinecap="round" transform="rotate(-90 30 30)" style={{animation:'anim-ekg-pulse 3s linear infinite'}}/>
      <text x="30" y="33" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">95%</text>
    </svg>
  </div>
);

export const ImageClassify = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center px-4 gap-3">
    <div className="w-10 h-10 bg-emerald-900/50 rounded border border-emerald-500/30 flex items-center justify-center">
      <svg className="w-6 h-6 text-emerald-500 opacity-60" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
    </div>
    <div className="flex flex-col gap-1">
      <div className="h-1.5 w-20 bg-emerald-500/70 rounded-full" style={{animation:'anim-grow 2s ease-out infinite',transformOrigin:'left'}}/>
      <div className="h-1.5 w-14 bg-amber-500/50 rounded-full" style={{animation:'anim-grow 2s ease-out infinite',animationDelay:'0.3s',transformOrigin:'left'}}/>
      <div className="h-1.5 w-8 bg-red-500/30 rounded-full" style={{animation:'anim-grow 2s ease-out infinite',animationDelay:'0.6s',transformOrigin:'left'}}/>
    </div>
  </div>
);

export const ModelTraining = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full p-3 opacity-70" viewBox="0 0 100 40">
      <path d="M5,35 Q25,30 40,20 Q60,8 95,5" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" style={{strokeDasharray:120,strokeDashoffset:120,animation:'anim-ekg-pulse 4s linear infinite'}}/>
      <path d="M5,5 Q25,10 40,20 Q60,32 95,35" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" style={{strokeDasharray:120,strokeDashoffset:120,animation:'anim-ekg-pulse 4s linear infinite',animationDelay:'0.5s'}}/>
      <text x="5" y="8" fill="#22c55e" fontSize="5">ACC</text><text x="5" y="38" fill="#ef4444" fontSize="5">LOSS</text>
    </svg>
  </div>
);


// --- Phase 2: Disease Detection ---

// VirusTrace - virus particle with spike proteins
export const VirusTrace = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-red-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-20" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="16" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
        <g key={i} transform={`rotate(${a} 40 40)`}>
          <line x1="40" y1="24" x2="40" y2="16" stroke="#f87171" strokeWidth="1.5"/>
          <circle cx="40" cy="14" r="3" fill="#fca5a5" style={{animation:`anim-pulse-slow ${1+i*0.1}s ease-in-out infinite`}}/>
        </g>
      ))}
      <text x="40" y="73" textAnchor="middle" fill="#f87171" fontSize="5" fontFamily="monospace">VIRUS TRACE</text>
    </svg>
  </div>
);

// BacteriaScan - scanning beam over bacteria
export const BacteriaScan = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    <div className="absolute inset-0 bg-green-900/10"/>
    <div className="absolute left-0 right-0 h-0.5 bg-green-400/60" style={{top:'30%',boxShadow:'0 0 8px #4ade80',animation:'anim-scan-line 3s ease-in-out infinite'}}/>
    {[[30,35],[80,45],[130,30],[160,42],[50,48]].map(([x,y],i)=>(
      <div key={i} className="absolute rounded-full bg-emerald-400/80" style={{left:`${x}%`,top:`${y}%`,width:'6px',height:'9px',borderRadius:'50%',animation:`anim-pulse-slow ${1+i*0.3}s ease-in-out infinite`}}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-green-400">SCANNING...</div>
  </div>
);

// FungiSpores - spores floating upward
export const FungiSpores = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-yellow-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[30%] bg-amber-950/80"/>
    {[15,30,50,65,80].map((x,i)=>(
      <div key={i} className="absolute bg-amber-400 rounded-full" style={{
        left:`${x}%`,bottom:'25%',width:'5px',height:'5px',
        animation:`anim-float-up ${2+i*0.5}s ease-in-out infinite`,
        animationDelay:`${i*0.4}s`,opacity:0.8
      }}/>
    ))}
    <svg className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-16 h-8" viewBox="0 0 64 32">
      <ellipse cx="32" cy="24" rx="28" ry="8" fill="#92400e"/>
      <path d="M10,24 Q32,4 54,24" fill="#78350f" stroke="#b45309" strokeWidth="1"/>
    </svg>
  </div>
);

// NematodeAlert - worm-like nematode moving
export const NematodeAlert = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[50%] bg-amber-900/50"/>
    <svg className="absolute bottom-[40%] w-full h-12" viewBox="0 0 200 48">
      <path d="M10,24 Q30,10 50,24 Q70,38 90,24 Q110,10 130,24 Q150,38 170,24 Q185,15 195,24"
        fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round"
        style={{animation:'anim-worm-move 3s ease-in-out infinite'}}/>
      <circle cx="10" cy="24" r="4" fill="#fbbf24"/>
    </svg>
    <div className="absolute top-3 right-3 text-[7px] font-mono text-red-400" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}>⚠ ALERT</div>
  </div>
);

// BlightZone - spreading blight on leaf
export const BlightZone = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-24 h-16" viewBox="0 0 96 64">
      <ellipse cx="48" cy="32" rx="44" ry="26" fill="#166534"/>
      <path d="M48,6 L48,58" stroke="#15803d" strokeWidth="1"/>
      {[[-16,-5],[-8,-10],[8,-12],[16,-8]].map(([dx,dy],i)=>(
        <line key={i} x1="48" y1="32" x2={48+dx} y2={32+dy} stroke="#15803d" strokeWidth="0.8"/>
      ))}
      <circle cx="38" cy="28" r="0" fill="#78350f" style={{animation:'anim-blight-spread 3s ease-out forwards'}}>
        <animate attributeName="r" values="0;12;14" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.7;0.9" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="55" cy="36" r="0" fill="#713f12">
        <animate attributeName="r" values="0;8;9" dur="3s" repeatCount="indefinite" begin="0.8s"/>
      </circle>
    </svg>
  </div>
);

// RustAlert - rust colored spots spreading on leaf
export const RustAlert = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-orange-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <div className="relative w-24 h-14 bg-green-800 rounded-[50%]">
      {[[20,30],[40,20],[55,35],[70,25],[35,45],[60,42]].map(([x,y],i)=>(
        <div key={i} className="absolute rounded-full bg-orange-600" style={{
          left:`${x}%`,top:`${y}%`,
          width:'8px',height:'8px',
          animation:`anim-pulse-slow ${1.2+i*0.2}s ease-in-out infinite`,
          animationDelay:`${i*0.3}s`
        }}/>
      ))}
    </div>
    <div className="absolute top-2 right-3 text-[7px] font-mono text-orange-400">RUST DETECTED</div>
  </div>
);

// MildewScan - powdery mildew detection with UV light
export const MildewScan = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 bg-violet-900/10"/>
    <div className="absolute top-0 left-1/3 w-1/3 h-full bg-gradient-to-b from-violet-500/20 to-transparent" style={{animation:'anim-scan-line 4s ease-in-out infinite'}}/>
    <div className="relative w-28 h-10 bg-emerald-900/60 rounded-lg overflow-hidden">
      {[[20,40],[35,60],[50,30],[65,70],[80,45]].map((x,i)=>(
        <div key={i} className="absolute bg-white/40 rounded-full" style={{left:`${x}%`,top:'30%',width:'5px',height:'5px',animation:`anim-pulse-slow ${1+i*0.2}s ease-in-out infinite`}}/>
      ))}
    </div>
    <div className="absolute bottom-2 text-[7px] font-mono text-violet-400">UV SCAN ACTIVE</div>
  </div>
);

// LesionDetect - AI bounding boxes on leaf lesions
export const LesionDetect = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <div className="relative w-28 h-16 bg-green-900/40 rounded">
      {[[15,20,25,22],[55,40,20,18],[75,15,18,16]].map(([x,y,w,h],i)=>(
        <div key={i} className="absolute border-2 border-red-500 rounded-sm" style={{
          left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h*1.5}px`,
          animation:`anim-pulse-slow ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.4}s`
        }}>
          <div className="absolute -top-[9px] left-0 text-[5px] text-red-400 font-mono">L{i+1}</div>
        </div>
      ))}
    </div>
    <div className="absolute bottom-2 text-[7px] font-mono text-red-400">AI DETECTION</div>
  </div>
);

// SpectralScan - spectral analysis rainbow bar
export const SpectralScan = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex flex-col items-center justify-center gap-2">
    <div className="text-[7px] font-mono text-cyan-400">HYPERSPECTRAL</div>
    <div className="w-40 h-6 rounded overflow-hidden flex">
      {['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'].map((c,i)=>(
        <div key={i} className="flex-1" style={{background:c,animation:`anim-pulse-slow ${1+i*0.15}s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}/>
      ))}
    </div>
    <div className="w-40 h-1 bg-slate-700 rounded-full"><div className="h-full w-2/3 bg-cyan-400 rounded-full" style={{animation:'anim-data-flow 2s ease-in-out infinite'}}/></div>
  </div>
);

// BioAssay - petri dish with culture growth
export const BioAssay = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-16" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#0f172a" stroke="#334155" strokeWidth="3"/>
      <circle cx="32" cy="32" r="24" fill="#0f2e1f" stroke="#166534" strokeWidth="1"/>
      <circle cx="32" cy="32" r="0" fill="#22c55e" opacity="0.4">
        <animate attributeName="r" values="0;18;20;18" dur="4s" repeatCount="indefinite"/>
      </circle>
      {[[20,22],[38,18],[44,36],[24,40]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill="#4ade80" style={{animation:`anim-pulse-slow ${1.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
      ))}
      <text x="32" y="58" textAnchor="middle" fill="#4ade80" fontSize="4" fontFamily="monospace">CULTURE</text>
    </svg>
  </div>
);
