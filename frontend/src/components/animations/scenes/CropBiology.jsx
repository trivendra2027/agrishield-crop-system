import React from 'react';

export const SeedSprouting = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-950 dark:to-slate-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[55%] bg-amber-800/70 dark:bg-amber-900"/>
    <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 flex flex-col items-center">
      <div className="w-1 bg-emerald-500 rounded-t-full" style={{height:'0px',animation:'anim-grow 4s ease-out forwards',transformOrigin:'bottom'}}/>
      <div className="w-3 h-2 bg-emerald-400 rounded-t-full mt-[-1px]" style={{opacity:0,animation:'anim-photosynthesis 4s ease-out 2s forwards'}}/>
    </div>
    <div className="absolute bottom-[42%] left-1/2 -translate-x-1/2 w-4 h-3 bg-amber-600 rounded-full"/>
  </div>
);

export const Photosynthesis = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-400/15 blur-xl rounded-full"/>
    {[...Array(12)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-emerald-400 rounded-full opacity-60" style={{left:`${20+Math.random()*60}%`,bottom:'-5px',animation:`anim-photosynthesis ${2+Math.random()*2}s linear infinite`,animationDelay:`${Math.random()*3}s`}}/>))}
    <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 opacity-60" viewBox="0 0 60 40"><ellipse cx="30" cy="15" rx="20" ry="12" fill="none" stroke="#22c55e" strokeWidth="1"/></svg>
  </div>
);

export const ChlorophyllFlow = () => (
  <div className="absolute inset-0 bg-emerald-950 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#047857_0%,transparent_50%)] opacity-60 blur-xl" style={{animation:'anim-orb-1 10s ease-in-out infinite'}}/>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#065f46_0%,transparent_50%)] opacity-60 blur-xl" style={{animation:'anim-orb-2 12s ease-in-out infinite'}}/>
  </div>
);

export const RootsGrowing = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-700 to-amber-900 dark:from-amber-900 dark:to-slate-950 overflow-hidden">
    <svg className="absolute w-full h-full opacity-60" viewBox="0 0 200 50"><path d="M100,5 L100,20 L85,35 M100,20 L115,40 M100,15 L90,25 L80,38 M100,15 L110,28" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" style={{strokeDasharray:100,strokeDashoffset:100,animation:'anim-ekg-pulse 4s linear infinite'}}/></svg>
  </div>
);

export const WheatField = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-amber-200 dark:from-slate-800 dark:to-amber-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-amber-600/50"/>
    {[...Array(12)].map((_,i)=>(<div key={i} className="absolute bg-amber-500 dark:bg-amber-600 rounded-t-full" style={{left:`${8+i*7}%`,bottom:'30%',width:'2px',height:`${12+Math.random()*6}px`,animation:`anim-wave ${2+Math.random()}s ease-in-out infinite`,animationDelay:`${Math.random()}s`,transformOrigin:'bottom'}}/>))}
  </div>
);

export const SunflowerTrack = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-100 dark:from-slate-800 dark:to-emerald-950 overflow-hidden">
    <div className="absolute top-2 w-6 h-6 bg-yellow-300 rounded-full blur-[2px]" style={{animation:'anim-edge-glow 8s linear infinite'}}/>
    <div className="absolute bottom-0 w-full h-[30%] bg-emerald-600/50"/>
    {[30,50,70].map((x,i)=>(<React.Fragment key={i}>
      <div className="absolute bg-emerald-600" style={{left:`${x}%`,bottom:'20%',width:'2px',height:'20px'}}/>
      <div className="absolute w-5 h-5 bg-yellow-400 rounded-full border-2 border-amber-600" style={{left:`${x-1}%`,bottom:'55%',animation:`anim-alien-sway ${3+i*0.5}s ease-in-out infinite`}}/>
    </React.Fragment>))}
  </div>
);

export const FruitRipening = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-slate-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[35%] bg-amber-700/40"/>
    <svg className="absolute top-2 left-[20%] w-full h-full opacity-70" viewBox="0 0 100 40"><line x1="30" y1="5" x2="30" y2="25" stroke="#65a30d" strokeWidth="2"/>
      <circle cx="25" cy="28" r="4" style={{animation:'anim-prism-shift 6s linear infinite'}}><animate attributeName="fill" values="#22c55e;#eab308;#ef4444;#22c55e" dur="6s" repeatCount="indefinite"/></circle>
      <circle cx="35" cy="26" r="3" style={{animation:'anim-prism-shift 6s linear infinite',animationDelay:'2s'}}><animate attributeName="fill" values="#22c55e;#eab308;#ef4444;#22c55e" dur="6s" repeatCount="indefinite" begin="2s"/></circle>
    </svg>
  </div>
);

