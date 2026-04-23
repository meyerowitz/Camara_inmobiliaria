import React from 'react'

// Tier 1: Fully static — no API needed. Dates are permanent historical facts.
export default function OrigenesSection() {
  return (
    <section id="origenes" className="bg-[#022c22] py-24 px-6 lg:px-20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs mb-4">
              Fechas Fundacionales
            </p>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8">
              Nuestros Orígenes
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"></div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="group bg-[#011a14]/40 border border-emerald-500/10 hover:bg-[#011a14]/60 hover:border-emerald-500/30 p-8 md:p-10 rounded-3xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                <h3 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-300">
                  1966
                </h3>
                <div className="hidden md:block w-px h-16 bg-emerald-500/20"></div>
                <p className="text-emerald-50/80 text-lg leading-relaxed font-light">
                  Fundación de la Cámara Inmobiliaria de Venezuela.
                </p>
              </div>
            </div>
            <div className="group bg-gradient-to-br from-emerald-900/30 to-[#011a14]/50 border border-emerald-500/30 hover:border-emerald-400/60 p-8 md:p-10 rounded-3xl transition-all duration-300 shadow-xl shadow-emerald-900/10">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                <h3 className="text-6xl md:text-7xl font-black text-emerald-400 drop-shadow-md">
                  1999
                </h3>
                <div className="hidden md:block w-px h-16 bg-emerald-500/30"></div>
                <p className="text-white text-lg leading-relaxed font-medium">
                  Fundación de la Cámara Inmobiliaria del estado Bolívar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
