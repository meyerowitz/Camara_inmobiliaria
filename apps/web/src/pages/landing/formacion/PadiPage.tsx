import React, { useState } from 'react';
import Navbar from '@/pages/landing/components/Navbar';
import { ArrowRight, HardHat, Building2, Ruler, Cog, CheckCircle2 } from 'lucide-react';

export default function PadiPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const modules = [
    {
      title: "Análisis de Terrenos",
      icon: Ruler,
      desc: "Zonificación, factibilidad de servicios públicos y estudio de linderos según regulaciones municipales venezolanas.",
      color: "bg-cyan-500",
      lightBg: "bg-cyan-50",
      darkBg: "dark:bg-cyan-900/20"
    },
    {
      title: "Proyectos Arquitectónicos",
      icon: Building2,
      desc: "Lectura de planos, volumetría y aprobación de anteproyectos ante el Colegio de Ingenieros de Venezuela (CIV).",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      darkBg: "dark:bg-emerald-900/20"
    },
    {
      title: "Costos y Presupuestos",
      icon: Cog,
      desc: "Estructuras de costos de obras, materiales de construcción, inflación y cronograma de ejecución física.",
      color: "bg-slate-500",
      lightBg: "bg-slate-50",
      darkBg: "dark:bg-slate-900/20"
    },
    {
      title: "Preventa y Comercialización",
      icon: HardHat,
      desc: "Técnicas de venta en planos, fideicomisos inmobiliarios y garantías de cumplimiento para el desarrollador privado.",
      color: "bg-blue-500",
      lightBg: "bg-blue-50",
      darkBg: "dark:bg-blue-900/20"
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

      {/* Hero Interactivo (Estilo PREANI adaptado a PADI) */}
      <section className="relative pt-32 pb-24 px-6 lg:px-20 overflow-hidden bg-white dark:bg-[#022c22] border-b border-slate-200 dark:border-emerald-500/20">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, var(--tw-gradient-stops))' }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-cyan-500/5 dark:to-cyan-500/10" />
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-[#04432f] border border-slate-200 dark:border-cyan-500/30 text-xs font-black uppercase tracking-widest text-[#022c22] dark:text-cyan-400">
              <Ruler size={14} /> Ingeniería & Construcción
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-slate-900 dark:text-white">
              Programa Avanzado en <span className="text-cyan-500 italic block mt-2">Desarrollo Inmobiliario</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-emerald-50/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Domina todo el ciclo de vida de una obra civil. Desde la captación del terreno en bruto hasta la entrega de llaves del complejo habitacional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <a href="#inscripcion" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wide bg-cyan-600 text-white dark:text-[#011a14] hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-95">
                Inscribirse al PADI <ArrowRight size={18} />
              </a>
              <a href="#pensum" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wide border-2 border-slate-200 dark:border-cyan-500/30 text-slate-600 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#04432f] transition-all">
                Plan de Construcción
              </a>
            </div>
          </div>
          
          <div className="flex-1 relative w-full max-w-lg lg:max-w-md mx-auto">
             {/* Abstract Composition / Badge */}
             <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-slate-100 to-white dark:from-[#04432f] dark:to-[#011a14] border-8 border-white dark:border-[#022c22] shadow-2xl flex items-center justify-center p-12 overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="absolute inset-0 bg-[#022c22] opacity-[0.03] dark:opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)'}} />
                <div className="text-center relative z-10">
                   <div className="w-24 h-24 mx-auto bg-cyan-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/30">
                      <Building2 size={48} />
                   </div>
                   <h3 className="text-4xl font-black text-slate-800 dark:text-emerald-50">PADI</h3>
                   <p className="text-sm font-bold text-slate-400 dark:text-cyan-500/80 uppercase tracking-widest mt-2 border-t-2 border-slate-200 dark:border-cyan-500/20 pt-2">Fase Constructiva</p>
                </div>
             </div>
             {/* Floating elements */}
             <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#022c22] p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-cyan-500/20 flex gap-4 items-center animate-bounce" style={{ animationDuration: '3.2s'}}>
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-600 dark:text-cyan-400 font-black"><HardHat size={20} /></div>
                <div>
                   <p className="text-xs font-bold text-slate-400 dark:text-emerald-50/50 uppercase">Formato</p>
                   <p className="text-sm font-black text-slate-800 dark:text-white">Presencial</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Módulos Bento-Box */}
      <section id="pensum" className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
         <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
               Fases de la <span className="text-cyan-600 dark:text-cyan-500">Edificación</span>
            </h2>
            <p className="text-lg font-medium text-slate-500 dark:text-emerald-50/60 max-w-2xl mx-auto">
               Entienda la terminología, los permisos y los tiempos que manejan los ingenieros y arquitectos en Venezuela.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod, idx) => {
               const IconCmp = mod.icon;
               return (
                  <div key={idx} className={`group p-8 rounded-[2rem] border-2 border-transparent bg-white dark:bg-[#04432f] hover:border-slate-200 dark:hover:border-cyan-500/40 shadow-sm hover:shadow-xl transition-all duration-300`}>
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
      <section className="py-24 px-6 lg:px-20 bg-slate-900 dark:bg-cyan-950/20 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 0%, transparent 50%)' }} />
         <div className="max-w-4xl mx-auto relative z-10 space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-white">Certificación en Desarrollo</h2>
            <p className="text-lg font-medium text-slate-400 max-w-2xl mx-auto">
               El programa PADI es un requisito altamente valorado en el ámbito de la promoción Inmobiliaria, brindando al alumno la capacidad técnica para evaluar proyectos en planos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
               <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
                  <CheckCircle2 className="text-cyan-400" />
                  <span className="font-bold text-white tracking-wide">Avalado por CIV</span>
               </div>
               <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
                  <CheckCircle2 className="text-cyan-400" />
                  <span className="font-bold text-white tracking-wide">Red de Promotores</span>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}
