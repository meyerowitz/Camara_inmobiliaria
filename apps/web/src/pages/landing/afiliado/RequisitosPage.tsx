import React, { useState } from "react";
import bgCibir from "@/assets/Pzo.jpg";
import Navbar from '@/pages/landing/components/navbar/Navbar';
import Estudiosa from "@/assets/estudiosa1.png";
import Estudioso from "@/assets/estudioso1.png";
import PreinscripcionProgramaForm from '@/pages/landing/components/PreinscripcionProgramaForm'

export default function RequisitosPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#022c22] text-white font-sans selection:bg-emerald-500/30 scroll-smooth">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <header
        className="relative px-4 sm:px-6 lg:px-20 py-24 lg:py-40 flex items-center justify-center min-h-[60vh] bg-cover"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.8), rgba(2, 44, 34, 0.9)), url(${bgCibir})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center space-y-8 max-w-5xl relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
            ¡Únete a nuestro <br />
            <span className="text-emerald-500 italic">equipo</span> de profesionales!
          </h1>
          <p className="text-emerald-100/70 text-xl md:text-2xl font-light max-w-3xl mx-auto italic">
            El primer paso para transformar tu carrera inmobiliaria comienza aquí. 
            Regístrate y forma parte del gremio más influyente de la región.
          </p>
        </div>
      </header>

      <main className="bg-white text-slate-900 rounded-t-[3rem] sm:rounded-t-[4rem] -mt-20 relative z-20 px-4 sm:px-6 lg:px-20 py-20">
        <div className="max-w-4xl mx-auto">
          
          <div className="relative group">
            {/* Watermarks */}
            <div className="absolute -top-40 -left-60 opacity-[0.03] pointer-events-none hidden lg:block">
              <img src={Estudiosa} alt="" className="h-[600px] w-auto" />
            </div>
            <div className="absolute -bottom-20 -right-60 opacity-[0.03] pointer-events-none hidden lg:block">
              <img src={Estudioso} alt="" className="h-[500px] w-auto" />
            </div>

            <div id="formulario" className="relative z-10 p-8 sm:p-16 rounded-[3rem] bg-[#022c22] text-white text-center space-y-10 overflow-hidden shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
              
              <div className="relative z-10 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                  Solicitud de Afiliación
                </h2>
                <p className="text-emerald-200/60 text-lg max-w-2xl mx-auto font-medium">
                  Completa tus datos y nos pondremos en contacto contigo para iniciar tu proceso.
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <PreinscripcionProgramaForm programaCodigo="AFILIACION" ctaLabel="Enviar Solicitud" />
              </div>
            </div>
          </div>
        </div>
      </main >

      <footer className="bg-[#011a14] px-6 lg:px-20 py-12 text-center border-t border-white/5 relative z-10">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
          CÁMARA INMOBILIARIA DEL ESTADO BOLÍVAR • 2026
        </p>
      </footer>
    </div >
  );
}
