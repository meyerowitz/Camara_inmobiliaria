import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// --- IMPORTACIONES DE IMÁGENES (Asegúrate de tener estas rutas correctas) ---
import bgPreani from "../../assets/Preani_header.png"; // La imagen con la escultura amarilla de la UCAB
import logoPreani from "../../assets/Preani.jpg"; // El logo de PREANI (con el símbolo verde de la casa)
import Navbar2 from "../../Components/Navbar_sc";
import Estudiosa from "../../assets/estudiosa1.png"; // Importación de la imagen de la chica estudiosa
import Estudioso from "../../assets/estudioso1.png";
// Hook de revelado para animaciones al hacer scroll (Mantenemos tu lógica original)
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

// Componente para los módulos académicos (Reutilizamos la estructura de MóduloPadi pero para PREANI)
const ModuloPreani = ({ numero, titulo, descripcion, index }) => {
  const setReveal = useScrollReveal();
  const isEven = index % 2 === 0;

  return (
    <div
      ref={setReveal}
      className="reveal-on-scroll relative mb-16 md:mb-20 flex flex-col md:flex-row items-center"
    >
      {/* Indicador de Módulo */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex w-12 h-12 rounded-xl bg-emerald-500 items-center justify-center z-20 shadow-lg border-2 border-white text-white font-black">
        {numero}
      </div>

      {/* Contenido Dinámico */}
      <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-20 md:text-right' : 'md:pl-20 md:order-last text-left'}`}>
        <h3 className="text-2xl font-black text-[#022c22] mb-3 uppercase tracking-tight">
          {titulo}
        </h3>
        <p className="text-slate-600 leading-relaxed text-lg italic">
          {descripcion}
        </p>
      </div>

      <div className="hidden md:block md:w-1/2" />
    </div>
  );
};

export default function Preani() {
  const navigate = useNavigate();
  // Hook de revelado para la imagen de la chica estudiosa
  const setRevealEstudiosa = useScrollReveal();
  const setRevealEstudioso = useScrollReveal();

  // --- DATOS ACTUALIZADOS DE LOS MÓDULOS DE PREANI (Basado en la imagen 4) ---
  const modulos = [
    {
      numero: "01",
      titulo: "Formación Fundamental",
      descripcion: "Bases sólidas para entender el entorno y la dinámica del negocio inmobiliario moderno."
    },
    {
      numero: "02",
      titulo: "Herramientas de Cálculo",
      descripcion: "Aplicación de matemáticas financieras y análisis cuantitativo para la toma de decisiones."
    },
    {
      numero: "03",
      titulo: "Marco Legal Inmobiliario",
      descripcion: "Análisis profundo de la legislación venezolana aplicada a la propiedad y transacciones."
    },
    {
      numero: "04",
      titulo: "Ventas y Comercialización",
      descripcion: "Estrategias avanzadas de marketing y técnicas de negociación efectivas en el sector."
    },
    {
      numero: "05",
      titulo: "Gestión Empresarial",
      descripcion: "Administración eficiente, liderazgo y planificación estratégica para empresas inmobiliarias."
    },
    {
      numero: "06",
      titulo: "Certificación",
      descripcion: "Proceso final de evaluación y acreditación como Profesional Inmobiliario certificado."
    }
  ];

  return (
    <div className="min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30 scroll-smooth">
      <Navbar2 />

      {/* --- HEADER CON IMÁGEN DE LA UCAB (Imagen 3) --- */}
      <header
        className="relative px-6 lg:px-20 py-20 lg:py-32 flex items-center justify-center min-h-[55vh] bg-cover animate-header-bg"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.8), rgba(2, 44, 34, 0.9)), url(${bgPreani})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="text-center space-y-6 max-w-4xl">
          <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs animate-header-text" style={{ animationDelay: "0.2s", opacity: 0 }}>
            Especialización Profesional
          </p>
          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter animate-header-text" style={{ animationDelay: "0.4s", opacity: 0 }}>
            PROGRAMA <span className="text-emerald-500 italic">PREANI</span>
          </h1>
          <p className="text-emerald-100/60 text-lg md:text-xl font-light max-w-2xl mx-auto animate-header-text" style={{ animationDelay: "0.6s", opacity: 0 }}>
            Programa de Estudios Avanzados en Negocios Inmobiliarios.
          </p>
        </div>
      </header>

      {/* --- CUERPO PRINCIPAL --- */}
      <main className="bg-white text-slate-900 rounded-t-[4rem] -mt-12 relative z-10 px-6 lg:px-20 py-24">
        <div className="max-w-6xl mx-auto">

          {/* SECCIÓN INTRODUCTORIA (Basada en la imagen 4) */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-20 bg-slate-50 p-8 lg:p-16 rounded-[3rem] border border-emerald-50 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl" />

            <div className="w-full lg:w-1/3 flex justify-center relative z-10">
              {/* Logo de PREANI (Imagen 4) */}
              <img src={logoPreani} alt="Logo PREANI" className="w-64 h-auto drop-shadow-2xl" />
            </div>
            <div className="w-full lg:w-2/3 space-y-6 relative z-10">
              <h2 className="text-3xl font-black text-[#022c22] uppercase tracking-tight">Sobre el Programa</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                El PREANI programa de estudios avanzados en negocios inmobiliarios, es la evolución del programa de formación integral del profesional inmobiliario FIPI, con más de 25 años de trayectoria. Este programa consta de X materias distribuidas en X módulos, diseñadas para brindarte
                una comprensión profunda y herramientas clave del sector inmobiliario.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> X Trimestres
                </span>
                <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Aval Digase X universidad
                </span>
                <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> X Materias
                </span>
              </div>
            </div>
          </div>

          {/* --- NUEVA SECCIÓN: REQUISITOS Y PLANILLAS (Adaptada de las imágenes 5 y 6) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 items-stretch">
            {/* Columna Izquierda: Imagen y CTA General (Estilo PADI original) */}
            <div className="relative rounded-[3rem] overflow-hidden group">

              <div className="absolute inset-0 bg-[#022c22]/90 flex flex-col justify-end p-12 text-white">
                <p className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-3">Certifícate</p>
                <h3 className="text-4xl font-black tracking-tight mb-6">Lidera el Mercado Inmobiliario</h3>
                <p className="text-emerald-100/80 leading-relaxed mb-8">
                  Obtén el aval y certifícate como Profesional Inmobiliario. El PREANI te ofrece conocimientos de vanguardia y
                  herramientas prácticas destinadas a una mayor y mejor comprensión de los distintos escenarios del sector.
                </p>
                <div className="flex gap-4 self-start">
                  <button
                    onClick={() => window.open('/ruta-al-pensum-preani.pdf', '_blank')}
                    className="inline-block px-10 py-4 bg-emerald-500 text-[#022c22] rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-xl"
                  >
                    Descarga Pensum
                  </button>
                  <button
                    onClick={() => navigate('/contacto')}
                    className="inline-block px-10 py-4 border border-emerald-500 text-emerald-400 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all"
                  >
                    Solicitar Info
                  </button>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Descarga de Planillas (Adaptada de la imagen 6) */}
            <div className="relative rounded-[3rem] overflow-hidden flex items-end">
              {/* Usamos una imagen que sugiera documentos/oficina */}
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
                alt="Formularios de Inscripción PREANI"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="relative z-10 w-full p-12 bg-white/95 backdrop-blur-sm m-6 rounded-2xl shadow-2xl space-y-8">
                <h3 className="text-3xl font-black text-[#022c22] tracking-tight border-b border-emerald-100 pb-4">Inscripciones Abiertas</h3>
                <p className="text-slate-600">Por favor, descargue y complete las siguientes planillas de inscripción. Una vez listas, envíelas digitalizadas por correo electrónico.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <a href="/Formato_Ingreso.pdf" download className="block px-6 py-4 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-center text-sm hover:bg-emerald-200 transition-colors shadow-inner">Formato de Ingreso (PDF)</a>
                  <a href="/Inscrip_Diplomado.pdf" download className="block px-6 py-4 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-center text-sm hover:bg-emerald-200 transition-colors shadow-inner">Inscrip. Diplomado (PDF)</a>
                  <a href="/Inscripcion_UCAB.pdf" download className="block px-6 py-4 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-center text-sm hover:bg-emerald-200 transition-colors shadow-inner md:col-span-2">Inscripción (PDF)</a>
                </div>
                <p className="text-sm text-slate-500 italic">Próxima Edición: Consulte disponibilidad.</p>
              </div>
            </div>
          </div>

          {/* --- LÍNEA DE TIEMPO DE CONTENIDO ACADÉMICO --- */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-[#022c22] uppercase tracking-tight">Estructura Curricular</h2>
            <div className="w-20 h-1 bg-emerald-500 mx-auto mt-4" />
          </div>

          <div className="relative">
            {/* Línea vertical decorativa */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

            {modulos.map((mod, index) => (
              <ModuloPreani
                key={index}
                index={index}
                numero={mod.numero}
                titulo={mod.titulo}
                descripcion={mod.descripcion}
              />
            ))}
          </div>

          {/* --- SECCIÓN DE CONTACTO CON LA CHICA COMO MARCA DE AGUA (Corregido) --- */}
          <div className="relative mt-16 group">

            {/* 1. La Chica: Ahora está vinculada a este contenedor específico */}
            <div
              ref={setRevealEstudiosa}
              className="reveal-on-scroll absolute -bottom-50 -left-150 z-10 pointer-events-none hidden lg:block transition-all duration-1000 opacity-0 [&.active]:opacity-20"
            >
              <img
                src={Estudiosa}
                alt="Fondo Estudiosa PREANI"
                className="h-[800px] w-auto max-w-none transform"
              />
            </div>
            <div
              ref={setRevealEstudioso}
              className="reveal-on-scroll absolute -bottom-40 left-270 z-10 pointer-events-none hidden lg:block transition-all duration-1000 opacity-0 [&.active]:opacity-20"
            >
              <img
                src={Estudioso}
                alt="Fondo Estudiosa PREANI"
                className="h-[650px] w-auto max-w-none transform"
              />
            </div>

            {/* 2. Tarjeta de Contacto: Con z-10 para estar por encima y un fondo con ligero blur */}
            <div className="relative z-10 p-12 rounded-[4rem] bg-[#022c22]/95 backdrop-blur-sm text-white text-center space-y-8 overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">
                  ¿Quieres certificarte como Profesional?
                </h3>
                <p className="text-emerald-200/70 mb-8 max-w-xl mx-auto">
                  Inicia tu proceso de preinscripción para la próxima cohorte del PREANI. Fórmate con los mejores especialistas del sector.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/contacto')}
                    className="px-10 py-4 bg-emerald-500 text-[#022c22] rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-xl"
                  >
                    Deseo más información
                  </button>
                  <a
                    href="https://wa.me/584241554321"
                    className="px-10 py-4 border border-emerald-500/50 text-emerald-400 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all"
                  >
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#011a14] px-6 lg:px-20 py-12 pt-16 text-center border-t border-white/5 relative z-10">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
          PREANI • Coordinación de Formación • Cámara Inmobiliaria
        </p>
      </footer>
    </div>
  );
}
