import React from 'react';

export const Esp32Pulse = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center"><div className="w-8 h-6 bg-emerald-800 rounded border border-emerald-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" style={{animation:'anim-pulse-slow 1.5s ease-in-out infinite'}}/></div>{[1,2,3].map(i=>(<div key={i} className="absolute w-16 h-16 rounded-full border border-emerald-500/20" style={{animation:`anim-isobar ${1+i*0.5}s ease-out infinite`,opacity:0.3}}/>))}</div>);

export const SensorArray = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-around px-4">{[0,1,2,3,4].map(i=>(<div key={i} className="flex flex-col items-center gap-1"><div className="w-3 h-4 bg-slate-700 rounded-sm border border-slate-600"/><div className="w-1.5 h-1.5 rounded-full" style={{animation:`anim-pulse-slow 1s ease-in-out infinite`,animationDelay:`${i*0.3}s`,backgroundColor:i%2===0?'#22c55e':'#0ea5e9'}}/></div>))}</div>);

export const BluetoothPair = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center"><svg className="w-8 h-10 text-blue-500 opacity-70" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2L7,7l5,5-5,5 5,5V14l3.5,3.5L17,16l-5-4 5-4L15.5,6.5 12,10V2z"/></svg>{[1,2].map(i=>(<div key={i} className="absolute w-12 h-12 rounded-full border border-blue-400/20" style={{animation:`anim-isobar ${1+i*0.6}s ease-out infinite`}}/>))}</div>);

export const WifiBroadcast = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">{[12,20,28].map((r,i)=>(<div key={i} className="absolute rounded-full border border-emerald-400/30" style={{width:`${r}px`,height:`${r}px`,animation:`anim-isobar ${0.8+i*0.4}s ease-out infinite`}}/>))}<div className="w-2 h-2 bg-emerald-400 rounded-full" style={{animation:'anim-pulse-slow 1s ease-in-out infinite'}}/></div>);

export const OtaUpdate = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center px-6"><div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700"><div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{animation:'anim-grow 3s ease-out infinite',transformOrigin:'left'}}/></div><div className="absolute top-2 left-6 text-[7px] text-emerald-400/60 font-mono">OTA UPDATE</div><div className="absolute top-2 right-6 text-[7px] text-emerald-400/60 font-mono">v2.1</div></div>);

export const TelemetryFeed = () => {const vals=['T:28°C','H:65%','S:42%','pH:6.8','L:850'];return(<div className="absolute inset-0 bg-slate-950 overflow-hidden px-3 py-1"><div className="flex flex-col gap-[2px] overflow-hidden h-full">{vals.map((v,i)=>(<div key={i} className="text-[8px] font-mono text-emerald-400/70 whitespace-nowrap" style={{animation:'anim-data-stream 4s linear infinite',animationDelay:`${i*0.8}s`}}>{v}</div>))}</div></div>);};

export const BatteryCharge = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center"><div className="w-14 h-8 border-2 border-slate-600 rounded relative overflow-hidden"><div className="absolute right-[-4px] top-[25%] w-[3px] h-[50%] bg-slate-600 rounded-r"/><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{animation:'anim-grow 3s ease-out infinite',transformOrigin:'left'}}/></div><div className="absolute bottom-2 text-[7px] text-emerald-400/60 font-mono">CHARGING</div></div>);