export const Pollination = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-pink-50 dark:from-slate-800 dark:to-pink-950 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[30%] bg-emerald-500/30"/>
    {[25,75].map((x,i)=>(<div key={i} className="absolute w-4 h-4 bg-pink-400 rounded-full bottom-[25%]" style={{left:`${x}%`}}/>))}
    {[...Array(6)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-yellow-400 rounded-full" style={{animation:`anim-fiber-pulse ${2+Math.random()}s linear infinite`,animationDelay:`${Math.random()*2}s`,top:`${30+Math.random()*30}%`,left:'-5px'}}/>))}
  </div>
);

export const LeafUnfurl = () => (
  <div className="absolute inset-0 bg-emerald-900 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-16 opacity-80" viewBox="0 0 80 60"><path d="M40,50 Q20,30 25,10 Q30,20 40,15 Q50,20 55,10 Q60,30 40,50 Z" fill="#22c55e" style={{animation:'anim-grow 3s ease-out infinite',transformOrigin:'bottom center'}}/>
      <line x1="40" y1="50" x2="40" y2="15" stroke="#15803d" strokeWidth="1.5"/>
    </svg>
  </div>
);

export const CellDivision = () => (
  <div className="absolute inset-0 bg-emerald-950 overflow-hidden flex items-center justify-center">
    <div className="relative">
      <div className="w-10 h-10 border-2 border-emerald-400/60 rounded-full flex items-center justify-center" style={{animation:'anim-pulse-slow 3s ease-in-out infinite'}}>
        <div className="w-3 h-3 bg-emerald-500/70 rounded-full"/>
      </div>
      <div className="absolute top-0 left-[50%] w-10 h-10 border-2 border-emerald-400/30 rounded-full opacity-0" style={{animation:'anim-orb-1 4s ease-in-out infinite'}}>
        <div className="w-2 h-2 bg-emerald-500/50 rounded-full mx-auto mt-3"/>
      </div>
    </div>
  </div>
);


// --- Phase 2: Crop Biology ---

// GeneEdit - DNA strand with scissor cut
export const GeneEdit = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-purple-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      {/* Double helix */}
      <path d="M20,10 Q60,28 100,10 T180,10" fill="none" stroke="#a855f7" strokeWidth="1.5" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <path d="M20,46 Q60,28 100,46 T180,46" fill="none" stroke="#a855f7" strokeWidth="1.5" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      {[40,80,120,160].map((x,i)=>(
        <line key={i} x1={x} y1="16" x2={x} y2="40" stroke="#c084fc" strokeWidth="1" opacity="0.7"/>
      ))}
      <circle cx="100" cy="28" r="5" fill="#e879f9" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}/>
      <text x="100" y="54" textAnchor="middle" fill="#c084fc" fontSize="5" fontFamily="monospace">CRISPR EDIT</text>
    </svg>
  </div>
);

// DNAHelix - animated rotating helix
export const DNAHelix = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <div className="relative w-full h-full">
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" style={{
          top:`${8+i*8}%`,
          animation:`anim-orbit-slow ${2+i*0.3}s ease-in-out infinite alternate`,
          animationDelay:`${i*0.25}s`
        }}/>
      ))}
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" style={{
          top:`${8+i*8}%`,
          animation:`anim-orbit-slow ${2+i*0.3}s ease-in-out infinite alternate-reverse`,
          animationDelay:`${i*0.25}s`
        }}/>
      ))}
      <div className="absolute bottom-3 left-0 right-0 text-center text-[7px] font-mono text-violet-400">DNA HELIX</div>
    </div>
  </div>
);

// MitoFlow - mitochondria with energy flow
export const MitoFlow = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-orange-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-12" viewBox="0 0 80 48">
      <ellipse cx="40" cy="24" rx="36" ry="18" fill="none" stroke="#f97316" strokeWidth="2"/>
      <ellipse cx="40" cy="24" rx="28" ry="12" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="4 2" style={{animation:'anim-spin 8s linear infinite',transformOrigin:'40px 24px'}}/>
      <path d="M20,24 Q30,14 40,24 T60,24" fill="none" stroke="#fbbf24" strokeWidth="2" style={{animation:'anim-data-flow 2s linear infinite'}}/>
      <text x="40" y="44" textAnchor="middle" fill="#fb923c" fontSize="4" fontFamily="monospace">ATP</text>
    </svg>
  </div>
);

