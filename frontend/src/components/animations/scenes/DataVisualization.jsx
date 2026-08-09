import React from 'react';

export const NeuralNetwork = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden"><svg className="absolute w-full h-full opacity-50" viewBox="0 0 200 40"><path d="M20,10 L80,30 L140,5 L190,20 M80,30 L100,10 L140,5 M40,25 L100,10" stroke="#38bdf8" strokeWidth="0.5" fill="none" style={{animation:'anim-pulse-lines 3s ease-in-out infinite'}}/>{[20,80,140,190,100,40].map((cx,i)=>(<circle key={i} cx={cx} cy={[10,30,5,20,10,25][i]} r="1.5" fill="#0ea5e9" style={{animation:`anim-pulse-slow 2s ease-in-out infinite`,animationDelay:`${i*0.5}s`}}/>))}</svg></div>);

export const YieldChart = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden px-3 py-2"><svg className="w-full h-full opacity-70" viewBox="0 0 100 40"><path d="M5,35 L20,28 L35,30 L50,20 L65,22 L80,12 L95,8" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" style={{strokeDasharray:120,strokeDashoffset:120,animation:'anim-ekg-pulse 4s linear infinite'}}/>{[5,20,35,50,65,80,95].map((x,i)=>(<circle key={i} cx={x} cy={[35,28,30,20,22,12,8][i]} r="1.5" fill="#22c55e" style={{animation:`anim-pulse-slow 2s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>))}</svg></div>);

export const DataStream = () => (<div className="absolute inset-0 bg-black overflow-hidden flex gap-2 justify-around px-3">{[...Array(12)].map((_,i)=>(<div key={i} className="w-[1px] h-8 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-0" style={{animation:`anim-data-stream ${0.5+Math.random()}s linear infinite`,animationDelay:`${Math.random()*2}s`}}/>))}</div>);

export const RadarSweep = () => (<div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden"><div className="w-32 h-32 rounded-full border border-emerald-500/20 flex items-center justify-center"><div className="absolute w-16 h-16 rounded-full border border-emerald-500/30"/><div className="absolute w-2 h-2 rounded-full bg-emerald-500" style={{boxShadow:'0 0 8px #10b981'}}/><div className="absolute w-32 h-32 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(16,185,129,0.4)_100%)]" style={{animation:'anim-radar-sweep 3s linear infinite'}}/></div></div>);

export const BiometricPulse = () => (<div className="absolute inset-0 bg-slate-950 flex items-center overflow-hidden"><svg className="w-full h-full opacity-80" viewBox="0 0 200 40" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"><path d="M-50,20 L50,20 L60,5 L70,35 L80,15 L90,20 L250,20" style={{strokeDasharray:'0 300',animation:'anim-ekg-pulse 3s linear infinite'}}/></svg></div>);

export const PieChartSpin = () => (<div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden"><svg className="w-14 h-14" viewBox="0 0 42 42"><circle cx="21" cy="21" r="16" fill="none" stroke="#1e293b" strokeWidth="6"/><circle cx="21" cy="21" r="16" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="25" style={{animation:'anim-radar-sweep 4s linear infinite'}}/><circle cx="21" cy="21" r="16" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="65"/><circle cx="21" cy="21" r="16" fill="none" stroke="#eab308" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="90"/></svg></div>);

export const BarGraphRise = () => (<div className="absolute inset-0 bg-slate-900 flex items-end justify-around px-4 pb-2 overflow-hidden">{[60,80,45,90,55,70,85].map((h,i)=>(<div key={i} className="w-2 bg-emerald-500/80 rounded-t" style={{height:`${h}%`,animation:'anim-grow 2s ease-out forwards',transformOrigin:'bottom',animationDelay:`${i*0.15}s`}}/>))}</div>);

export const ScatterPlot = () => (<div className="absolute inset-0 bg-slate-950 overflow-hidden">{[{x:20,y:30},{x:35,y:60},{x:45,y:25},{x:55,y:50},{x:65,y:35},{x:75,y:55},{x:85,y:20},{x:30,y:45},{x:60,y:70}].map((p,i)=>(<div key={i} className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full" style={{left:`${p.x}%`,top:`${p.y}%`,animation:`anim-pulse-slow 2s ease-in-out infinite`,animationDelay:`${i*0.2}s`,boxShadow:'0 0 4px #22d3ee'}}/>))}</div>);

export const HeatmapGrid = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden grid grid-cols-8 grid-rows-4 gap-[1px] p-1">{[...Array(32)].map((_,i)=>{const colors=['bg-blue-600/40','bg-emerald-500/50','bg-yellow-500/50','bg-red-500/50','bg-emerald-600/60','bg-blue-500/30'];return(<div key={i} className={`${colors[i%6]} rounded-sm`} style={{animation:`anim-pulse-slow ${1.5+Math.random()}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`}}/>);})}</div>);

export const FlowDiagram = () => (<div className="absolute inset-0 bg-slate-900 overflow-hidden flex items-center"><svg className="w-full h-full opacity-50 px-2" viewBox="0 0 200 40"><path d="M10,10 C50,10 50,20 90,20" fill="none" stroke="#22c55e" strokeWidth="2" style={{strokeDasharray:80,strokeDashoffset:80,animation:'anim-ekg-pulse 3s linear infinite'}}/><path d="M10,30 C50,30 50,20 90,20" fill="none" stroke="#0ea5e9" strokeWidth="2" style={{strokeDasharray:80,strokeDashoffset:80,animation:'anim-ekg-pulse 3s linear infinite',animationDelay:'0.5s'}}/><path d="M90,20 C130,20 130,15 170,15" fill="none" stroke="#a855f7" strokeWidth="2" style={{strokeDasharray:80,strokeDashoffset:80,animation:'anim-ekg-pulse 3s linear infinite',animationDelay:'1s'}}/><path d="M90,20 C130,20 130,30 170,30" fill="none" stroke="#eab308" strokeWidth="2" style={{strokeDasharray:80,strokeDashoffset:80,animation:'anim-ekg-pulse 3s linear infinite',animationDelay:'1.5s'}}/>{[10,10,90,170,170].map((x,i)=>(<circle key={i} cx={x} cy={[10,30,20,15,30][i]} r="2" fill={['#22c55e','#0ea5e9','#94a3b8','#a855f7','#eab308'][i]}/>))}</svg></div>);


// --- Phase 2: Data & Analytics ---

// Surface3D - 3D wireframe surface
export const Surface3D = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      {[0,1,2,3].map(row=>(
        [0,1,2,3,4].map(col=>(
          <path key={`${row}-${col}`}
            d={`M${30+col*32+row*8},${14+row*10} L${30+col*32+8+row*8},${14+row*10} L${30+col*32+16+(row+1)*8},${14+(row+1)*10} L${30+col*32+8+row*8},${14+(row+1)*10} Z`}
            fill={`hsl(${160+col*12+row*8},70%,${25+row*5}%)`}
            stroke="#1e293b" strokeWidth="0.5"/>
        ))
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">3D SURFACE</div>
  </div>
);

// BubbleChart - animated bubble chart
export const BubbleChart = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <line x1="20" y1="5" x2="20" y2="50" stroke="#334155" strokeWidth="1"/>
      <line x1="20" y1="50" x2="195" y2="50" stroke="#334155" strokeWidth="1"/>
      {[[50,35,12],[90,20,18],[130,38,8],[160,25,14],[80,42,6]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r}
          fill={`hsla(${140+i*30},70%,50%,0.5)`}
          stroke={`hsl(${140+i*30},70%,60%)`} strokeWidth="1"
          style={{animation:`anim-pulse-slow ${2+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}/>
      ))}
    </svg>
    <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">BUBBLE CHART</div>
  </div>
);

// LineTrend - multi-line trend chart
export const LineTrend = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <line x1="15" y1="8" x2="15" y2="48" stroke="#334155" strokeWidth="1"/>
      <line x1="15" y1="48" x2="195" y2="48" stroke="#334155" strokeWidth="1"/>
      <path d="M15,40 L50,30 L85,35 L120,20 L155,25 L190,15" fill="none" stroke="#22d3ee" strokeWidth="1.5" style={{animation:'anim-data-flow 3s linear infinite'}}/>
      <path d="M15,45 L50,40 L85,38 L120,30 L155,35 L190,28" fill="none" stroke="#4ade80" strokeWidth="1.5" style={{animation:'anim-data-flow 3s linear infinite',animationDelay:'0.5s'}}/>
      <path d="M15,38 L50,42 L85,25 L120,38 L155,18 L190,30" fill="none" stroke="#f59e0b" strokeWidth="1.5" style={{animation:'anim-data-flow 3s linear infinite',animationDelay:'1s'}}/>
    </svg>
    <div className="absolute bottom-1 left-0 right-0 text-center text-[7px] font-mono text-cyan-400">TREND ANALYSIS</div>
  </div>
);

