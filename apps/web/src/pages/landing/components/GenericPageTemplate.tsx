import React, { useState, useEffect } from 'react';
import Navbar from '@/pages/landing/components/navbar/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { contentMap } from '../data/chamberContent';
import { API_URL } from '@/config/env';
import { getCmsIcon } from '@/pages/landing/cms/cmsIcons';
import bgBolivar from '@/pages/landing/assets/Pzo.jpg';

interface GenericPageProps {
  pageKey: string;
}

interface CmsPageJson {
  version?: number;
  kind?: string;
  title: string;
  subtitle: string;
  icon?: string;
  blocks: Array<{ heading: string; body: string; list?: string[] }>;
  footerBrand?: string;
  footerLinks?: Array<{ label: string; to: string }>;
  footerCopyright?: string;
}

const GenericPageTemplate = ({ pageKey }: GenericPageProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [cms, setCms] = useState<CmsPageJson | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/api/public/paginas/${encodeURIComponent(pageKey)}`)
      .then(r => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data?.contenido) {
          try {
            const parsed = JSON.parse(json.data.contenido as string) as CmsPageJson;
            if (parsed?.title && parsed?.blocks) {
              setCms(parsed);
              setLoading(false);
              return;
            }
          } catch {
            /* ignore */
          }
        }
        setCms(null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setCms(null);
          setLoading(false);
        }
      });
    return () => { cancelled = true };
  }, [pageKey]);

  const fallback = contentMap[pageKey];
  const data = cms
    ? {
      title: cms.title,
      subtitle: cms.subtitle,
      icon: getCmsIcon(cms.icon),
      blocks: cms.blocks,
      footerBrand: cms.footerBrand,
      footerLinks: cms.footerLinks,
      footerCopyright: cms.footerCopyright,
    }
    : fallback
      ? {
        title: fallback.title,
        subtitle: fallback.subtitle,
        icon: fallback.icon,
        blocks: fallback.blocks,
        footerBrand: undefined,
        footerLinks: undefined,
        footerCopyright: undefined,
      }
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#022c22] text-emerald-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest">Cargando contenido…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#022c22] text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black italic text-emerald-500">404</h1>
          <p className="text-slate-400 font-medium">Contenido no configurado.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-widest">Volver al inicio</button>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className='min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30 scroll-smooth'>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setIsSesionModalOpen={setIsLoginOpen}
        setIsRegisterModalOpen={setIsRegisterOpen}
      />

      <header
        className='relative px-6 lg:px-20 py-16 lg:py-24 flex items-center justify-center min-h-[45vh] bg-cover animate-header-bg'
        style={{
          backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.88), rgba(2, 44, 34, 0.88)), url(${bgBolivar})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className='text-center space-y-4'>
          <p className='text-emerald-500 font-black uppercase tracking-[0.3em] text-xs animate-header-text' style={{ animationDelay: '0.2s', opacity: 0 }}>Institucional</p>
          <h1 className='text-5xl lg:text-7xl font-black tracking-tighter animate-header-text max-w-4xl mx-auto' style={{ animationDelay: '0.4s', opacity: 0 }}>
            {data.title.split(' ').map((word, i) => i === 1 ? <span key={i} className='text-emerald-500 italic'>{word} </span> : word + ' ')}
          </h1>
          <div className='w-20 h-1 bg-emerald-500 mx-auto mt-6 animate-header-text' style={{ animationDelay: '0.6s', opacity: 0 }} />
          <p className='text-emerald-100/60 text-sm tracking-widest uppercase font-medium animate-header-text' style={{ animationDelay: '0.7s', opacity: 0 }}>{data.subtitle}</p>
        </div>
      </header>

      <main className='bg-white text-slate-900 rounded-t-[4rem] -mt-12 relative z-10 px-6 lg:px-20 py-24'>
        <div className='max-w-6xl mx-auto'>
          <div className={`grid gap-8 lg:gap-12 ${data.blocks.length === 2 ? 'md:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
            {data.blocks.map((block, idx) => (
              <div
                key={idx}
                className={`group space-y-6 p-8 md:p-10 rounded-[2.5rem] transition-all duration-500 border ${
                  idx % 2 === 0
                    ? 'bg-slate-50 border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5'
                    : 'bg-white border-slate-100 shadow-sm hover:border-emerald-500'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                  idx % 2 === 0
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-[#022c22] text-emerald-500'
                }`}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <h2 className='text-3xl font-black text-[#022c22] tracking-tight uppercase leading-none'>
                  {block.heading}
                </h2>
                <p className='text-lg text-slate-600 leading-relaxed italic'>
                  "{block.body}"
                </p>
                {block.list && (
                  <ul className="mt-6 space-y-4">
                    {block.list.map((item, iList) => (
                      <li key={iList} className="flex items-start gap-3 group/item">
                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0 group-hover/item:scale-150 transition-transform" />
                        <span className="text-slate-600 font-bold text-sm uppercase tracking-wide">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className='mt-20 pt-10 border-t border-slate-100 text-center space-y-6'>
            <p className='text-emerald-600 font-black uppercase tracking-widest text-xs'>¿Necesitas más información?</p>
            <div className='flex flex-wrap justify-center gap-4'>
              <button
                onClick={() => navigate('/')}
                className='px-10 py-4 border-2 border-[#022c22] text-[#022c22] rounded-full font-black uppercase text-xs tracking-widest hover:bg-[#022c22] hover:text-white transition-all shadow-lg shadow-[#022c22]/5'
              >
                Volver al inicio
              </button>
              <button
                onClick={() => navigate('/contacto')}
                className='px-10 py-4 bg-[#022c22] text-emerald-400 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-900/10'
              >
                Contáctanos
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className='bg-[#011a14] px-6 lg:px-20 py-12 text-center border-t border-white/5'>
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
          {data.footerCopyright ?? `© ${new Date().getFullYear()} Cámara Inmobiliaria del Estado Bolívar • RIF J-30462520-0`}
        </p>
      </footer>
    </div>
  );
};

export default GenericPageTemplate;
