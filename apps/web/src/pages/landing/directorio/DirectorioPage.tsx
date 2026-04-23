import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, Users, Loader2 } from 'lucide-react';
import { AfiliadoCard, AfiliadoData } from './components/AfiliadoCard';
import Navbar from '@/pages/landing/components/navbar/Navbar';
import Footer from '@/pages/landing/components/Footer';
import { Link } from 'react-router-dom';
import { API_URL } from '@/config/env';

const DirectorioPage = () => {
  const [afiliados, setAfiliados] = useState<AfiliadoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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

  const fuse = useMemo(() => new Fuse(afiliados, {
    keys: ['nombre_completo', 'codigo_cibir', 'cedula_rif'],
    threshold: 0.25, // Un poco más estricto para evitar ruido en códigos numéricos
    ignoreLocation: true,
    minMatchCharLength: 1
  }), [afiliados]);

  const resultados = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return afiliados;
    }
    return fuse.search(query).map(result => result.item);
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

        {/* Cabecera Estructurada */}
        <section className="bg-emerald-50/50 dark:bg-[#011a14] pt-12 pb-24 px-6 relative border-b border-emerald-100 dark:border-emerald-500/10">
          <div className="max-w-4xl mx-auto relative z-10 text-center space-y-5">

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#022c22] dark:text-white">
              Nuestros Miembros
            </h1>
            <p className="text-lg text-emerald-800/70 dark:text-emerald-100/70 max-w-2xl mx-auto font-medium">
              Verifica y contacta a los profesionales inmobiliarios certificados que forman parte de nuestra cámara.
            </p>

            {/* Buscador */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-36 w-full max-w-2xl px-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                  <Search className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={24} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, cédula o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-16 pr-24 py-5 rounded-[2rem] bg-white dark:bg-[#04432f] shadow-xl shadow-slate-200/50 dark:shadow-2xl text-slate-800 dark:text-emerald-50 font-bold placeholder-slate-400 outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg relative z-0"
                />
                {searchQuery.trim() && (
                  <div className="absolute inset-y-0 right-4 flex items-center z-10">
                    <span className="text-xs font-bold text-slate-500 dark:text-emerald-200 bg-slate-50 dark:bg-[#022c22] px-3 py-1.5 rounded-full border border-slate-200 dark:border-emerald-500/20">
                      {resultados.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 size={48} className="animate-spin text-emerald-600 mb-4" />
              <p className="font-bold text-lg text-slate-500">Cargando directorio seguro...</p>
            </div>
          ) : resultados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resultados.map((afiliado) => (
                <AfiliadoCard key={afiliado.id_agremiado} afiliado={afiliado} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-[#04432f] rounded-[2rem] border border-slate-200 dark:border-emerald-500/20 shadow-sm max-w-2xl mx-auto transition-colors mt-8">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-[#022c22] rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-500/10">
                <Users size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-emerald-50 mb-2">
                {searchQuery.trim() ? 'No se encontraron resultados' : 'Directorio vacío'}
              </h3>
              <p className="text-slate-500 dark:text-emerald-100/70 font-medium max-w-md mx-auto">
                {searchQuery.trim() 
                  ? <>No pudimos encontrar coincidencias para "<strong>{searchQuery}</strong>". Revisa la ortografía o intenta buscar por Código o Cédula/RIF.</>
                  : 'Actualmente no hay profesionales certificados registrados en esta lista pública.'}
              </p>
            </div>
          )}
        </section>

      </main>

      <Footer />

    </div>
  );
};

export default DirectorioPage;
