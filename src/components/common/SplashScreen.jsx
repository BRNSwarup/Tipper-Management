import React, { useState, useEffect } from 'react';

export const SplashScreen = () => {
  const [stage, setStage] = useState('visible'); // 'visible' -> 'sliding' -> 'hidden'

  useEffect(() => {
    // Stage 1: Display round logo centered for 900ms
    const timer1 = setTimeout(() => {
      setStage('sliding');
    }, 900);

    // Stage 2: Fast slide up (500ms transition), then unmount
    const timer2 = setTimeout(() => {
      setStage('hidden');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (stage === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        stage === 'sliding' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center p-6">
        {/* Round Shape Sangu's Tippers Logo */}
        <div className="relative mb-5">
          <div className="absolute -inset-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-lg opacity-80 animate-pulse" />
          <img
            src="/sangu-logo.png"
            alt="Sangu's Tippers Logo"
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-orange-500 shadow-2xl shadow-orange-500/50 transform hover:scale-105 transition-transform"
          />
        </div>

        {/* Brand Header */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SANGU'S TIPPERS
        </h1>
        <p className="text-xs sm:text-sm font-black text-orange-400 tracking-widest uppercase mt-1">
          COMMERCIAL FLEET MANAGEMENT
        </p>

        {/* Fast Loading Spinner */}
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-xs font-bold text-slate-300 tracking-wide">Starting System...</span>
        </div>
      </div>
    </div>
  );
};