// BoxPlot - statistical box plot
export const BoxPlot = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-end justify-around px-4 pb-4">
    <div className="absolute top-2 left-0 right-0 text-center text-[7px] font-mono text-slate-400">BOX PLOT</div>
    {[
      {q1:40,q3:70,med:58,min:20,max:90,c:'#22d3ee'},
      {q1:30,q3:65,med:50,min:10,max:80,c:'#4ade80'},
      {q1:45,q3:75,med:62,min:25,max:95,c:'#f59e0b'},
    ].map((d,i)=>{
      const h=36;
      return (
        <div key={i} className="flex flex-col items-center" style={{height:'36px',position:'relative',width:'20px'}}>
          <div className="absolute bg-slate-600 rounded" style={{
            left:'8px',top:`${(100-d.max)/100*h}px`,width:'1px',height:`${(d.max-d.q3)/100*h}px`
          }}/>
          <div className="absolute border rounded" style={{
            left:'2px',top:`${(100-d.q3)/100*h}px`,width:'16px',
            height:`${(d.q3-d.q1)/100*h}px`,borderColor:d.c,background:`${d.c}22`
          }}/>
          <div className="absolute bg-white" style={{
            left:'2px',top:`${(100-d.med)/100*h}px`,width:'16px',height:'1px'
          }}/>
          <div className="absolute bg-slate-600" style={{
            left:'8px',top:`${(100-d.q1)/100*h}px`,width:'1px',height:`${(d.q1-d.min)/100*h}px`
          }}/>
        </div>
      );
    })}
  </div>
);

