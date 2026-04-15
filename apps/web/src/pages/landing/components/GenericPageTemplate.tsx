import React, { useState, useEffect } from 'react';
import Navbar from '@/pages/landing/components/navbar/Navbar';
import { Link } from 'react-router-dom';
import { Leaf, Award, BookOpen, Building2, Camera, FileCheck, FileText, Gavel, Globe2, Handshake, MessagesSquare, Users, Briefcase } from 'lucide-react';
import { contentMap } from '../data/chamberContent';
import { API_URL } from '@/config/env';
import type { LucideIcon } from 'lucide-react';

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

const CMS_ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  Building2,
  Camera,
  FileCheck,
  FileText,
  Gavel,
  Globe2,
  Handshake,
  MessagesSquare,
  Users,
  Briefcase,
  Leaf,
}

function getCmsIcon(iconName?: string): LucideIcon {
  if (!iconName) return Leaf
  return CMS_ICON_MAP[iconName] ?? Leaf
}

const GenericPageTemplate = ({ pageKey }: GenericPageProps) => {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [cms, setCms] = useState<CmsPageJson | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-sm font-medium">Cargando contenido…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        404 - Contenido no configurado.
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${darkMode ? 'dark bg-[#022c22] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setIsSesionModalOpen={setIsLoginOpen}
        setIsRegisterModalOpen={setIsRegisterOpen}
      />

      <section className="relative py-24 px-6 lg:px-20 overflow-hidden bg-white dark:bg-[#011a14] transition-colors border-b border-slate-100 dark:border-emerald-500/10">
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-emerald-50 dark:bg-[#022c22] border-4 border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center justify-center shadow-sm">
            <Icon size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--color-primary)] dark:text-emerald-50">
            {data.title}
          </h1>
          <p className="text-lg text-slate-500 dark:text-emerald-100/70 font-medium max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-16 space-y-12">
        {data.blocks.map((block, idx) => (
          <div key={idx} className="bg-white dark:bg-[#04432f] p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-500/40 transition-colors">
            <h2 className="text-2xl font-black text-slate-800 dark:text-emerald-400 mb-4 flex items-center gap-3">
              <Leaf size={20} className="text-emerald-500 opacity-50" />
              {block.heading}
            </h2>
            <p className="text-slate-600 dark:text-emerald-50/80 leading-relaxed font-medium text-lg">
              {block.body}
            </p>
            {block.list && (
              <ul className="mt-6 space-y-3">
                {block.list.map((item, iList) => (
                  <li key={iList} className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-emerald-100/90 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>

      <footer
        className="px-6 lg:px-20 py-14 text-center border-t space-y-4"
        style={{ backgroundColor: 'var(--color-primary)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {data.footerBrand ?? 'Cámara Inmobiliaria del Estado Bolívar (CIBIR) — Afiliada a la CIV'}
        </p>
        <div className="flex justify-center gap-6 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {(data.footerLinks ?? [
            { label: 'Inicio', to: '/' },
            { label: 'Afiliación', to: '/cibir' },
          ]).map((l, i) => (
            <Link key={i} to={l.to} className="hover:opacity-80 transition-opacity">{l.label}</Link>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {data.footerCopyright ?? '© 2026 CIBIR Bolívar. Todos los derechos reservados.'}
        </p>
      </footer>
    </div>
  );
};

export default GenericPageTemplate;
