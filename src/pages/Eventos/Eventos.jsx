import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgBolivar from "../../assets/Pzo.jpg";
import Navbar2 from "../../Components/Navbar_sc";

export default function Eventos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30">
      <Navbar2 />

      <header
        className="relative px-4 sm:px-6 lg:px-20 py-12 lg:py-24 flex items-center justify-center min-h-[35vh] md:min-h-[40vh] bg-cover"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.85), rgba(2, 44, 34, 0.85)), url(${bgBolivar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center space-y-3 md:space-y-4">
          <p className="text-emerald-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs">
            Capacitación y Encuentros
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white">
            Nuestros <span className="text-emerald-500 italic">Eventos</span>
          </h1>
          <p className="text-emerald-100/60 text-[10px] md:text-sm tracking-widest uppercase font-medium max-w-[280px] md:max-w-none mx-auto">
            Cámara Inmobiliaria del Estado Bolívar
          </p>
        </div>
      </header>

      <main className="bg-[#f8fafc] text-slate-900 rounded-t-[3rem] md:rounded-t-[4rem] -mt-12 md:-mt-16 relative z-10 px-4 sm:px-6 lg:px-24 py-12 md:py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="group flex flex-col space-y-3 md:space-y-4 w-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl shadow-slate-200 bg-slate-200">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-black text-[8px] md:text-xs uppercase tracking-widest px-2 text-center">
                      Afiche Evento {i + 1}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500 flex items-end p-4 md:p-8">
                      <button className="w-full bg-emerald-500 text-[#022c22] font-black text-[8px] md:text-xs uppercase py-2 md:py-3 rounded-lg md:rounded-xl tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-lg shadow-emerald-500/20">
                        Ver Detalles
                      </button>
                    </div>
                  </div>

                  <div className="px-1">
                    <h3 className="font-black text-sm sm:text-base md:text-xl text-[#022c22] leading-tight break-words">
                      Título del Evento {i + 1}
                    </h3>
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
                      Próximamente
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 md:mt-24 flex justify-center items-center gap-4 md:gap-8">
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#022c22] hover:text-white transition-all text-slate-400">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-2 md:gap-4 items-center font-black text-[10px] md:text-xs text-slate-300 tracking-tighter">
                <span className="text-[#022c22] text-lg md:text-xl">01</span>
                <span>/</span>
                <span>03</span>
              </div>

              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#022c22] hover:text-white transition-all text-[#022c22]">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#011a14] px-6 py-8 md:py-10 text-center relative z-10 border-t border-white/5">
        <p className="text-gray-600 text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em]">
          © 2026 Cámara Inmobiliaria del Estado Bolívar • RIF J-30462520-0
        </p>
      </footer>
    </div>
  );
}
