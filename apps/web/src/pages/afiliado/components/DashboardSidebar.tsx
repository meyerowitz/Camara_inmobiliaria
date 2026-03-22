import React, { useState } from 'react';
import { LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  icon: React.ElementType;
  label: string;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (label: string) => void;
  /** Mobile drawer state */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Individual nav button ─────────────────────────────────────────────────────

const NavButton = ({
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={[
      'flex items-center gap-3 w-full rounded-xl py-3 transition-all duration-150 group text-left',
      isCollapsed ? 'justify-center px-2' : 'px-3',
      isActive
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
        : 'text-white/60 hover:text-white hover:bg-white/10',
    ].join(' ')}
  >
    <Icon size={20} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
    {!isCollapsed && <span className="font-semibold text-sm tracking-tight">{label}</span>}
  </button>
);

// ─── Sidebar Content (shared between desktop & mobile) ────────────────────────

const SidebarContent = ({
  navItems,
  activeTab,
  onTabChange,
  isCollapsed,
  onMobileClose,
  isMobile = false,
}: {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (label: string) => void;
  isCollapsed: boolean;
  onMobileClose?: () => void;
  isMobile?: boolean;
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/10 ${isCollapsed ? 'justify-center' : ''}`}>
      <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
        <span className="text-white font-black text-base">CI</span>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-white font-extrabold text-base tracking-tighter uppercase">CIEBO</span>
          <span className="text-emerald-400/70 text-[10px] font-bold tracking-widest uppercase">Portal Afiliado</span>
        </div>
      )}
      {isMobile && onMobileClose && (
        <button
          onClick={onMobileClose}
          className="ml-auto p-1.5 rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>

    {/* Nav items */}
    <nav className="flex-grow py-4 px-2 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <NavButton
          key={item.label}
          icon={item.icon}
          label={item.label}
          isActive={activeTab === item.label}
          isCollapsed={isCollapsed}
          onClick={() => {
            onTabChange(item.label);
            onMobileClose?.();
          }}
        />
      ))}
    </nav>

    {/* Logout */}
    <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
      <button
        className={`flex items-center gap-3 w-full px-3 py-3 text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-xl transition-colors ${isCollapsed ? 'justify-center' : ''}`}
      >
        <LogOut size={18} />
        {!isCollapsed && <span className="font-bold text-sm">Cerrar Sesión</span>}
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardSidebar = ({
  navItems,
  activeTab,
  onTabChange,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* ── MOBILE: Backdrop ────────────────────────────────────── */}
      <div
        onClick={onMobileClose}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── MOBILE: Drawer ──────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#022c22] shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={false}
          onMobileClose={onMobileClose}
          isMobile
        />
      </aside>

      {/* ── DESKTOP: Sidebar ────────────────────────────────────── */}
      <aside
        className={[
          'relative hidden md:flex flex-col h-screen bg-[#022c22] sticky top-0 shadow-2xl transition-all duration-300 ease-in-out flex-shrink-0',
          isCollapsed ? 'w-20' : 'w-72',
        ].join(' ')}
      >
        <SidebarContent
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={isCollapsed}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-[#022c22] border border-white/20 text-white/60 shadow-md hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-150"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
};

export default DashboardSidebar;