// ViolinPlot - violin shaped distribution
export const ViolinPlot = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-around px-4">
    <div className="absolute top-2 left-0 right-0 text-center text-[7px] font-mono text-slate-400">VIOLIN PLOT</div>
    {['#22d3ee','#4ade80','#f59e0b'].map((c,i)=>(
      <svg key={i} className="h-10 w-8" viewBox="0 0 32 40">
        <path d="M16,2 Q22,8 20,14 Q24,18 22,24 Q24,30 16,38 Q8,30 10,24 Q8,18 12,14 Q10,8 16,2"
          fill={`${c}33`} stroke={c} strokeWidth="1"
          style={{animation:`anim-pulse-slow ${1.5+i*0.4}s ease-in-out infinite`}}/>
        <line x1="16" y1="2" x2="16" y2="38" stroke={c} strokeWidth="0.5" opacity="0.5"/>
      </svg>
    ))}
  </div>
);

// AreaGraph - stacked area chart
export const AreaGraph = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 56">
      <defs>
        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.6"/><stop offset="100%" stopColor="#4ade80" stopOpacity="0.1"/></linearGradient>
        <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1"/></linearGradient>
      </defs>
      <path d="M10,45 L50,35 L90,40 L130,25 L170,30 L195,20 L195,50 L10,50 Z" fill="url(#ag1)"/>
      <path d="M10,48 L50,42 L90,44 L130,38 L170,40 L195,35 L195,50 L10,50 Z" fill="url(#ag2)"/>
      <path d="M10,45 L50,35 L90,40 L130,25 L170,30 L195,20" fill="none" stroke="#4ade80" strokeWidth="1.5"/>
      <path d="M10,48 L50,42 L90,44 L130,38 L170,40 L195,35" fill="none" stroke="#22d3ee" strokeWidth="1.5"/>
    </svg>
    <div className="absolute bottom-1 left-0 right-0 text-center text-[7px] font-mono text-green-400">AREA CHART</div>
  </div>
);

