import React, { useState } from 'react';
import Navbar from '@/pages/landing/components/Navbar';
import { ArrowRight, Award, Briefcase, TrendingUp, Building, Globe2, CheckCircle2 } from 'lucide-react';

export default function PegiPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const modules = [
    {
      title: "Gerencia Estratégica",
      icon: Briefcase,
      desc: "Liderazgo de oficinas, estructuración de equipos de ventas de alto rendimiento y manejo de KPIs inmobiliarios.",
      color: "bg-amber-500",
      lightBg: "bg-amber-50",
      darkBg: "dark:bg-amber-900/20"
    },
    {
      title: "Expansión y Franquicias",
      icon: Globe2,
      desc: "Modelos de escalabilidad nacional, apertura de sucursales y entendimiento del formato franquicia de bienes raíces.",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      darkBg: "dark:bg-emerald-900/20"
    },
    {
      title: "Evaluación Financiera",
      icon: TrendingUp,
      desc: "Factibilidad económica de proyectos macro, análisis de riesgo y retorno de inversión en mercados volátiles.",
      color: "bg-blue-500",
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/20"
    },
    {
      title: "Corporate Real Estate",
      icon: Building,
      desc: "Especialización en fondos de inversión inmobiliaria, centros comerciales, parques industriales y propiedades prime.",
      color: "bg-purple-500",
      lightBg: "bg-purple-50",
      darkBg: "dark:bg-purple-900/20"
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'dark bg-[#011a14] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setIsSesionModalOpen={setIsLoginOpen} 
        setIsRegisterModalOpen={setIsRegisterOpen} 
      />

      {/* Hero Interactivo (Estilo PREANI adaptado a PEGI) */}
      <section className="relative pt-32 pb-24 px-6 lg:px-20 overflow-hidden bg-white dark:bg-[#022c22] border-b border-slate-200 dark:border-emerald-500/20">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, var(--tw-gradient-stops))' }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-amber-500/5 dark:to-amber-500/10" />
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-[#04432f] border border-slate-200 dark:border-amber-500/30 text-xs font-black uppercase tracking-widest text-[#022c22] dark:text-amber-400">
              <Award size={14} /> ESPECIALIZACIÓN EJECUTIVA
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-slate-900 dark:text-white">
              Programa de Especialización en <span className="text-amber-500 italic block mt-2">Gerencia Inmobiliaria</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-emerald-50/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Diseñado exclusivamente para directores, brókers y dueños de inmobiliarias. Adquiera las herramientas financieras y gerenciales para escalar corporaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <a href="#inscripcion" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wide bg-amber-500 text-white dark:text-[#011a14] hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95">
                Aplicar Admisión <ArrowRight size={18} />
              </a>
              <a href="#pensum" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wide border-2 border-slate-200 dark:border-amber-500/30 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-[#04432f] transition-all">
                Ver Plan Ejecutivo
              </a>
            </div>
          </div>
          
          <div className="flex-1 relative w-full max-w-lg lg:max-w-md mx-auto">
             {/* Abstract Composition / Badge */}
             <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-slate-100 to-white dark:from-[#04432f] dark:to-[#011a14] border-8 border-white dark:border-[#022c22] shadow-2xl flex items-center justify-center p-12 overflow-hidden -rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="absolute inset-0 bg-[#022c22] opacity-[0.03] dark:opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)'}} />
                <div className="text-center relative z-10">
                   <div className="w-24 h-24 mx-auto bg-amber-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30">
                      <Award size={48} />
                   </div>
                   <h3 className="text-4xl font-black text-slate-800 dark:text-emerald-50">PEGI</h3>
                   <p className="text-sm font-bold text-slate-400 dark:text-amber-500/80 uppercase tracking-widest mt-2 border-t-2 border-slate-200 dark:border-amber-500/20 pt-2">Nivel Máster</p>
                </div>
             </div>
             {/* Floating elements */}
             <div className="absolute -bottom-6 -right-6 bg-white dark:bg-[#022c22] p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-amber-500/20 flex gap-4 items-center animate-bounce" style={{ animationDuration: '3.5s'}}>
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-amber-400 font-black">120+</div>
                <div>
                   <p className="text-xs font-bold text-slate-400 dark:text-emerald-50/50 uppercase">Egresados</p>
                   <p className="text-sm font-black text-slate-800 dark:text-white">CEO & Brokers</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Módulos Bento-Box */}
      <section id="pensum" className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
         <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
               El arte de estructurar <br/><span className="text-amber-500">imperios inmobiliarios.</span>
            </h2>
            <p className="text-lg font-medium text-slate-500 dark:text-emerald-50/60 max-w-2xl mx-auto">
               Olvídese del corretaje tradicional. Este es un programa inmersivo diseñado para enseñarle a pensar como el fondo de inversión o el presidente de la franquicia.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod, idx) => {
               const IconCmp = mod.icon;
               return (
                  <div key={idx} className={`group p-8 rounded-[2rem] border-2 border-transparent bg-white dark:bg-[#04432f] hover:border-slate-200 dark:hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-300`}>
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${mod.lightBg} ${mod.darkBg} ${mod.color.replace('bg-', 'text-')}`}>
                        <IconCmp size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 dark:text-emerald-50 mb-3">{mod.title}</h3>
                     <p className="text-slate-500 dark:text-emerald-100/70 font-medium leading-relaxed">
                        {mod.desc}
                     </p>
                  </div>
               );
            })}
         </div>
      </section>

      {/* Aval / Institucional */}
      <section className="py-24 px-6 lg:px-20 bg-emerald-950 dark:bg-amber-950/20 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 0%, transparent 50%)' }} />
         <div className="max-w-4xl mx-auto relative z-10 space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-white">Programa de Élite Corporativa</h2>
            <p className="text-lg font-medium text-emerald-100/80 max-w-2xl mx-auto">
               Superar exitosamente el PEGI le abre las puertas a negociaciones corporativas y estructuraciones financieras a nivel transnacional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
               <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
                  <CheckCircle2 className="text-amber-400" />
                  <span className="font-bold text-white tracking-wide">Certificación Avanzada</span>
               </div>
               <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
                  <CheckCircle2 className="text-amber-400" />
                  <span className="font-bold text-white tracking-wide">Red de Brókers TOP</span>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}
