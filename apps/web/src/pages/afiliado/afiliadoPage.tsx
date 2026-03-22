import React, { useState } from 'react';
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
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';
import WidgetFinanciero from './components/WidgetFinanciero';
import WidgetNotificaciones from './components/WidgetNotificaciones';
import WidgetAcademico from './components/WidgetAcademico';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Resumen / Inicio' },
  { icon: FolderSearch,    label: 'Mi Expediente' },
  { icon: CreditCard,      label: 'Estado de Cuenta y Solvencias' },
  { icon: GraduationCap,   label: 'Catálogo Académico' },
  { icon: Award,           label: 'Mis Certificados' },
  { icon: Gavel,           label: 'Sistema de Denuncias' },
];

const AfiliadoPage = () => {
  const [activeTab, setActiveTab] = useState('Resumen / Inicio');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-base)' }}>

      <DashboardSidebar
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-grow flex flex-col min-w-0">

        <DashboardHeader
          onMenuOpen={() => setMobileOpen(true)}
          userName="Juan Pérez"
          userCode="CIBIR-2026-001"
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">

          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--color-primary)' }}>
                ¡Bienvenido, Juan Pérez!
              </h1>
              <p className="mt-1 font-medium text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Revisa el estado de tu membresía y tus actualizaciones recientes.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-accent-muted)',
                border: '1px solid var(--color-border-accent)',
              }}
            >
              <CheckCircle size={15} style={{ color: 'var(--color-accent)' }} />
              <span className="font-black text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-accent-hover)' }}>
                CIBIR Activo
              </span>
            </div>
          </div>

          {/* Widget grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
            <div className="lg:col-span-2">
              <WidgetFinanciero />
            </div>
            <div className="lg:col-span-1">
              <WidgetNotificaciones />
            </div>
            <div className="lg:col-span-3">
              <WidgetAcademico />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="mt-auto p-4 sm:p-8 flex justify-center"
          style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
        >
          <div
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-5 sm:px-6 py-4 rounded-2xl text-center sm:text-left"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent-hover)' }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text-base)' }}>
                ¿Necesitas asistencia técnica o gremial?
              </p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Lunes a Viernes de 8:00 AM a 4:00 PM.
              </p>
            </div>
            <button
              className="text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-widest flex-shrink-0 transition-colors"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-dark)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              Contactar Soporte
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default AfiliadoPage;
