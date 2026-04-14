import React, { useState } from 'react';
import { Shield, GraduationCap, BarChart3, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/pages/landing/components/Navbar';
import LoginModal from '@/pages/landing/components/LoginModal';
import RegisterModal from '@/pages/landing/components/RegisterModal';
import CibirHero from '@/pages/landing/courses/CIBIR/components/CibirHero';
import BeneficioCard from '@/pages/landing/courses/CIBIR/components/BeneficioCard';
import PreinscripcionForm from '@/pages/landing/courses/CIBIR/components/PreinscripcionForm';


// ─── Data ─────────────────────────────────────────────────────────────────────

const BENEFICIOS = [
  {
    icon: Shield,
    title: 'Representación Gremial',
    desc: 'Defensa activa de los intereses de nuestros afiliados y respaldo institucional ante entes públicos y privados.',
  },
  {
    icon: GraduationCap,
    title: 'Formación Continua',
    desc: 'Acceso prioritario al programa PREANI (avalado por la UCAB) y talleres técnicos especializados.',
  },
  {
    icon: BarChart3,
    title: 'Información y Estadísticas',
    desc: 'Reciba boletines económicos exclusivos y reportes actualizados sobre el comportamiento del mercado inmobiliario regional.',
  },
  {
    icon: Handshake,
    title: 'Alianzas y Beneficios',
    desc: 'Forme parte de una red de contactos de alto nivel y acceda a convenios comerciales exclusivos para el gremio.',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

const CibirPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30" style={{ color: 'var(--color-text-base)' }}>

      {/* ── Shared Landing Navbar ─────────────────────────────── */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setIsSesionModalOpen={setLoginOpen}
        setIsRegisterModalOpen={setRegisterOpen}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <CibirHero />

      {/* ── Beneficios ───────────────────────────────────────── */}
      <section id="beneficios" className="py-24 px-6 lg:px-20" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p
              className="text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-accent-hover)' }}
            >
              Valor Gremial
            </p>
            <h2
              className="text-4xl lg:text-5xl font-black tracking-tight"
              style={{ color: 'var(--color-primary)' }}
            >
              ¿Por qué afiliarse a CIBIR?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFICIOS.map((b, i) => (
              <BeneficioCard key={i} icon={b.icon} title={b.title} desc={b.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Quote ────────────────────────────────────────── */}
      <section
        className="py-20 px-6 lg:px-20 text-white text-center relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, var(--color-accent) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <p className="text-3xl font-black italic leading-tight">
            "Ser parte de la Cámara Inmobiliaria es sinónimo de{' '}
            <span style={{ color: 'var(--color-accent)' }}>seguridad jurídica</span> y transparencia."
          </p>
          <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Cámara Inmobiliaria del Estado Bolívar</p>
        </div>
      </section>

      {/* ── Formulario de Preinscripción ─────────────────────── */}
      <section id="formulario" className="py-24 px-6 lg:px-20" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p
              className="text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-accent-hover)' }}
            >
              Comienza Aquí
            </p>
            <h2
              className="text-3xl lg:text-4xl font-black tracking-tight"
              style={{ color: 'var(--color-primary)' }}
            >
              Inicia tu proceso de preinscripción
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Complete los campos para que un representante del gremio lo contacte e inicie su trámite.
            </p>
          </div>
          <div
            className="rounded-[2.5rem] p-8 md:p-14 border"
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <PreinscripcionForm />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="px-6 lg:px-20 py-14 text-center border-t space-y-4"
        style={{ backgroundColor: 'var(--color-primary)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Cámara Inmobiliaria del Estado Bolívar (CIBIR) — Afiliada a la CIV
        </p>
        <div className="flex justify-center gap-6 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <Link to="/" className="hover:opacity-80 transition-opacity">Inicio</Link>
          <a href="#beneficios" className="hover:opacity-80 transition-opacity">Beneficios</a>
          <a href="#formulario" className="hover:opacity-80 transition-opacity">Afiliación</a>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 CIBIR Bolívar. Todos los derechos reservados.
        </p>
      </footer>

      {/* ── Modales ──────────────────────────────────────────── */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} />}
    </div>
  );
};

export default CibirPage;
