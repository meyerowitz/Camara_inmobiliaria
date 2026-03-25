import React, { useRef, useEffect, useState } from "react"; // IMPORTANTE: Agregamos useState
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.png";
import bgBolivar from "../../assets/Pzo.jpg";
import Navbar2 from "../../Components/Navbar_sc";
import francisco from "../../assets/Junta_directiva/francisco.png"
import graciela from "../../assets/Junta_directiva/Graciela.png"
import margaret from "../../assets/Junta_directiva/Margaret.png"
import margot from "../../assets/Junta_directiva/Margot.png"
import neohomar from "../../assets/Junta_directiva/Neohomar.png"
import pedro from "../../assets/Junta_directiva/Pedro.png"
import Romelina from "../../assets/Junta_directiva/Romelia.png"
import Yorjharry from "../../assets/Junta_directiva/Yorjharry.png"
import Rina from "../../assets/Junta_directiva/Rina.png"
import Zulay from "../../assets/Junta_directiva/Zulay.png"
import Pedro_C from "../../assets/Junta_directiva/Pedro_C.png"

// 1. EL HOOK DEBE ESTAR AQUÍ AFUERA
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
      { threshold: 0.1 } // Un poco menos de threshold para que active más fácil
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return setRef;
};

// Datos de la directiva
const directiva = [
  { nombre: "Francisco Piñango", cargo: "Presidente", foto: francisco, perfil: "Líder con amplia trayectoria en el sector inmobiliario, comprometido con la innovación y el fortalecimiento gremial en el estado Bolívar." },
  { nombre: "Zulay Amaya", cargo: "Vicepresidenta", foto: Zulay, perfil: "Especialista en gestión administrativa y relaciones corporativas, enfocada en la excelencia operativa de la cámara." },
  { nombre: "Margaret Vásquez", cargo: "Directora General", foto: margaret, perfil: "Coordinadora de proyectos estratégicos y enlace principal para el desarrollo de iniciativas institucionales." },
  { nombre: "Romelina Rodríguez", cargo: "Directora de Finanzas", foto: Romelina, perfil: "Responsable de la transparencia y solidez financiera, con amplia experiencia en contabilidad y auditoría." },
  { nombre: "Margot Castro", cargo: "Directora de Asuntos Legales", foto: margot, perfil: "Asesora jurídica experta en derecho inmobiliario, velando por el marco legal y ético de nuestra organización." },
  { nombre: "Pedro Vallenilla", cargo: "Director de Comunicaciones", foto: pedro, perfil: "Encargado de la proyección mediática y la identidad corporativa de la Cámara Inmobiliaria de Bolívar." },
  { nombre: "Graciela Ledezma", cargo: "Directora de Formación", foto: graciela, perfil: "Impulsora del crecimiento profesional de nuestros miembros a través de programas de capacitación de alto nivel." },
  { nombre: "Yorjharry Vicent", cargo: "Director de Eventos", foto: Yorjharry, perfil: "Organizador de encuentros clave y networking empresarial para el fortalecimiento del gremio inmobiliario." },
  { nombre: "Rina Centeno", cargo: "Directora de Labor Social", foto: Rina, perfil: "Líder de proyectos de impacto social, estrechando los lazos entre el sector inmobiliario y la comunidad." },
  { nombre: "Pedro Castro", cargo: "Director de Relaciones Interinstitucionales", foto: Pedro_C, perfil: "Facilitador de convenios y alianzas estratégicas con organismos públicos y privados." },
  { nombre: "Neohomar Longart", cargo: "Director de Atención al Gremiado", foto: neohomar, perfil: "Dedicado a escuchar y atender las necesidades de nuestros agremiados, garantizando su bienestar." },
];

