import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#022c22]">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-700 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Logo / Spinner */}
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-2xl border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-2xl border-t-4 border-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center font-black text-emerald-500 text-xl tracking-tighter">
            CI
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center text-center space-y-2">
          <h2 className="text-white font-black text-lg tracking-[0.2em] uppercase animate-pulse">
            Cargando Experiencia
          </h2>
          <div className="h-1 w-48 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[loading-bar_2s_infinite_ease-in-out]" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
