import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderSearch,
  CreditCard,
  GraduationCap,
  Award,
  Gavel,
  HelpCircle,
  CheckCircle,
  Settings,
  Users,
  Newspaper,
  Handshake,
  ShieldCheck,
  BarChart,
  BookOpen,
  Image as ImageIcon,
  UserCog
} from 'lucide-react';
import DashboardSidebar from '@/pages/afiliado/components/DashboardSidebar';
import DashboardHeader from '@/pages/afiliado/components/DashboardHeader';
import WidgetFinanciero from '@/pages/afiliado/components/WidgetFinanciero';
import WidgetNotificaciones from '@/pages/afiliado/components/WidgetNotificaciones';
import WidgetAcademico from '@/pages/afiliado/components/WidgetAcademico';
import WidgetFormalizarInscripcion from '@/pages/afiliado/components/WidgetFormalizarInscripcion';

// Componentes Administrativos pre-existentes
import UsersPanel from '@/pages/admin/components/Users/UsersPanel';
import SuperAdminUsersPanel from '@/pages/admin/components/Users/SuperAdminUsersPanel';
import AnalyticsPanel from '@/pages/admin/components/Analytics/AnalyticsPanel';
import FormacionPanel from '@/pages/admin/components/Formacion/FormacionPanel';
import CmsDashboard from '@/pages/admin/components/dashboard/CmsDashboard';
import CmsArticlesPanel, { type CmsTab } from '@/pages/admin/components/Cms/CmsArticlesPanel';

import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/env';

// ─── Nav Items por sección ────────────────────────────────────────────────────

const NAV_AFILIADO = [
  { icon: LayoutDashboard, label: 'Resumen / Inicio' },
  { icon: FolderSearch, label: 'Mi Expediente' },
  { icon: CreditCard, label: 'Estado de Cuenta y Solvencias' },
  { icon: GraduationCap, label: 'Catálogo Académico' },
  { icon: Award, label: 'Mis Certificados' },
  { icon: Gavel, label: 'Sistema de Denuncias' },
];

const NAV_ADMIN_CORE = [
  { icon: Users, label: 'Gestión de Afiliados' },
  { icon: BookOpen, label: 'Gestión de Formación' },
  { icon: BarChart, label: 'Análisis y Métricas' },
];

const NAV_CMS = [
  { icon: Newspaper, label: 'CMS · Noticias' },
  { icon: GraduationCap, label: 'CMS · Cursos' },
  { icon: Handshake, label: 'CMS · Convenios' },
  { icon: Users, label: 'CMS · Directiva' },
  { icon: Award, label: 'CMS · Historia' },
  { icon: Settings, label: 'CMS · Configuración' },
];

const NAV_SUPER_ADMIN = [
  { icon: UserCog, label: 'Administradores' },
];

const NAV_DIVIDER_ADMIN = { icon: ShieldCheck, label: '— Administración —', isDivider: true };
const NAV_DIVIDER_CMS = { icon: Settings, label: '— Editor Web —', isDivider: true };

// ─── Sección vacía (placeholder) ─────────────────────────────────────────────

const Section = ({ label }: { label: string }) => (
  <div className="col-span-1 lg:col-span-3 text-center py-16 opacity-50 font-bold uppercase tracking-widest text-sm">
    🚧 En construcción: {label}
  </div>
);

/* Eliminado el wrap de redirección innecesario */

// ─── Panel unificado principal ────────────────────────────────────────────────