// FunnelData - funnel conversion chart
export const FunnelData = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex flex-col items-center justify-center gap-1">
    <div className="absolute top-2 left-0 right-0 text-center text-[7px] font-mono text-slate-400">FUNNEL</div>
    {[
      {w:'80%',label:'Scanned',c:'#22d3ee'},
      {w:'60%',label:'Detected',c:'#4ade80'},
      {w:'40%',label:'Analyzed',c:'#f59e0b'},
      {w:'20%',label:'Alert',c:'#ef4444'},
    ].map((s,i)=>(
      <div key={i} className="flex items-center gap-2" style={{width:s.w}}>
        <div className="flex-1 rounded text-center text-[6px] font-mono py-0.5" style={{background:s.c+'33',border:`1px solid ${s.c}66`,color:s.c}}>{s.label}</div>
      </div>
    ))}
  </div>
);

// GaugeMeter - speedometer gauge
export const GaugeMeter = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-20 h-14" viewBox="0 0 80 56">
      <path d="M10,48 A30,30 0 0,1 70,48" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round"/>
      <path d="M10,48 A30,30 0 0,1 70,48" fill="none" stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="94 200"/>
      <defs><linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22c55e"/><stop offset="50%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#ef4444"/></linearGradient></defs>
      <line x1="40" y1="48" x2={40+25*Math.cos(-0.8)} y2={48+25*Math.sin(-0.8)} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" style={{animation:'anim-spin 4s ease-in-out infinite',transformOrigin:'40px 48px'}}/>
      <circle cx="40" cy="48" r="3" fill="#64748b"/>
      <text x="40" y="54" textAnchor="middle" fill="#94a3b8" fontSize="4" fontFamily="monospace">GAUGE</text>
    </svg>
  </div>
);

// KpiBoard - KPI metrics dashboard
export const KpiBoard = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden p-2">
    <div className="text-[7px] font-mono text-slate-400 text-center mb-1">KPI BOARD</div>
    <div className="grid grid-cols-2 gap-1 h-[calc(100%-16px)]">
      {[
        {label:'Yield',val:'94%',c:'#4ade80',trend:'↑'},
        {label:'Disease',val:'2.1%',c:'#f59e0b',trend:'↓'},
        {label:'Water',val:'78%',c:'#22d3ee',trend:'↑'},
        {label:'Soil',val:'6.8 pH',c:'#a78bfa',trend:'→'},
      ].map((k,i)=>(
        <div key={i} className="rounded border flex flex-col items-center justify-center" style={{borderColor:k.c+'44',background:k.c+'11'}}>
          <div className="text-[5px] font-mono" style={{color:k.c+'aa'}}>{k.label}</div>
          <div className="text-[8px] font-mono font-bold" style={{color:k.c}}>{k.val}</div>
          <div className="text-[6px]" style={{color:k.c}}>{k.trend}</div>
        </div>
      ))}
    </div>
  </div>
);

// NodeGraph - network node graph
export const NodeGraph = () => (
  <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
    <svg className="w-full h-full" viewBox="0 0 200 56">
      {[[100,28],[40,15],[160,15],[40,41],[160,41],[70,28],[130,28]].map(([x,y],i)=>(
        <g key={i}>
          {i>0 && <line x1="100" y1="28" x2={x} y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 2"/>}
          <circle cx={x} cy={y} r={i===0?7:5} fill={i===0?"#3b82f6":"#1e293b"} stroke={i===0?"#60a5fa":"#4b5563"} strokeWidth="1"
            style={{animation:`anim-pulse-slow ${1.5+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}/>
        </g>
      ))}
    </svg>
    <div className="absolute bottom-1 left-0 right-0 text-center text-[7px] font-mono text-blue-400">NODE GRAPH</div>
  </div>
);
