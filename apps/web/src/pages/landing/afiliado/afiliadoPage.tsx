import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderSearch,
  CreditCard,
  GraduationCap,
  Award,
  Gavel,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import DashboardSidebar from '@/pages/landing/afiliado/components/DashboardSidebar';
import DashboardHeader from '@/pages/landing/afiliado/components/DashboardHeader';
import WidgetFinanciero from '@/pages/landing/afiliado/components/WidgetFinanciero';
import WidgetNotificaciones from '@/pages/landing/afiliado/components/WidgetNotificaciones';
import WidgetAcademico from '@/pages/landing/afiliado/components/WidgetAcademico';
import WidgetFormalizarInscripcion from '@/pages/landing/afiliado/components/WidgetFormalizarInscripcion';
import AffiliationTimeline from '@/pages/landing/afiliado/components/AffiliationTimeline';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/env';
import { formatNombreCard } from '@/utils/formatters';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Resumen / Inicio' },
  { icon: FolderSearch, label: 'Mi Expediente' },
  { icon: CreditCard, label: 'Estado de Cuenta y Solvencias' },
  { icon: GraduationCap, label: 'Catálogo Académico' },
  { icon: Award, label: 'Mis Certificados' },
  { icon: Gavel, label: 'Sistema de Denuncias' },
];

const AfiliadoPage = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Resumen / Inicio');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [agremiado, setAgremiado] = useState<{
    nombre_completo: string;
    nombres: string | null;
    apellidos: string | null;
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

  useEffect(() => {
    fetchAgremiado();
  }, [user?.id_agremiado, token]);

  const displayName = agremiado ? formatNombreCard(agremiado.nombres || agremiado.nombre_completo, agremiado.apellidos) : (user?.email?.split('@')[0] ?? 'Afiliado');
  const displayCode = agremiado?.codigo_cibir ?? '—';
  const isActivo = agremiado?.estatus === '9_AFILIACION';
  const isPaid = agremiado?.inscripcion_pagada === 1;
  const isLimited = isActivo && !isPaid;
  const inProcess = agremiado && agremiado.estatus !== '9_AFILIACION' && !agremiado.estatus.includes('Moroso') && !agremiado.estatus.includes('Suspendido') && !agremiado.estatus.includes('Rechazado');

  const filteredNavItems = isLimited
    ? [
      { icon: LayoutDashboard, label: 'Resumen / Inicio' },
      { icon: FolderSearch, label: 'Mi Expediente' },
    ]
    : NAV_ITEMS;

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-base)' }}>

      <DashboardSidebar
        navItems={filteredNavItems}
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
                Revisa el estado de tu membresía y tus actualizaciones recientes.
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm flex-shrink-0 border ${isLimited ? 'border-amber-200 bg-amber-50' : 'border-[var(--color-border-accent)] bg-[var(--color-accent-muted)]'}`}
            >
              <CheckCircle size={15} className={isLimited ? 'text-amber-500' : 'text-[var(--color-accent)]'} />
              <span className={`font-black text-[10px] uppercase tracking-widest ${isLimited ? 'text-amber-700' : 'text-[var(--color-accent-hover)]'}`}>
                {isLimited ? 'CIBIR Restringido (Pago Pendiente)' : isActivo ? 'CIBIR Activo' : agremiado ? `Estado: ${agremiado.estatus.replace(/_/g, ' ')}` : 'Afiliado'}
              </span>
            </div>
          </div>

          {/* Timeline for process */}
          {inProcess && (
            <AffiliationTimeline currentStatus={agremiado.estatus} />
          )}

          {/* Widget grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
            {activeTab === 'Resumen / Inicio' && (
              isLimited ? (
                <div className="col-span-1 lg:col-span-3">
                  <WidgetFormalizarInscripcion onSuccess={fetchAgremiado} />
                </div>
              ) : (
                <>
                  <div className="lg:col-span-2">
                    <WidgetFinanciero />
                  </div>
                  <div className="lg:col-span-1">
                    <WidgetNotificaciones />
                  </div>
                  <div className="lg:col-span-3">
                    <WidgetAcademico />
                  </div>
                </>
              )
            )}

            {activeTab === 'Mi Expediente' && (
              <div className="col-span-1 lg:col-span-3 text-center py-10 opacity-60 font-bold uppercase tracking-widest text-sm">
                En construcción: Mi Expediente
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AfiliadoPage;