const PanelPage = () => {
  const { user, token, logout, isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('Resumen / Inicio');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [agremiado, setAgremiado] = useState<{
    nombre_completo: string;
    codigo_cibir: string | null;
    estatus: string;
    inscripcion_pagada: number;
  } | null>(null);

  const fetchAgremiado = () => {
    if (!user?.id_agremiado || !token) return;
    fetch(`${API_URL}/api/afiliados/${user.id_agremiado}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setAgremiado(d.data) })
      .catch(() => { });
  };

  useEffect(() => { fetchAgremiado(); }, [user?.id_agremiado, token]);

  const displayName = agremiado?.nombre_completo ?? user?.email?.split('@')[0] ?? 'Usuario';
  const displayCode = agremiado?.codigo_cibir ?? (isAdmin ? 'Administrador' : '—');
  const isActivo = agremiado?.estatus === 'CIBIR';
  const isPaid = agremiado?.inscripcion_pagada === 1;
  const isLimited = isActivo && !isPaid;

  // Construir nav items dinámicamente según roles
  const buildNavItems = () => {
    const affItems = isLimited
      ? [{ icon: LayoutDashboard, label: 'Resumen / Inicio' }, { icon: FolderSearch, label: 'Mi Expediente' }]
      : [...NAV_AFILIADO];

    if (isAdmin) {
      let adminItems = [
        NAV_DIVIDER_ADMIN as any,
        ...NAV_ADMIN_CORE,
      ];
      if (isSuperAdmin) {
        adminItems = [...adminItems, ...NAV_SUPER_ADMIN];
      }
      adminItems = [
        ...adminItems,
        NAV_DIVIDER_CMS as any,
        ...NAV_CMS
      ];
      return [...affItems, ...adminItems];
    }
    return affItems;
  };

  const navItems = buildNavItems();

  // ── Renderizado del contenido activo ────────────────────────────────────────

  const renderContent = () => {
    // 1. Sección de Afiliado
    if (activeTab === 'Resumen / Inicio') {
      if (isAdmin) return <div className="col-span-1 lg:col-span-3 -m-4 sm:-m-6 lg:-m-8"><CmsDashboard /></div>;
      if (isLimited) return <div className="col-span-1 lg:col-span-3"><WidgetFormalizarInscripcion onSuccess={fetchAgremiado} /></div>;
      return (
        <>
          <div className="lg:col-span-2"><WidgetFinanciero /></div>
          <div className="lg:col-span-1"><WidgetNotificaciones /></div>
          <div className="lg:col-span-3"><WidgetAcademico /></div>
        </>
      );
    }
    if (activeTab === 'Mi Expediente') return <Section label="Mi Expediente" />;
    if (activeTab === 'Estado de Cuenta y Solvencias') return <Section label="Estado de Cuenta" />;
    if (activeTab === 'Catálogo Académico') return <Section label="Catálogo Académico" />;
    if (activeTab === 'Mis Certificados') return <Section label="Mis Certificados" />;
    if (activeTab === 'Sistema de Denuncias') return <Section label="Sistema de Denuncias" />;

    // 2. Sección Administrativa
    if (!isAdmin) return null;

    if (activeTab === 'Gestión de Afiliados') return <div className="col-span-1 lg:col-span-3 min-h-[600px] border border-gray-100 rounded-3xl bg-white overflow-hidden shadow-xs relative"><UsersPanel /></div>;
    if (activeTab === 'Administradores') return <div className="col-span-1 lg:col-span-3 border border-gray-100 rounded-3xl bg-white overflow-hidden shadow-xs min-h-[600px] p-6 relative"><SuperAdminUsersPanel /></div>;
    if (activeTab === 'Análisis y Métricas') return <div className="col-span-1 lg:col-span-3 min-h-[600px] relative"><AnalyticsPanel /></div>;
    if (activeTab === 'Gestión de Formación') return <div className="col-span-1 lg:col-span-3 border border-gray-100 rounded-3xl bg-white overflow-hidden shadow-xs min-h-[600px] relative"><FormacionPanel /></div>;

    // 3. Sección CMS (Incrustada)
    if (activeTab.startsWith('CMS ·')) {
      const tabMap: Record<string, CmsTab> = {
        'CMS · Noticias': 'noticias',
        'CMS · Cursos': 'cursos',
        'CMS · Convenios': 'convenios',
        'CMS · Directiva': 'directiva',
        'CMS · Historia': 'hitos',
        'CMS · Configuración': 'config',
      };
      const externalTab = tabMap[activeTab] ?? 'config';
      return (
        <div className="col-span-1 lg:col-span-3 h-[calc(100vh-160px)] -m-4 sm:-m-6 lg:-m-8 bg-white border border-gray-100 rounded-3xl overflow-hidden relative">
          <CmsArticlesPanel externalTab={externalTab} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-base)' }}>
      <DashboardSidebar
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={logout}
      />

      <main className="flex-grow flex flex-col min-w-0">
        <DashboardHeader
          onMenuOpen={() => setMobileOpen(true)}
          userName={displayName}
          userCode={displayCode}
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">
          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--color-primary)' }}>
                ¡Bienvenido, {displayName}!
              </h1>
              <p className="mt-1 font-medium text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {isAdmin
                  ? 'Panel unificado · Afiliado y Administración.'
                  : 'Revisa el estado de tu membresía y tus actualizaciones recientes.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {user?.roles?.map(role => (
                <span
                  key={role}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest border ${role === 'super_admin' ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : role === 'admin' ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : isLimited
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-[var(--color-border-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)]'
                    }`}
                >
                  <CheckCircle size={11} />
                  {role === 'super_admin' ? 'Super Admin'
                    : role === 'admin' ? 'Administrador'
                      : isLimited ? 'CIBIR Restringido'
                        : isActivo ? 'CIBIR Activo'
                          : agremiado ? `Estatus: ${agremiado.estatus}` : 'Afiliado'}
                </span>
              ))}
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PanelPage;
