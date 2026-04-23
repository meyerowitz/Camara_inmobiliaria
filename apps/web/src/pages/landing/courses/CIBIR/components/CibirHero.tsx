import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import bgBolivar from '@/assets/Camara_Metropolitana.jpg';

const CibirHero = () => (
  <section className="relative min-h-[60vh] flex items-center justify-center text-white overflow-hidden bg-[#022c22]">
    {/* Background image with overlay */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgBolivar})`,
        filter: 'grayscale(20%)',
      }}
    />
    <div
      className="absolute inset-0 bg-gradient-to-br from-[#022c22] via-[#022c22] to-emerald-900/40"
    />

    {/* Content */}
    <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-20 py-28 text-left">
      <p
        className="font-black uppercase tracking-[0.3em] text-xs mb-5 animate-header-text text-emerald-500"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        Afiliación Profesional
      </p>
      <h1
        className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-6 animate-header-text"
        style={{ animationDelay: '0.4s', opacity: 0 }}
      >
        Únete a la Cámara<br />
        <span className="italic text-emerald-500">Inmobiliaria CIBIR</span>
      </h1>
      <p
        className="text-lg font-medium leading-relaxed max-w-2xl mb-10 animate-header-text text-white/75"
        style={{ animationDelay: '0.6s', opacity: 0 }}
      >
        Liderando el desarrollo inmobiliario sustentable y fomentando la profesionalización del sector para construir un gremio más fuerte y ético.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 animate-header-text" style={{ animationDelay: '0.8s', opacity: 0 }}>
        <a
          href="#formulario"
          className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all hover:-translate-y-0.5 shadow-2xl bg-emerald-500 text-[#022c22] hover:bg-emerald-400 shadow-emerald-500/30"
        >
          Iniciar Preinscripción <ArrowRight size={16} />
        </a>
        <a
          href="#beneficios"
          className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all border border-white/20 hover:bg-white/10 text-white/85"
        >
          Ver Beneficios
        </a>
      </div>
    </div>
  </section>
);

export default CibirHero;
