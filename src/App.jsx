import React, { useState } from 'react';
import logo from './assets/Logo.png';
import heroImg from './assets/empresaria.png';
import featureImg from './assets/empresaria_3.png';

export default function LandingBolivar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 py-5 lg:px-20 bg-white/5 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo Cámara" className="h-12 w-auto object-contain" />
          <div className="hidden sm:block leading-tight">
            <p className="font-bold text-sm tracking-widest uppercase">Cámara Inmobiliaria</p>
            <p className="text-emerald-400 text-xs font-medium">Estado Bolívar</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-wider">
          <a href="#" className="hover:text-emerald-400 transition">Inicio</a>
          <a href="#" className="hover:text-emerald-400 transition">Nosotros</a>
          <a href="#" className="hover:text-emerald-400 transition">Afiliados</a>
          <a href="#" className="hover:text-emerald-400 transition">Noticias</a>
        </div>
        <a href="#" className="hover:text-emerald-400 transition">Iniciar sesion</a>
        <button className="px-6 py-2.5 bg-emerald-500 text-[#022c22] rounded-full text-sm font-bold hover:bg-white transition-all shadow-lg shadow-emerald-500/20">
         Registrate Aquí
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="px-6 lg:px-20 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
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
            <button className="px-8 py-4 bg-white text-[#022c22] rounded-2xl font-bold hover:bg-emerald-400 transition-transform hover:-translate-y-1">
              Taller
            </button>
            <button className="px-8 py-4 border border-white/20 rounded-2xl font-bold hover:bg-white/10 transition">
              Dashboard
            </button>
          </div>
        </div>

      
      </header>

      {/* --- SECCIÓN DE VALORES (Cuerpo Blanco) --- */}
      <section className="bg-slate-50 text-slate-900 rounded-t-[4rem] px-6 lg:px-20 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100">
                   <div className="text-emerald-600 font-bold text-3xl mb-2">150+</div>
                   <p className="text-sm text-slate-500 font-medium uppercase">Afiliados Activos</p>
                </div>
                <img src={featureImg} alt="Gestión" className="rounded-[2rem] h-64 w-full object-cover" />
             </div>
             <div className="pt-12 space-y-4">
                <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-900/20">
                   <p className="font-bold text-xl leading-snug">Formación Profesional Continua</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100">
                   <div className="text-emerald-600 font-bold text-3xl mb-2">30+</div>
                   <p className="text-sm text-slate-500 font-medium uppercase">Años de Trayectoria</p>
                </div>
             </div>
          </div>

          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Fortaleciendo la <span className="text-emerald-600">Ética Profesional</span>
            </h2>
            <p className="text-slate-600 text-lg">
              Nuestra misión es agrupar a los prestadores de servicios inmobiliarios para garantizar seguridad jurídica y excelencia en cada transacción en nuestro estado.
            </p>
            <ul className="space-y-4 pt-4">
              {['Certificación Profesional', 'Respaldo Gremial Nacional', 'Asesoría Legal Especializada'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-slate-700">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- FOOTER INFORMATIVO --- */}
      <footer className="bg-[#011a14] px-6 lg:px-20 py-12 text-center border-t border-white/5">
        <p className="text-gray-500 text-sm">
          © 2026 Cámara Inmobiliaria del Estado Bolívar. Miembro de la Cámara Inmobiliaria de Venezuela.
        </p>
      </footer>
    </div>
  );
}