export const CircuitBoard = () => (<div className="absolute inset-0 bg-emerald-950 overflow-hidden"><svg className="absolute w-full h-full opacity-40" viewBox="0 0 200 50"><path d="M0,25 L30,25 L35,15 L60,15 L65,25 L100,25 L105,35 L130,35 L135,25 L200,25" fill="none" stroke="#22c55e" strokeWidth="1"/>{[30,65,100,135].map((x,i)=>(<circle key={i} cx={x} cy={[25,25,25,25][i]} r="2" fill="#22c55e" style={{animation:`anim-pulse-slow 1s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>))}</svg></div>);

export const GatewayNode = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center"><div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}><div className="w-2 h-2 bg-white rounded-full"/></div>{[0,60,120,180,240,300].map(a=>(<div key={a} className="absolute w-[1px] h-8 bg-gradient-to-b from-indigo-400/50 to-transparent origin-bottom" style={{transform:`rotate(${a}deg)`,animation:`anim-pulse-slow 2s ease-in-out infinite`,animationDelay:`${a/360}s`}}/>))}</div>);

export const EdgeCompute = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-around px-6">{[0,1,2].map(i=>(<div key={i} className="w-5 h-5 bg-slate-800 rounded border border-cyan-500/30 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" style={{animation:`anim-pulse-slow 1.5s ease-in-out infinite`,animationDelay:`${i*0.5}s`}}/></div>))}<svg className="absolute w-full h-[2px] top-1/2 opacity-30" viewBox="0 0 200 2"><line x1="30" y1="1" x2="90" y2="1" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" style={{animation:'anim-grid-fly 1s linear infinite'}}/><line x1="110" y1="1" x2="170" y2="1" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" style={{animation:'anim-grid-fly 1s linear infinite'}}/></svg></div>);


// --- Phase 2: IoT & Hardware ---

// LoraNode - LoRa signal wave rings
export const LoraNode = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden flex items-center justify-center">
    <div className="relative">
      {[40,30,20,12].map((r,i)=>(
        <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/50"
          style={{width:r*2,height:r*2,animation:`anim-pulse-slow ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>
      ))}
      <div className="w-3 h-3 bg-blue-400 rounded-full"/>
    </div>
    <div className="absolute top-2 left-2 text-[7px] font-mono text-blue-300">LoRa TX</div>
    <div className="absolute bottom-2 right-2 text-[7px] font-mono text-blue-300">868MHz</div>
  </div>
);

// SigfoxHub - Sigfox network topology
export const SigfoxHub = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <circle cx="100" cy="28" r="8" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      <text x="100" y="32" textAnchor="middle" fill="white" fontSize="5" fontFamily="monospace">HUB</text>
      {[[30,15],[170,15],[30,41],[170,41],[50,28],[150,28]].map(([x,y],i)=>(
        <g key={i}>
          <line x1="100" y1="28" x2={x} y2={y} stroke="#4f46e5" strokeWidth="0.8" strokeDasharray="3 2" style={{animation:'anim-data-flow 2s linear infinite',animationDelay:`${i*0.3}s`}}/>
          <circle cx={x} cy={y} r="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1"/>
        </g>
      ))}
    </svg>
    <div className="absolute bottom-1 left-0 right-0 text-center text-[6px] font-mono text-indigo-300">SIGFOX NETWORK</div>
  </div>
);

// NBIoT - NB-IoT cell tower signal
export const NBIoT = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-cyan-950 overflow-hidden flex items-end justify-center">
    <svg className="w-20 h-full" viewBox="0 0 80 56">
      <line x1="40" y1="10" x2="40" y2="50" stroke="#64748b" strokeWidth="2"/>
      <line x1="30" y1="10" x2="50" y2="10" stroke="#94a3b8" strokeWidth="1.5"/>
      {[0,1,2].map(i=>(
        <path key={i} d={`M${20+i*5},15 Q40,${24+i*6} ${60-i*5},15`} fill="none" stroke="#22d3ee" strokeWidth="1"
          style={{animation:`anim-pulse-slow ${1.5+i*0.5}s ease-in-out infinite`,opacity:0.7-i*0.15}}/>
      ))}
      {[0,1,2].map(i=>(
        <path key={i} d={`M${18-i*4},20 Q40,${30+i*8} ${62+i*4},20`} fill="none" stroke="#22d3ee" strokeWidth="0.8"
          style={{animation:`anim-pulse-slow ${2+i*0.4}s ease-in-out infinite`,opacity:0.5-i*0.1}}/>
      ))}
    </svg>
    <div className="absolute bottom-2 text-[7px] font-mono text-cyan-300">NB-IoT</div>
  </div>
);

// Farm5G - 5G signal diagram
export const Farm5G = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-purple-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      {[1,2,3].map(i=>(
        <rect key={i} x={10+i*30} y={10+i*5} width={180-i*60} height={36-i*8} rx="4"
          fill="none" stroke="#a855f7" strokeWidth="0.8" opacity={0.8-i*0.2}
          style={{animation:`anim-pulse-slow ${2+i*0.3}s ease-in-out infinite`}}/>
      ))}
      <text x="100" y="31" textAnchor="middle" fill="#e879f9" fontSize="12" fontFamily="monospace" fontWeight="bold">5G</text>
      <text x="100" y="52" textAnchor="middle" fill="#c084fc" fontSize="4" fontFamily="monospace">FARM NETWORK</text>
    </svg>
  </div>
);

// RFIDTag - RFID scan beam
export const RFIDTag = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center gap-4">
    <svg className="w-10 h-8" viewBox="0 0 40 32">
      <rect x="2" y="4" width="36" height="24" rx="3" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5"/>
      <rect x="6" y="8" width="8" height="16" rx="1" fill="#0e7490"/>
      <line x1="16" y1="10" x2="34" y2="10" stroke="#64748b" strokeWidth="1"/>
      <line x1="16" y1="14" x2="28" y2="14" stroke="#64748b" strokeWidth="0.8"/>
      <line x1="16" y1="18" x2="30" y2="18" stroke="#64748b" strokeWidth="0.8"/>
      <line x1="16" y1="22" x2="26" y2="22" stroke="#64748b" strokeWidth="0.8"/>
    </svg>
    <div className="flex flex-col gap-1 items-center">
      {[0,1,2].map(i=>(
        <div key={i} className="w-px bg-cyan-400/60 rounded-full" style={{height:`${6+i*4}px`,animation:`anim-pulse-slow ${1+i*0.3}s ease-in-out infinite`}}/>
      ))}
    </div>
    <div className="absolute bottom-2 text-[7px] font-mono text-cyan-400">RFID SCAN</div>
  </div>
);

