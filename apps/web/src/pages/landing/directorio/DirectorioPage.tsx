import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { AfiliadoCard, AfiliadoData } from './components/AfiliadoCard';
import Navbar from '@/pages/landing/components/Navbar';
import { Link } from 'react-router-dom';
import { API_URL } from '@/config/env';

const DirectorioPage = () => {
  const [afiliados, setAfiliados] = useState<AfiliadoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Fetch inicial de todos los afiliados CIBIR públicos
  useEffect(() => {
    const fetchAfiliados = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/afiliados/buscar`);
        const json = await res.json();
        if (json.success) {
          setAfiliados(json.data);
        }
      } catch (error) {
        console.error('Error cargando el directorio:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAfiliados();
  }, []);

  // Instancia de Fuse.js memoizada para evitar recrearla en cada render
  const fuse = useMemo(() => new Fuse(afiliados, {
    keys: ['nombre_completo', 'codigo_cibir', 'cedula_rif'],
    threshold: 0.3,     // Tolerancia a errores de tipeo (0 = exacto, 1 = todo coincide)
    ignoreLocation: true, // Busca en cualquier parte de la palabra
    minMatchCharLength: 2
  }), [afiliados]);

  // Ejecutamos la búsqueda difusa localmente
  const resultados = useMemo(() => {
    if (!searchQuery.trim()) {
      return afiliados; // Si no hay busqueda, retornamos todos
    }
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, afiliados, fuse]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${darkMode ? 'dark bg-[#022c22] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setIsSesionModalOpen={setIsLoginOpen} 
        setIsRegisterModalOpen={setIsRegisterOpen} 
      />
      
      <main className="flex-grow pt-24 pb-20">
        
        {/* Header Section */}
        <section className="bg-[var(--color-primary)] text-white py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-widest mb-2">
              <ShieldCheck size={16} /> Profesionales Certificados
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Directorio Público CIBIR
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
              Encuentra a los Corredores Inmobiliarios certificados y autorizados de forma rápida. Escribe su nombre, código o identificación.
            </p>

            {/* Buscador */}
            <div className="mt-8 relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-[var(--color-accent)] transition-colors" size={24} />
              </div>
              <input
                type="text"
                placeholder="Busca por nombre, apellido, CIBIR o Cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-4 py-5 rounded-2xl bg-white dark:bg-[#04432f] shadow-xl text-slate-800 dark:text-emerald-50 font-bold placeholder-slate-400 dark:placeholder-emerald-200/50 outline-none border-4 border-transparent focus:border-[var(--color-accent-muted)] dark:focus:border-emerald-500/50 transition-all text-lg"
              />
              <div className="absolute inset-y-0 right-4 flex items-center">
                <span className="text-xs font-bold text-slate-300 dark:text-emerald-200 bg-slate-100 dark:bg-[#022c22] px-2 py-1 rounded-md border border-slate-200 dark:border-emerald-500/20">
                  {resultados.length} resultados
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <Loader2 size={48} className="animate-spin text-[var(--color-primary)] mb-4" />
               <p className="font-bold text-lg text-slate-500">Cargando directorio seguro...</p>
             </div>
          ) : resultados.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {resultados.map((afiliado) => (
                 <AfiliadoCard key={afiliado.id_agremiado} afiliado={afiliado} />
               ))}
             </div>
          ) : (
             <div className="text-center py-20 bg-white dark:bg-[#04432f] rounded-3xl border border-slate-100 dark:border-emerald-500/20 shadow-sm max-w-2xl mx-auto transition-colors">
               <div className="w-20 h-20 bg-slate-50 dark:bg-[#022c22] rounded-full flex items-center justify-center mx-auto mb-4 border dark:border-emerald-500/10">
                 <Users size={32} className="text-slate-400 dark:text-emerald-400" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-emerald-50 mb-2">No se encontraron resultados</h3>
               <p className="text-slate-500 dark:text-emerald-100/70 font-medium max-w-md mx-auto">
                 No pudimos encontrar ningún profesional que coincida con "<strong>{searchQuery}</strong>". Intenta buscar con otros términos.
               </p>
             </div>
          )}

        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="px-6 lg:px-20 py-14 text-center border-t space-y-4"
        style={{ backgroundColor: darkMode ? 'var(--color-primary)' : 'var(--color-primary-light)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Cámara Inmobiliaria del Estado Bolívar (CIBIR) — Afiliada a la CIV
        </p>
        <div className="flex justify-center gap-6 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <Link to="/" className="hover:opacity-80 transition-opacity">Inicio</Link>
          <Link to="/cibir" className="hover:opacity-80 transition-opacity">Afiliación</Link>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 CIBIR Bolívar. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default DirectorioPage;
