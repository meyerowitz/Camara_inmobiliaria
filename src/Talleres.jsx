import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cursos = [
  {
    id: 1,
    titulo: "Diplomado en Derecho Inmobiliario",
    instructor: "Abog. Luis Martínez",
    precio: "45.00",
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
    nivel: "Avanzado"
  },
  {
    id: 2,
    titulo: "Marketing Digital para Real Estate",
    instructor: "Lic. Elena Pérez",
    precio: "29.99",
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    nivel: "Principiante"
  },
  {
    id: 3,
    titulo: "Tasación de Inmuebles Urbanos",
    instructor: "Ing. Carlos Ruiz",
    precio: "35.00",
    rating: 4.7,
    img: "https://www.cosasdevalor.com/images/categorias_valuatorias/inmuebles-urbanos.jpg",
    nivel: "Intermedio"
  },
  {
    id: 4,
    titulo: "Neuroventas para Corredores",
    instructor: "Coach Mario Vargas",
    precio: "19.99",
    rating: 5.0,
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    nivel: "Intermedio"
  }
];

export default function Cursos() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <section 
      id="cursos" 
      className={`min-h-screen transition-colors duration-500 px-6 lg:px-20 py-24 scroll-mt-24 ${
        darkMode ? 'bg-[#011a14] text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* --- BARRA DE CONTROL SUPERIOR --- */}
      <div className="fixed top-6 left-0 w-full px-6 lg:px-20 flex justify-between items-center z-[60] pointer-events-none">
        {/* Botón Volver */}
        <button 
          onClick={() => navigate('/')}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-[#022c22] rounded-full font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          VOLVER
        </button>

        {/* Botón Modo Oscuro/Claro */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`pointer-events-auto p-3 rounded-2xl shadow-xl transition-all hover:rotate-12 ${
            darkMode ? 'bg-yellow-400 text-black' : 'bg-[#022c22] text-white'
          }`}
        >
          {darkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>
      </div>

      {/* Encabezado */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 pt-10">
        <h2 className={`text-4xl lg:text-6xl font-black tracking-tighter transition-colors ${darkMode ? 'text-white' : 'text-[#022c22]'}`}>
          Centro de <span className="text-emerald-500 italic">Formación</span>
        </h2>
        <p className={`text-lg transition-colors ${darkMode ? 'text-emerald-100/60' : 'text-slate-500'}`}>
          Potencia tus habilidades con nuestros programas certificados por la Cámara Inmobiliaria.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 pt-6">
          {['Legal', 'Ventas', 'Tasación', 'Marketing', 'Finanzas'].map((cat) => (
            <button key={cat} className={`px-6 py-2 rounded-full border font-bold text-sm transition-all hover:bg-emerald-500 hover:text-white ${
              darkMode ? 'border-white/10 text-white bg-white/5' : 'border-slate-200 text-slate-900 bg-transparent'
            }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cursos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cursos.map((curso) => (
          <div key={curso.id} className={`group rounded-[2.5rem] overflow-hidden border transition-all duration-500 hover:-translate-y-2 ${
            darkMode ? 'bg-[#022c22] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
          }`}>
            <div className="relative h-48 overflow-hidden">
              <img src={curso.img} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-emerald-700">
                {curso.nivel}
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{curso.rating}</span>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
              
              <h3 className={`font-bold text-lg leading-tight transition-colors group-hover:text-emerald-400 ${darkMode ? 'text-white' : 'text-[#022c22]'}`}>
                {curso.titulo}
              </h3>
              
              <p className="text-slate-400 text-xs font-medium italic">Por {curso.instructor}</p>
              
              <hr className={darkMode ? 'border-white/5' : 'border-slate-100'} />
              
              <div className="flex items-center justify-between pt-2">
                <span className={`text-2xl font-black ${darkMode ? 'text-emerald-400' : 'text-[#022c22]'}`}>${curso.precio}</span>
                <button className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}