// PlantCell - cell wall with chloroplasts
export const PlantCell = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-14" viewBox="0 0 80 56">
      <rect x="5" y="5" width="70" height="46" rx="8" fill="none" stroke="#22c55e" strokeWidth="2"/>
      <rect x="10" y="10" width="60" height="36" rx="6" fill="none" stroke="#16a34a" strokeWidth="1"/>
      <circle cx="40" cy="28" r="8" fill="#14532d" stroke="#22c55e" strokeWidth="1"/>
      {[[22,18],[58,18],[20,38],[58,38]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="5" ry="3" fill="#166534" style={{animation:`anim-pulse-slow ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
      ))}
    </svg>
  </div>
);

// StomataOpen - leaf pores opening/closing
export const StomataOpen = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      {[40,100,160].map((x,i) => (
        <g key={i}>
          <ellipse cx={x} cy="28" rx="0" ry="10" fill="#4ade80" style={{animation:'anim-stomata-open 3s ease-in-out infinite',animationDelay:`${i*0.8}s`}}>
            <animate attributeName="rx" values="0;8;0" dur="3s" repeatCount="indefinite" begin={`${i*0.8}s`}/>
          </ellipse>
          <circle cx={x} cy="28" r="12" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.6"/>
          <circle cx={x} cy="28" r="2" fill="#86efac" style={{animation:`anim-pulse-slow ${2+i*0.3}s ease-in-out infinite`}}/>
        </g>
      ))}
      <text x="100" y="52" textAnchor="middle" fill="#4ade80" fontSize="5" fontFamily="monospace">STOMATA</text>
    </svg>
  </div>
);

// RootHair - root absorbing water droplets
export const RootHair = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[55%] bg-amber-950/80"/>
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <line x1="100" y1="0" x2="100" y2="30" stroke="#a78bfa" strokeWidth="2"/>
      {[[-20,-10],[20,-15],[-15,5],[15,8]].map(([dx,dy],i)=>(
        <line key={i} x1="100" y1="28" x2={100+dx} y2={28+dy} stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" style={{animation:`anim-grow ${2+i*0.3}s ease-out forwards`,transformOrigin:'100px 28px'}}/>
      ))}
      {[80,90,105,118,75].map((x,i)=>(
        <circle key={i} cx={x} cy={32+i*3} r="2" fill="#38bdf8" style={{animation:`anim-drone-hover ${1+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
      ))}
    </svg>
  </div>
);

// StemXylem - water transport in stem cross-section
export const StemXylem = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-14 h-14" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="26" fill="#14532d" stroke="#22c55e" strokeWidth="2"/>
      <circle cx="28" cy="28" r="18" fill="#166534"/>
      {[[28,10],[43,19],[43,37],[28,46],[13,37],[13,19]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="#38bdf8" style={{animation:`anim-pulse-slow ${1+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>
      ))}
      <circle cx="28" cy="28" r="5" fill="#0ea5e9"/>
    </svg>
  </div>
);

// FlowerBloom - blooming flower animation
export const FlowerBloom = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-pink-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-20" viewBox="0 0 80 80">
      {[0,45,90,135,180,225,270,315].map((angle,i)=>(
        <ellipse key={i} cx="40" cy="40"
          rx="0" ry="12"
          fill="#f472b6"
          transform={`rotate(${angle} 40 40) translate(0 -14)`}
          style={{animation:'anim-grow 2s ease-out forwards',animationDelay:`${i*0.1}s`}}
        >
          <animate attributeName="rx" values="0;6;6" dur="2s" fill="freeze" begin={`${i*0.1}s`}/>
          <animate attributeName="ry" values="0;12;12" dur="2s" fill="freeze" begin={`${i*0.1}s`}/>
        </ellipse>
      ))}
      <circle cx="40" cy="40" r="8" fill="#fbbf24" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <line x1="40" y1="52" x2="40" y2="78" stroke="#22c55e" strokeWidth="2"/>
    </svg>
  </div>
);

// FruitSet - fruit growing on branch
export const FruitSet = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-red-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      <path d="M10,20 Q60,10 100,15 T190,20" fill="none" stroke="#92400e" strokeWidth="2"/>
      {[[40,20],[80,16],[120,18],[160,22]].map(([x,y],i)=>(
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y+8} stroke="#65a30d" strokeWidth="1"/>
          <circle cx={x} cy={y+12} r="0" fill="#ef4444" style={{animation:'anim-grow 2s ease-out forwards',animationDelay:`${i*0.4}s`}}>
            <animate attributeName="r" values="0;6;6" dur="2s" fill="freeze" begin={`${i*0.4}s`}/>
          </circle>
        </g>
      ))}
    </svg>
  </div>
);

// SeedPod - seed pod bursting open
export const SeedPod = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-16 h-16" viewBox="0 0 64 64">
      <ellipse cx="32" cy="40" rx="16" ry="12" fill="#78350f"/>
      <ellipse cx="32" cy="40" rx="14" ry="10" fill="#92400e"/>
      {[[-8,-16],[-4,-20],[4,-18],[8,-16]].map(([dx,dy],i)=>(
        <ellipse key={i} cx={32+dx} cy={40+dy} rx="4" ry="6" fill="#a16207" transform={`rotate(${dx*3} ${32+dx} ${40+dy})`} style={{animation:'anim-drone-hover 2s ease-in-out infinite',animationDelay:`${i*0.3}s`}}/>
      ))}
      {[[-10,-8],[-5,-4],[5,-6],[10,-4]].map(([dx,dy],i)=>(
        <circle key={i} cx={32+dx} cy={40+dy} r="3" fill="#fbbf24" style={{animation:`anim-pulse-slow ${1+i*0.2}s ease-in-out infinite`}}/>
      ))}
    </svg>
  </div>
);
