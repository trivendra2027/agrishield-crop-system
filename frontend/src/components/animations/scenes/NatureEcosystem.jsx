import React from 'react';

export const ButterflyGarden = () => (<div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-pink-100 dark:from-slate-800 dark:to-pink-950 overflow-hidden"><div className="absolute bottom-0 w-full h-[25%] bg-emerald-500/30"/>{[0,1].map(i=>(<svg key={i} className="absolute w-5 h-4" viewBox="0 0 20 16" style={{top:`${20+i*25}%`,animation:`anim-drone-hover ${5+i*2}s ease-in-out infinite`}}><path d="M10,8 Q5,0 0,5 Q5,10 10,8 Z" fill={i?'#f472b6':'#c084fc'}/><path d="M10,8 Q15,0 20,5 Q15,10 10,8 Z" fill={i?'#fb7185':'#a855f7'}/></svg>))}</div>);

export const HoneybeeHive = () => (<div className="absolute inset-0 bg-amber-100 dark:bg-amber-950 overflow-hidden flex items-center justify-center"><svg className="w-14 h-12 opacity-60" viewBox="0 0 50 40">{[[10,10],[25,10],[40,10],[17,22],[32,22]].map(([x,y],i)=>(<polygon key={i} points={`${x},${y-5} ${x+5},${y-2.5} ${x+5},${y+2.5} ${x},${y+5} ${x-5},${y+2.5} ${x-5},${y-2.5}`} fill="none" stroke="#d97706" strokeWidth="1"/>))}</svg>{[...Array(3)].map((_,i)=>(<div key={i} className="absolute w-1.5 h-1 bg-amber-500 rounded-full" style={{animation:`anim-drone-hover ${3+i}s ease-in-out infinite`,top:`${20+i*20}%`}}/>))}</div>);

export const BirdMigration = () => (<div className="absolute inset-0 bg-gradient-to-b from-orange-300 to-amber-200 dark:from-indigo-900 dark:to-slate-900 overflow-hidden">{[0,1,2,3,4].map(i=>(<svg key={i} className="absolute w-4 h-3" viewBox="0 0 16 10" style={{top:`${15+i*5-Math.abs(i-2)*3}%`,animation:`anim-bird-fly ${12+i}s linear infinite`,animationDelay:`${i*0.5}s`}}><path d="M0,5 Q4,0 8,5 Q12,0 16,5" fill="none" stroke="#1e293b" strokeWidth="1.5"/></svg>))}</div>);

export const FireflyNight = () => (<div className="absolute inset-0 bg-[#0a0f0a] overflow-hidden">{[...Array(12)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-yellow-300 rounded-full" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`anim-pulse-slow ${1+Math.random()*2}s ease-in-out infinite`,animationDelay:`${Math.random()*3}s`,boxShadow:'0 0 4px #fde047'}}/>))}<div className="absolute bottom-0 w-full h-[20%] bg-emerald-900/30"/></div>);

export const FrogPond = () => (<div className="absolute inset-0 bg-emerald-900 overflow-hidden"><div className="absolute bottom-0 w-full h-[45%] bg-blue-800/40"/>{[20,50,80].map((x,i)=>(<div key={i} className="absolute w-4 h-2 bg-emerald-600 rounded-full" style={{left:`${x}%`,bottom:'40%'}}/>))}{[30,60].map((x,i)=>(<div key={i} className="absolute rounded-full border border-blue-400/20" style={{left:`${x}%`,bottom:'30%',width:'20px',height:'20px',animation:`anim-isobar ${2+i}s ease-out infinite`}}/>))}</div>);

export const LadybugPatrol = () => (<div className="absolute inset-0 bg-gradient-to-b from-emerald-200 to-emerald-400 dark:from-emerald-900 dark:to-emerald-950 overflow-hidden"><svg className="absolute w-[80%] h-[60%] top-[20%] left-[10%] opacity-50" viewBox="0 0 100 40"><path d="M0,30 Q50,5 100,30" fill="#22c55e" stroke="#15803d" strokeWidth="1"/></svg><div className="absolute w-3 h-3 bg-red-500 rounded-full" style={{animation:'anim-fiber-pulse 6s linear infinite',top:'35%'}}><div className="absolute w-full h-[1px] bg-black/30 top-1/2"/></div></div>);

export const SpiderWeb = () => (<div className="absolute inset-0 bg-slate-800 overflow-hidden flex items-center justify-center"><svg className="w-20 h-16 opacity-30" viewBox="0 0 80 60">{[0,45,90,135,180,225,270,315].map(a=>(<line key={a} x1="40" y1="30" x2={40+25*Math.cos(a*Math.PI/180)} y2={30+20*Math.sin(a*Math.PI/180)} stroke="white" strokeWidth="0.5"/>))}{[8,16,24].map(r=>(<circle key={r} cx="40" cy="30" r={r} fill="none" stroke="white" strokeWidth="0.3"/>))}</svg>{[...Array(4)].map((_,i)=>(<div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full" style={{left:`${30+Math.random()*40}%`,top:`${20+Math.random()*60}%`,animation:`anim-pulse-slow ${2+Math.random()}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);

export const BambooForest = () => (<div className="absolute inset-0 bg-emerald-800 overflow-hidden">{[15,30,45,60,75,90].map((x,i)=>(<div key={i} className="absolute bg-emerald-600 rounded-full" style={{left:`${x}%`,bottom:0,width:'3px',height:`${30+i*5}px`,animation:`anim-wave ${3+Math.random()}s ease-in-out infinite`,transformOrigin:'bottom',animationDelay:`${Math.random()}s`}}/>))}<div className="absolute bottom-0 w-full h-[15%] bg-emerald-900/50"/></div>);

export const CherryBlossom = () => (<div className="absolute inset-0 bg-gradient-to-b from-pink-100 to-rose-50 dark:from-pink-950 dark:to-slate-900 overflow-hidden">{[...Array(10)].map((_,i)=>(<div key={i} className="absolute w-2 h-2 bg-pink-300 dark:bg-pink-600 rounded-full opacity-60" style={{left:`${Math.random()*100}%`,animation:`anim-leaf-fall ${4+Math.random()*3}s linear infinite`,animationDelay:`-${Math.random()*5}s`}}/>))}<div className="absolute top-0 right-0 w-16 h-10 bg-amber-800/30 rounded-bl-3xl"/></div>);

export const CoralReef = () => (<div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-900 overflow-hidden">{[15,35,55,75].map((x,i)=>(<div key={i} className="absolute bg-orange-400/60 rounded-t-full" style={{left:`${x}%`,bottom:0,width:`${6+i*2}px`,height:`${8+i*3}px`,animation:`anim-kelp ${3+Math.random()}s ease-in-out infinite`,transformOrigin:'bottom'}}/>))}{[...Array(5)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-white/40 rounded-full" style={{left:`${Math.random()*100}%`,bottom:`${Math.random()*60+20}%`,animation:`anim-bubble ${3+Math.random()*2}s linear infinite`,animationDelay:`${Math.random()*3}s`}}/>))}</div>);


// --- Phase 2: Nature & Ecosystem ---

// BatFlight - bats flying at night
export const BatFlight = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-950 overflow-hidden">
    {[15,35,55,70,85].map((x,i)=>(
      <svg key={i} className="absolute" style={{
        left:`${x}%`,top:`${10+i*12}%`,width:'18px',height:'12px',
        animation:`anim-drone-hover ${2+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.5}s`
      }} viewBox="0 0 18 12">
        <path d="M9,6 Q3,0 0,3 Q3,6 9,8 Q15,6 18,3 Q15,0 9,6" fill="#4c1d95"/>
        <circle cx="9" cy="5" r="2" fill="#6d28d9"/>
      </svg>
    ))}
    <div className="absolute top-1 left-0 right-0 text-center text-[7px] font-mono text-indigo-300">🦇 NIGHT PATROL</div>
  </div>
);

// MothHover - moth attracted to UV light
export const MothHover = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-10 bg-violet-400/20 rounded-full" style={{boxShadow:'0 0 20px #8b5cf6',animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-8 bg-violet-500 rounded-full"/>
    {[0,1,2].map(i=>(
      <svg key={i} className="absolute" style={{
        right:`${15+i*15}%`,top:`${30+i*10}%`,width:'20px',height:'16px',
        animation:`anim-drone-hover ${1.5+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`
      }} viewBox="0 0 20 16">
        <ellipse cx="10" cy="10" rx="3" ry="5" fill="#78716c"/>
        <ellipse cx="5" cy="7" rx="6" ry="4" fill="#a8a29e" opacity="0.8"/>
        <ellipse cx="15" cy="7" rx="6" ry="4" fill="#a8a29e" opacity="0.8"/>
        <circle cx="10" cy="6" r="1.5" fill="#fbbf24"/>
      </svg>
    ))}
  </div>
);

// EarthwormCrawl - earthworm tunneling
export const EarthwormCrawl = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-800 to-amber-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <path d="M-20,30 Q0,20 20,30 Q40,40 60,28 Q80,16 100,26 Q120,36 140,24 Q160,12 180,22 Q200,32 220,22"
        fill="none" stroke="#d97706" strokeWidth="8" strokeLinecap="round"
        style={{animation:'anim-worm-move 4s ease-in-out infinite'}}/>
      <circle cx="-20" cy="30" r="6" fill="#fbbf24" style={{animation:'anim-worm-move 4s ease-in-out infinite'}}/>
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-amber-300">EARTHWORM</div>
  </div>
);

// SnailPace - snail crawling on leaf
export const SnailPace = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-emerald-900/80"/>
    <svg className="absolute bottom-[38%]" style={{animation:'anim-tractor-drive 18s linear infinite'}} width="36" height="28" viewBox="0 0 36 28">
      <ellipse cx="12" cy="22" rx="12" ry="6" fill="#78350f"/>
      <path d="M4,20 Q0,14 4,10 Q10,6 16,10" fill="none" stroke="#a16207" strokeWidth="2"/>
      <circle cx="12" cy="14" r="6" fill="#92400e"/>
      <path d="M12,10 Q10,4 6,2" fill="none" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12,10 Q14,4 18,3" fill="none" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

// AntColony - ants marching in line
export const AntColony = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[40%] bg-amber-950/80"/>
    <svg className="absolute bottom-[38%] w-full h-6" viewBox="0 0 200 24">
      <path d="M0,12 Q50,6 100,12 T200,12" fill="none" stroke="#78350f" strokeWidth="0.5"/>
      {[0,1,2,3,4].map(i=>(
        <g key={i} style={{animation:`anim-tractor-drive ${8+i}s linear infinite`,animationDelay:`${-i*1.5}s`}}>
          <ellipse cx={30+i*10} cy="12" rx="2.5" ry="1.5" fill="#1e293b"/>
          <ellipse cx={30+i*10} cy="10" rx="1.5" ry="1" fill="#1e293b"/>
          <circle cx={30+i*10} cy="8" r="1.5" fill="#292524"/>
          {[[-2,-1],[2,-1],[-3,0],[3,0]].map(([lx,ly],j)=>(
            <line key={j} x1={30+i*10} y1="11" x2={30+i*10+lx} y2={11+ly} stroke="#292524" strokeWidth="0.5"/>
          ))}
        </g>
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-amber-400">ANT COLONY</div>
  </div>
);

// AphidCluster - cluster of aphids on stem
export const AphidCluster = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden flex items-center justify-center">
    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-3 bg-green-800 rounded-full"/>
    {[[-12,30],[-8,38],[8,25],[12,36],[-6,50],[10,48],[-14,42],[14,30],[-10,56],[6,58]].map(([x,y],i)=>(
      <div key={i} className="absolute rounded-full bg-green-300" style={{
        left:`calc(50% + ${x}px)`,top:`${y}%`,width:'6px',height:'5px',
        animation:`anim-pulse-slow ${1+i*0.15}s ease-in-out infinite`,animationDelay:`${i*0.1}s`
      }}/>
    ))}
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-green-400">APHID CLUSTER</div>
  </div>
);

// PredatorWasp - wasp hunting
export const PredatorWasp = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <path d="M20,40 Q60,20 100,30 T180,20" fill="none" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4"/>
      <g style={{animation:'anim-drone-hover 3s ease-in-out infinite'}}>
        <ellipse cx="100" cy="28" rx="8" ry="4" fill="#fbbf24"/>
        {[0,1,2].map(i=>(
          <line key={i} x1="96" y1="28" x2="92" y2={24+i*4} stroke="#1e293b" strokeWidth="0.8"/>
        ))}
        <ellipse cx="96" cy="26" rx="6" ry="3" fill="rgba(251,191,36,0.4)" transform="rotate(-20 96 26)"/>
        <ellipse cx="96" cy="30" rx="6" ry="3" fill="rgba(251,191,36,0.4)" transform="rotate(20 96 30)"/>
        <circle cx="108" cy="27" r="2" fill="#1e293b"/>
      </g>
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-yellow-400">PREDATOR WASP</div>
  </div>
);

// PrayingMantis - mantis in ambush pose
export const PrayingMantis = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-slate-900 overflow-hidden flex items-end justify-center">
    <div className="absolute bottom-0 w-full h-[35%] bg-emerald-900/70"/>
    <svg className="absolute bottom-[30%] w-16 h-28" viewBox="0 0 48 80">
      <line x1="24" y1="40" x2="24" y2="70" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="24" cy="35" rx="6" ry="8" fill="#16a34a"/>
      <ellipse cx="24" cy="22" rx="4" ry="6" fill="#15803d"/>
      <circle cx="24" cy="16" r="5" fill="#166534"/>
      <circle cx="22" cy="15" r="2" fill="#4ade80"/><circle cx="26" cy="15" r="2" fill="#4ade80"/>
      <path d="M18,30 Q8,20 6,14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{animation:'anim-drone-hover 3s ease-in-out infinite'}}/>
      <path d="M30,30 Q40,20 42,14" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{animation:'anim-drone-hover 3s ease-in-out infinite reverse'}}/>
    </svg>
  </div>
);

