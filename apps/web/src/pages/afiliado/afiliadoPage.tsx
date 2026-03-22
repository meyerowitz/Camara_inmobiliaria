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

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Resumen / Inicio' },
  { icon: FolderSearch,    label: 'Mi Expediente' },
  { icon: CreditCard,      label: 'Estado de Cuenta y Solvencias' },
  { icon: GraduationCap,   label: 'Catálogo Académico' },
  { icon: Award,           label: 'Mis Certificados' },
  { icon: Gavel,           label: 'Sistema de Denuncias' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const AfiliadoPage = () => {
  const [activeTab, setActiveTab] = useState('Resumen / Inicio');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">

      {/* Sidebar */}
      <DashboardSidebar
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">

        {/* Header */}
        <DashboardHeader
          onMenuOpen={() => setMobileOpen(true)}
          userName="Juan Pérez"
          userCode="CIBIR-2026-001"
        />

        {/* Dashboard Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">

          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#022c22] tracking-tight">
                ¡Bienvenido, Juan Pérez!
              </h1>
              <p className="text-slate-500 mt-1 font-medium text-sm">
                Revisa el estado de tu membresía y tus actualizaciones recientes.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full shadow-sm flex-shrink-0">
              <CheckCircle size={15} className="text-emerald-500" />
              <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">CIBIR Activo</span>
            </div>
          </div>

          {/* Widget grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

            {/* Financiero — spans 2 cols on large */}
            <div className="lg:col-span-2">
              <WidgetFinanciero />
            </div>

            {/* Notificaciones */}
            <div className="lg:col-span-1">
              <WidgetNotificaciones />
            </div>

            {/* Académico — full width */}
            <div className="lg:col-span-3">
              <WidgetAcademico />
            </div>

          </div>
        </div>

        {/* Footer support bar */}
        <footer className="mt-auto p-4 sm:p-8 flex justify-center border-t border-slate-200/60 bg-white/50">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white px-5 sm:px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">¿Necesitas asistencia técnica o gremial?</p>
              <p className="text-[10px] text-slate-500 font-medium">Lunes a Viernes de 8:00 AM a 4:00 PM.</p>
            </div>
            <button className="bg-[#022c22] text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors uppercase tracking-widest flex-shrink-0">
              Contactar Soporte
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default AfiliadoPage;