const MemberModal = ({ miembro, onClose }) => {
  if (!miembro) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white w-full max-w-4xl overflow-hidden rounded-[3rem] shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        <button
          onClick={onClose}
          className="absolute top-2 left-5 lg:top-4 lg:left-5 z-10 p-3 bg-emerald-200 hover:bg-emerald-500 hover:text-white rounded-full transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Info Section (Left) */}
        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center text-center md:text-left">
          <div className="space-y-6 pt-4">
            <div>
              <p className="text-emerald-500 font-black uppercase tracking-[0.2em] text-xs mb-2">Miembro de Junta Directiva</p>
              <h2 className="text-4xl md:text-5xl font-black text-[#022c22] tracking-tight leading-tight">
                {miembro.nombre}
              </h2>
            </div>

            <div className="h-1 w-20 bg-emerald-500 mx-auto md:mx-0 rounded-full" />

            <div className="space-y-4 pt-4 md:pt-2">
              <p className="text-xl font-bold text-emerald-600 uppercase tracking-widest text-sm">
                {miembro.cargo}
              </p>
              <p className="text-slate-600 leading-relaxed text-lg max-w-md mx-auto md:mx-0">
                {miembro.perfil}
              </p>
            </div>

            <div className="pt-8">
              <button className="px-8 py-3 bg-[#022c22] text-white rounded-full font-bold text-sm tracking-widest hover:bg-emerald-600 transition-colors">
                Contactar Ahora
              </button>
            </div>
          </div>
        </div>

        {/* Photo Section (Right) */}
        <div className="w-full md:w-[45%] bg-slate-50 relative aspect-square md:aspect-auto h-[300px] md:h-auto">
          <img
            src={miembro.foto}
            alt={miembro.nombre}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent hidden md:block" />
        </div>
      </div>
    </div>
  );
};

const DirectorCard = ({ nombre, cargo, foto, index, onClick }) => {
  const setReveal = useScrollReveal();
  return (
    <div
      ref={setReveal}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onClick={onClick}
      className="reveal-on-scroll group bg-white rounded-[2.5rem] p-5 border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-700 cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-[2rem] aspect-square mb-6 bg-slate-100">
        <img
          src={foto}
          alt={nombre}
          className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-[#022c22] leading-tight group-hover:text-emerald-600 transition-colors">
          {nombre}
        </h3>
        <p className="text-emerald-500 font-black uppercase tracking-[0.15em] text-[10px] bg-emerald-50 py-1 px-3 rounded-full inline-block">
          {cargo}
        </p>
      </div>
    </div>
  );
};

export default function EquipoDirectivo() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);

  // Cerrar modal al presionar Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className={`min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30 scroll-smooth ${selectedMember ? 'overflow-hidden' : ''}`}>
      <Navbar2 />

      <MemberModal
        miembro={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      <header
        className="relative px-6 lg:px-20 py-16 lg:py-24 flex items-center justify-center min-h-[40vh] bg-cover animate-header-bg"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.85), rgba(2, 44, 34, 0.85)), url(${bgBolivar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center space-y-4">
          <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs animate-header-text" style={{ animationDelay: "0.2s", opacity: 0 }}>Liderazgo Gremial</p>
          <h1 style={{ animationDelay: "0.4s", opacity: 0 }} className="text-5xl lg:text-7xl font-black tracking-tighter animate-header-text">
            Junta <span className="text-emerald-500 italic">Directiva</span>
          </h1>
          <p className="text-emerald-100/60 text-sm tracking-widest uppercase font-medium animate-header-text" style={{ animationDelay: "0.5s", opacity: 0 }} >Gestión 2025 - 2027</p>
        </div>
      </header>

      <main className="bg-white text-slate-900 rounded-t-[4rem] -mt-12 relative z-10 px-6 lg:px-20 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {directiva.map((miembro, index) => (
              <DirectorCard
                key={index}
                index={index} // PASAMOS EL INDEX PARA EL DELAY
                nombre={miembro.nombre}
                cargo={miembro.cargo}
                foto={miembro.foto}
                onClick={() => setSelectedMember(miembro)}
              />
            ))}
          </div>

          <div className="mt-24 p-12 rounded-[3rem] bg-[#022c22] text-white text-center space-y-6 shadow-2xl shadow-emerald-900/20">
            <h2 className="text-3xl font-black tracking-tight">¿Deseas contactar con alguna dirección?</h2>
            <button className="px-10 py-4 bg-emerald-500 text-[#022c22] rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all">
              Enviar un mensaje
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-[#011a14] px-6 lg:px-20 py-12 text-center border-t border-white/5">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
          © 2026 Cámara Inmobiliaria del Estado Bolívar • RIF J-30462520-0
        </p>
      </footer>
    </div>
  );
}