// OwlNight - owl with glowing eyes at night
export const OwlNight = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-20" viewBox="0 0 80 80">
      <ellipse cx="40" cy="48" rx="20" ry="24" fill="#292524"/>
      <ellipse cx="40" cy="36" rx="16" ry="18" fill="#44403c"/>
      <path d="M30,24 L26,14 L34,22" fill="#57534e"/>
      <path d="M50,24 L54,14 L46,22" fill="#57534e"/>
      <circle cx="34" cy="38" r="8" fill="#1e293b" stroke="#fbbf24" strokeWidth="1"/>
      <circle cx="46" cy="38" r="8" fill="#1e293b" stroke="#fbbf24" strokeWidth="1"/>
      <circle cx="34" cy="38" r="5" fill="#fbbf24" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <circle cx="46" cy="38" r="5" fill="#fbbf24" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <circle cx="34" cy="38" r="2" fill="#1e293b"/>
      <circle cx="46" cy="38" r="2" fill="#1e293b"/>
      <path d="M36,46 Q40,50 44,46" fill="none" stroke="#a16207" strokeWidth="1.5"/>
    </svg>
  </div>
);

// FoxPatrol - fox silhouette at dusk
export const FoxPatrol = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-orange-900 to-slate-900 overflow-hidden">
    <div className="absolute bottom-0 w-full h-[35%] bg-slate-800"/>
    <div className="absolute top-2 right-6 w-8 h-8 bg-orange-500 rounded-full opacity-40 blur-md"/>
    <svg className="absolute bottom-[32%]" style={{animation:'anim-tractor-drive 12s linear infinite'}} width="48" height="28" viewBox="0 0 48 28">
      <ellipse cx="22" cy="18" rx="14" ry="8" fill="#c2410c"/>
      <circle cx="36" cy="14" r="7" fill="#c2410c"/>
      <path d="M36,8 L40,0 L38,8" fill="#1e293b"/>
      <path d="M36,8 L44,2 L40,8" fill="#1e293b"/>
      <circle cx="39" cy="12" r="1.5" fill="#fbbf24"/>
      <path d="M4,18 Q0,14 2,10 Q6,6 8,10" fill="#ef4444"/>
      {[10,16,22,28].map((x,i)=>(
        <line key={i} x1={x} y1="26" x2={x+1} y2="20" stroke="#c2410c" strokeWidth="2" strokeLinecap="round"/>
      ))}
    </svg>
  </div>
);
