import React, { useState } from 'react';
import logo from './assets/Logo.png';
import heroImg from './assets/empresaria.png';
import featureImg from './assets/empresaria_3.png';
import LoginModal from './Components/LoginModal';
import RegisterModal from './Components/RegisterModal';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [isModalSesionOpen, setIsSesionModalOpen] = useState(false); 
  const [isModalRegisterOpen, setIsRegisterModalOpen] = useState(false);
    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30 scroll-smooth">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-5 lg:px-20 bg-[#011a14]/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo Cámara" className="h-12 w-auto object-contain" />
          <div className="hidden sm:block leading-tight">
            <p className="font-bold text-sm tracking-widest uppercase">Cámara Inmobiliaria</p>
            <p className="text-emerald-400 text-xs font-medium">Estado Bolívar</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-wider">
          <a href="#inicio" className="hover:text-emerald-400 transition">Inicio</a>
          <a href="#nosotros" className="hover:text-emerald-400 transition">Nosotros</a>
          <a href="#afiliados" className="hover:text-emerald-400 transition">Afiliados</a>
          <a href="#noticias" className="hover:text-emerald-400 transition">Noticias</a>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setIsSesionModalOpen(true)} className="px-6 py-2.5 bg-transparent border border-emerald-500 text-emerald-400 rounded-full text-sm font-bold hover:bg-emerald-500 hover:text-[#022c22] transition-all">
            Login
          </button>
          <button onClick={() => setIsRegisterModalOpen(true)} className="px-6 py-2.5 bg-emerald-500 text-[#022c22] rounded-full text-sm font-bold hover:bg-white transition-all">
            Registro
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header id="inicio" className=" scroll-mt-24 px-6 lg:px-20 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-block px-4 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest">
            Gremio Profesional
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1]">
            Unidos por el <span className="text-emerald-400 italic">progreso</span> inmobiliario de Bolívar
          </h1>
          <p className="text-gray-300 text-lg max-w-md leading-relaxed">
            Representamos y fortalecemos a los profesionales del sector en el estado, impulsando la ética y el desarrollo sostenible.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button onClick={() => navigate('/cursos')} className="px-8 py-4 bg-white text-[#022c22] rounded-2xl font-bold hover:bg-emerald-400 transition-all">
              Talleres
            </button>
            <button onClick={() => setIsSesionModalOpen(true)} className="px-8 py-4 border border-white/20 rounded-2xl font-bold hover:bg-white/10 transition">
              Dashboard
            </button>
          </div>
        </div>
        
      </header>

      {/* --- SECCIÓN NOSOTROS --- */}
      <section id="nosotros" className=" scroll-mt-24 bg-white text-slate-900 rounded-t-[4rem] px-6 lg:px-20 py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#022c22]">Sobre la Cámara</h2>
          <p className="text-lg text-slate-600 leading-relaxed italic">
            "Nuestra misión es ser el pilar fundamental que sostiene el mercado inmobiliario en Bolívar, brindando transparencia, legalidad y constante crecimiento a nuestros miembros."
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-emerald-50 rounded-3xl">
              <h3 className="font-bold text-emerald-800 mb-2">Visión</h3>
              <p className="text-sm">Ser referentes en la digitalización y modernización del gremio inmobiliario.</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl">
              <h3 className="font-bold text-emerald-800 mb-2">Misión</h3>
              <p className="text-sm">Promover la ética y la profesionalización técnica en todo el estado.</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl">
              <h3 className="font-bold text-emerald-800 mb-2">Valores</h3>
              <p className="text-sm">Integridad, transparencia, compromiso y desarrollo regional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN AFILIADOS --- */}
      <section id="afiliados" className=" scroll-mt-24 bg-slate-50 text-slate-900 px-6 lg:px-20 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100 text-center">
                   <div className="text-emerald-600 font-bold text-3xl mb-2">150+</div>
                   <p className="text-sm text-slate-500 font-medium uppercase tracking-tighter">Afiliados Activos</p>
                </div>
                <img src={featureImg} alt="Gestión" className="rounded-[2rem] h-64 w-full object-cover shadow-lg" />
             </div>
             <div className="pt-12 space-y-4">
                <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-900/20">
                   <p className="font-bold text-xl leading-snug">Respaldo Gremial de Alto Nivel</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100 text-center">
                   <div className="text-emerald-600 font-bold text-3xl mb-2">30+</div>
                   <p className="text-sm text-slate-500 font-medium uppercase">Años de Historia</p>
                </div>
             </div>
          </div>

          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#022c22]">
              ¿Por qué afiliarse?
            </h2>
            <p className="text-slate-600 text-lg">
              Al formar parte de la Cámara, accedes a una red nacional de contactos, asesoría legal de primera y programas de formación exclusivos.
            </p>
            <ul className="space-y-4 pt-4">
              {['Certificación Profesional', 'Respaldo Gremial Nacional', 'Asesoría Legal Especializada', 'Networking Estratégico'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-slate-700">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN NOTICIAS --- */}
      <section id="noticias" className="bg-white text-slate-900 px-6 lg:px-20 py-20 rounded-b-[4rem] scroll-mt-24">
  <div className="flex justify-between items-end mb-12">
    <div>
      <h2 className="text-4xl lg:text-5xl font-bold text-[#022c22] tracking-tighter">Actualidad y Noticias</h2>
      <p className="text-slate-500 mt-2 font-medium">Mantente informado sobre el mercado inmobiliario.</p>
    </div>
    <button className="text-emerald-600 font-bold hover:text-emerald-800 transition-colors flex items-center gap-2">
      Ver todas <span className="text-xl">→</span>
    </button>
  </div>
  
  <div className="grid md:grid-cols-3 gap-10">
    {[
      { 
        t: "Nuevas tasas de registro 2026", 
        d: "Bolívar actualiza aranceles para transacciones de bienes raíces este trimestre.",
        img: "https://www.24horas.cl/24horas/site/artic/20260209/imag/foto_0000000320260209041236/MOCHILA_NOCTURNA_4.1_frame_159829.jpeg",
        tag: "Legal"
      },
      { 
        t: "Crecimiento en Puerto Ordaz", 
        d: "La zona industrial y comercial muestra signos de recuperación tras nuevas inversiones.",
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        tag: "Mercado"
      },
      { 
        t: "Taller de Ventas Digitales", 
        d: "Éxito total en el último evento presencial realizado en el Hotel Eurobuilding.",
        img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
        tag: "Eventos"
      }
    ].map((news, i) => (
      <div key={i} className="group cursor-pointer">
        <div className="relative aspect-[16/10] mb-6 overflow-hidden rounded-[2.5rem] shadow-xl shadow-emerald-900/5">
          {/* Overlay de color al hacer hover */}
          <div className="absolute inset-0 bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
          
          <img 
            src={news.img} 
            alt={news.t}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
          />
          
          {/* Badge sobre la imagen */}
          <span className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
            {news.tag}
          </span>
        </div>

        <div className="space-y-3 px-2">
          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">Bolívar • Feb 2026</p>
          <h4 className="text-2xl font-bold leading-tight text-[#022c22] group-hover:text-emerald-600 transition-colors">
            {news.t}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
            {news.d}
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-500 transition-colors italic">Leer más...</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* --- FOOTER INFORMATIVO --- */}
      <footer className="bg-[#011a14] px-6 lg:px-20 py-16 text-center border-t border-white/5 space-y-6">
        <img src={logo} alt="Logo" className="h-10 mx-auto opacity-50" />
        <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
          Cámara Inmobiliaria del Estado Bolívar. Afiliada a la CIV. <br/>
          Piso 1, Centro Comercial Ciudad Alta Vista II, Puerto Ordaz.
        </p>
        <div className="flex justify-center gap-6 text-gray-400 text-xs">
          <a href="#" className="hover:text-emerald-400">Instagram</a>
          <a href="#" className="hover:text-emerald-400">Facebook</a>
          <a href="#" className="hover:text-emerald-400">LinkedIn</a>
        </div>
        <p className="text-gray-600 text-[10px] pt-4">
          © 2026 Cámara Inmobiliaria del Estado Bolívar.
        </p>
      </footer>

      {/* MODALES */}
      {isModalSesionOpen && <LoginModal onClose={() => setIsSesionModalOpen(false)} />}
      {isModalRegisterOpen && <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />}
    </div>
  );
}