// CameraFeed - camera with recognition grid
export const CameraFeed = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <div className="relative w-28 h-20 bg-slate-800 rounded border border-slate-600 overflow-hidden">
      <div className="absolute inset-0 bg-green-900/20"/>
      <div className="absolute inset-2 border border-green-400/30 rounded">
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-green-400"/>
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-green-400"/>
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-green-400"/>
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-green-400"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-6 border border-red-500/60 rounded-sm" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
      </div>
      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" style={{animation:'anim-laser-pulse 1s linear infinite'}}/>
    </div>
    <div className="absolute bottom-2 text-[7px] font-mono text-green-400">LIVE FEED</div>
  </div>
);

// Thermistor - temperature sensor readout
export const Thermistor = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-12 h-20" viewBox="0 0 48 80">
      <rect x="16" y="5" width="16" height="50" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
      <rect x="20" y="52" width="8" height="20" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
      <rect x="21" y="52" width="6" height="0" rx="2" fill="#ef4444">
        <animate attributeName="height" from="0" to="40" dur="3s" repeatCount="indefinite"/>
      </rect>
      <circle cx="24" cy="70" r="7" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5"/>
      <circle cx="24" cy="70" r="4" fill="#ef4444" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}/>
    </svg>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono text-orange-400" style={{animation:'anim-pulse-slow 2s ease-in-out infinite'}}>28.5°C</div>
  </div>
);

// StrainGauge - load cell with deformation
export const StrainGauge = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-32 h-12" viewBox="0 0 128 48">
      <rect x="4" y="20" width="120" height="8" rx="2" fill="#334155"/>
      <path d="M4,28 Q64,40 124,28" fill="none" stroke="#f59e0b" strokeWidth="1.5" style={{animation:'anim-drone-hover 3s ease-in-out infinite'}}/>
      {[20,44,68,92,112].map((x,i)=>(
        <line key={i} x1={x} y1="16" x2={x} y2="32" stroke="#94a3b8" strokeWidth="0.8"/>
      ))}
      <rect x="50" y="4" width="28" height="12" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
      <text x="64" y="13" textAnchor="middle" fill="#f59e0b" fontSize="5" fontFamily="monospace">12.4N</text>
    </svg>
    <div className="absolute bottom-2 text-[7px] font-mono text-amber-400">STRAIN GAUGE</div>
  </div>
);

// Actuator - linear actuator extending
export const Actuator = () => (
  <div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center justify-center">
    <svg className="w-32 h-12" viewBox="0 0 128 48">
      <rect x="4" y="18" width="40" height="12" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
      <rect x="44" y="22" width="0" height="4" rx="1" fill="#22d3ee">
        <animate attributeName="width" values="0;60;0" dur="3s" repeatCount="indefinite"/>
      </rect>
      <rect x="100" y="15" width="24" height="18" rx="3" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5">
        <animate attributeName="x" values="100;40;100" dur="3s" repeatCount="indefinite"/>
      </rect>
      <line x1="4" y1="12" x2="4" y2="36" stroke="#64748b" strokeWidth="2"/>
    </svg>
    <div className="absolute bottom-2 text-[7px] font-mono text-cyan-400">ACTUATOR</div>
  </div>
);

// SolarBattery - solar panel charging battery
export const SolarBattery = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-slate-900 overflow-hidden">
    <div className="absolute top-2 right-4 w-6 h-6 bg-yellow-300 rounded-full" style={{boxShadow:'0 0 12px #fbbf24',animation:'anim-pulse-slow 3s ease-in-out infinite'}}/>
    <div className="absolute top-5 left-4 w-16 h-10 bg-blue-700/80 rounded border border-blue-500">
      <div className="absolute inset-0 grid grid-cols-3 gap-px p-1">
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="bg-blue-600 rounded-sm"/>
        ))}
      </div>
    </div>
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <div className="w-14 h-7 bg-slate-700 rounded border border-slate-500 overflow-hidden flex">
        <div className="h-full bg-emerald-500 rounded transition-all" style={{width:'75%',animation:'anim-data-flow 3s ease-in-out infinite'}}/>
        <div className="w-2 h-full bg-slate-600 rounded-r"/>
      </div>
      <div className="text-[7px] font-mono text-emerald-400">75%</div>
    </div>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[6px] font-mono text-yellow-400">SOLAR CHARGING</div>
  </div>
);
