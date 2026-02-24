import React, { useState, useEffect } from "react";
import bgBolivar from "../../assets/Pzo.jpg"; // Asegúrate de que la ruta sea correcta
import Navbar2 from "../../Components/Navbar_sc";

const useScrollReveal = () => {
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return setRef;
};

export default function Proposito() {
  const setRevealCuerpo = useScrollReveal();
  const setRevealAgenda = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30">
      <Navbar2 />

      {/* --- HERO SECTION CON IMAGEN Y ANIMACIÓN --- */}
      <header
        className="relative px-6 lg:px-20 py-24 flex items-center justify-center min-h-[50vh] bg-cover animate-header-bg overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.85), rgba(2, 44, 34, 0.85)), url(${bgBolivar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="relative z-10 text-center space-y-4">
          <p 
            className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs animate-header-text"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            Ciudad Guayana, 7 de febrero 2026
          </p>
          <h1 
            className="text-5xl lg:text-8xl font-black tracking-tighter animate-header-text"
            style={{ animationDelay: "0.4s", opacity: 0 }}
          >
            Nuestro <span className="text-emerald-500 italic">Propósito</span>
          </h1>
          <p 
            className="text-emerald-100/60 max-w-2xl mx-auto font-medium animate-header-text uppercase tracking-widest text-sm"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            Convocatoria Gremial • Gestión 2025-2027
          </p>
        </div>
      </header>

      {/* --- CUERPO PRINCIPAL --- */}
      <main className="bg-white text-slate-900 rounded-t-[4rem] -mt-12 relative z-10 px-6 lg:px-20 py-24">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Bloque de Introducción Legal */}
          <section ref={setRevealCuerpo} className="reveal-slide-up space-y-6">
            <div className="inline-block border-l-4 border-emerald-500 pl-6">
              <h2 className="text-2xl font-black text-[#022c22] uppercase tracking-tight leading-none">
                Cámara Inmobiliaria del estado Bolívar
              </h2>
              <p className="text-sm font-bold text-emerald-600 mt-2">RIF: J306407383</p>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-lg">
              Bajo la vigencia de los estatutos sociales (Artículo 21), nuestro propósito en esta asamblea es la consolidación institucional. Se convoca a los afiliados para deliberar sobre los siguientes puntos estratégicos:
            </p>
          </section>

          {/* Agenda Estructurada */}
          <section ref={setRevealAgenda} className="reveal-slide-up grid gap-4">
            {[
              "Formalización de la nueva Junta Directiva 2025-2027",
              "Situación legal y financiera de la institución",
              "Sostenibilidad financiera y nuevos convenios",
              "Contratos de prestación de servicios gremiales",
              "Presentación del Plan de Gestión 2026",
              "Innovación digital: Sistema de gestión y Web"
            ].map((punto, idx) => (
              <div key={idx} className="flex gap-6 p-6 rounded-[2rem] border-2 border-emerald-50 bg-slate-50/50 hover:border-emerald-500 hover:bg-white transition-all duration-300 group">
                <span className="flex-none w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {idx + 1}
                </span>
                <p className="text-slate-700 font-bold self-center">{punto}</p>
              </div>
            ))}
          </section>

          {/* Banner Informativo Final */}
          <div className="bg-[#022c22] rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Asamblea Extraordinaria</h3>
                <p className="text-emerald-400 font-bold italic">Miércoles 18 de febrero, 2:00 P.M.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400 mb-2">Lugar de encuentro</p>
                <p className="text-sm font-medium">Sede Cámara de la Construcción, Alta Vista.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#011a14] py-14 text-center">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-black">
          CIEBO • Compromiso Institucional • 2026
        </p>
      </footer>
    </div>
  );
}