import React, { useState, useEffect } from 'react';

const FarmerAnimation = () => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  
  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) setTimeOfDay('sunrise');
      else if (hour >= 8 && hour < 17) setTimeOfDay('day');
      else if (hour >= 17 && hour < 19) setTimeOfDay('sunset');
      else setTimeOfDay('night');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const skyGradients = {
    sunrise: 'from-[#ff9a9e] via-[#fecfef] to-[#a1c4fd]',
    day: 'from-[#4facfe] to-[#00f2fe]',
    sunset: 'from-[#fa709a] via-[#fee140] to-[#f6d365]',
    night: 'from-[#09203f] to-[#537895]'
  };

  const isNight = timeOfDay === 'night';
  const silhouetteColor = isNight ? '#020617' : '#0f172a'; // Deep silhouette
  const ground1 = isNight ? '#064e3b' : '#10b981'; // Emerald 800 vs 500
  const ground2 = isNight ? '#022c22' : '#059669'; // Emerald 950 vs 600
  const ground3 = isNight ? '#020617' : '#047857'; // Slate 950 vs Emerald 700

  return (
    <div 
      className={`relative h-14 w-64 md:w-80 rounded-2xl overflow-hidden bg-gradient-to-r ${skyGradients[timeOfDay]} transition-all duration-[4000ms] shadow-inner flex-shrink-0 border border-slate-200/50 dark:border-slate-700/50 hidden lg:block mx-4`}
      title={`Farm Routine: ${timeOfDay}`}
    >
      {/* SVG Filters for Glow Effects */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="water-glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Sun / Moon with God Rays / Glow */}
      <div className={`absolute transition-all duration-[4000ms] ease-in-out ${
        timeOfDay === 'night' 
          ? 'w-6 h-6 bg-[#f8fafc] left-48 top-2 rounded-full shadow-[0_0_20px_#f1f5f9,inset_-4px_-2px_0_#cbd5e1]' : 
        timeOfDay === 'sunrise' 
          ? 'w-10 h-10 bg-[#fef08a] left-4 top-4 rounded-full shadow-[0_0_40px_#fde047]' :
        timeOfDay === 'sunset' 
          ? 'w-10 h-10 bg-[#fca5a5] left-60 top-4 rounded-full shadow-[0_0_40px_#ef4444]' :
          'w-12 h-12 bg-[#fef08a] left-32 -top-2 rounded-full shadow-[0_0_50px_#fde047,0_0_100px_#fef08a]'
      }`}>
        {/* Sun Rays (Day only) */}
        {!isNight && timeOfDay === 'day' && (
          <div className="absolute inset-0 w-full h-full rounded-full animate-spin-slow opacity-50 bg-[radial-gradient(circle,transparent_40%,#fde047_80%)]" />
        )}
      </div>

      {/* Stars (Night only) */}
      <div className={`absolute inset-0 transition-opacity duration-[3000ms] ${isNight ? 'opacity-100' : 'opacity-0'}`}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-twinkle" 
               style={{ 
                 width: Math.random() * 2 + 1 + 'px', 
                 height: Math.random() * 2 + 1 + 'px',
                 top: Math.random() * 100 + '%', 
                 left: Math.random() * 100 + '%',
                 animationDelay: `${Math.random() * 3}s`
               }} 
          />
        ))}
      </div>

      {/* Parallax Clouds */}
      <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 200 40">
        <path d="M-20,15 Q-10,5 0,15 Q10,10 20,18 Q10,25 0,22 Q-10,25 -20,15 Z" fill="#ffffff" className="anim-cloud-fast" />
        <path d="M50,10 Q65,0 80,10 Q95,5 110,12 Q95,20 80,18 Q65,20 50,10 Z" fill="#f8fafc" className="anim-cloud-slow" />
        <path d="M140,20 Q150,12 160,20 Q170,15 180,22 Q170,28 160,26 Q150,28 140,20 Z" fill="#f1f5f9" className="anim-cloud-med" />
      </svg>

      {/* Flying Birds (Day/Sunset) */}
      {!isNight && (
        <svg className="absolute top-2 w-full h-10 opacity-60" viewBox="0 0 200 40">
          <g className="anim-birds" stroke={silhouetteColor} strokeWidth="1" fill="none">
            <path d="M0,10 Q5,5 10,10 Q15,5 20,10" />
            <path d="M15,15 Q20,10 25,15 Q30,10 35,15" />
          </g>
        </svg>
      )}

      {/* Parallax Mountains / Hills */}
      <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
        {/* Back Hill */}
        <path d="M0,45 Q50,20 120,40 T200,30 L200,60 L0,60 Z" fill={ground1} className="transition-colors duration-[4000ms]" />
        {/* Mid Hill */}
        <path d="M-20,50 Q60,35 150,55 T220,45 L220,60 L-20,60 Z" fill={ground2} className="transition-colors duration-[4000ms]" />
        {/* Front Ground */}
        <path d="M0,55 Q100,45 200,55 L200,60 L0,60 Z" fill={ground3} className="transition-colors duration-[4000ms]" />
      </svg>

      {/* Swaying Crops Layer */}
      <div className="absolute bottom-0 left-2 w-full flex gap-1.5 opacity-90 overflow-hidden h-6">
        {[...Array(20)].map((_, i) => (
          <svg key={i} width="12" height="24" viewBox="0 0 12 24" fill="none" stroke={isNight ? '#34d399' : '#a7f3d0'} strokeWidth="1.5" strokeLinecap="round" className="anim-sway" style={{ animationDelay: `${i * 0.15}s` }}>
            <path d="M6 24 C6 18, 2 12, 6 6" />
            <path d="M6 16 C3 16, 2 14, 2 12" />
            <path d="M6 12 C9 12, 10 10, 10 8" />
          </svg>
        ))}
      </div>

      {/* Advanced Farmer Silhouette & Watering Engine (Now Walking!) */}
      <div className="absolute bottom-0.5 right-6 w-16 h-14 anim-farmer-walk">
        <div className="w-full h-full anim-bob">
          <svg viewBox="0 0 80 80" width="100%" height="100%" fill="none">
            {/* Detailed Farmer Silhouette */}
            <g fill={silhouetteColor} stroke={silhouetteColor} className="transition-colors duration-[4000ms]">
            {/* Straw Hat Wide Brim */}
            <path d="M20,25 Q35,15 50,25 Q45,28 35,27 Q25,28 20,25 Z" />
            {/* Hat Dome */}
            <path d="M28,25 Q35,10 42,25 Z" />
            {/* Head */}
            <circle cx="35" cy="30" r="5" />
            {/* Torso (Bending forward) */}
            <path d="M30,34 L40,33 L45,55 L28,55 Z" />
            {/* Legs (Walking stance) */}
            <path d="M30,55 L25,75" strokeWidth="5" strokeLinecap="round" />
            <path d="M40,55 L45,75" strokeWidth="5" strokeLinecap="round" />
            {/* Back Arm */}
            <path d="M32,38 L25,48 L22,45" strokeWidth="4" strokeLinecap="round" />
            {/* Front Arm (Holding Can) */}
            <path d="M38,36 L48,45 L45,52" strokeWidth="4" strokeLinecap="round" />
          </g>
          
          {/* Detailed Watering Can */}
          <g fill={isNight ? '#1e293b' : '#334155'} stroke={isNight ? '#1e293b' : '#334155'} className="transition-colors duration-[4000ms]">
            <rect x="42" y="50" width="12" height="10" rx="2" />
            {/* Handle */}
            <path d="M42,52 C38,50 38,58 42,58" fill="none" strokeWidth="2" />
            {/* Top handle */}
            <path d="M45,50 C48,45 51,45 54,50" fill="none" strokeWidth="2" />
            {/* Spout */}
            <path d="M42,58 L30,65" strokeWidth="3" strokeLinecap="round" />
            {/* Rose (Shower head) */}
            <ellipse cx="28" cy="67" rx="3" ry="6" transform="rotate(-30 28 67)" />
          </g>

          {/* Continuous Water Stream Animation */}
          <g filter="url(#water-glow)">
            <path 
              d="M26,67 Q20,72 15,80" 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
              className="anim-water-stream opacity-80"
            />
            <path 
              d="M28,68 Q22,75 18,80" 
              fill="none" 
              stroke="#7dd3fc" 
              strokeWidth="1.5" 
              strokeDasharray="3 5" 
              className="anim-water-stream-fast opacity-90"
            />
            <path 
              d="M24,66 Q15,70 10,80" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="1" 
              strokeDasharray="2 6" 
              className="anim-water-stream-slow opacity-70"
            />
          </g>
        </svg>
        </div>
      </div>

      {/* Fireflies (Night/Sunset only) */}
      {(isNight || timeOfDay === 'sunset') && (
        <div className="absolute bottom-0 left-0 w-full h-8 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-lime-300 w-1 h-1 shadow-[0_0_6px_#bef264] anim-firefly"
                 style={{ 
                   left: Math.random() * 100 + '%',
                   bottom: Math.random() * 100 + '%',
                   animationDelay: `${Math.random() * 5}s`,
                   animationDuration: `${3 + Math.random() * 4}s`
                 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerAnimation;
