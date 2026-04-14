import React, { useState } from 'react';
import { LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface NavItem {
  icon: React.ElementType;
  label: string;
  isDivider?: boolean;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (label: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout?: () => void;
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

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
    style={
      isActive
        ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-text-on-accent)' }
        : undefined
    }
    className={[
      'flex items-center gap-3 w-full rounded-xl py-3 transition-all duration-150 text-left group',
      isCollapsed ? 'justify-center px-2' : 'px-3',
      isActive
        ? 'shadow-lg'
        : 'text-white/60 hover:text-white hover:bg-white/10',
    ].join(' ')}
  >
    <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
    {!isCollapsed && <span className="font-semibold text-sm tracking-tight">{label}</span>}
  </button>
);

// ─── Sidebar Content ──────────────────────────────────────────────────────────

const SidebarContent = ({
  navItems,
  activeTab,
  onTabChange,
  isCollapsed,
  onMobileClose,
  onLogout,
  isMobile = false,
}: {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (label: string) => void;
  isCollapsed: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
  isMobile?: boolean;
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div
      className={`flex items-center gap-3 px-5 py-6 border-b border-white/10 ${isCollapsed ? 'justify-center' : ''}`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 font-black text-base"
        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-on-accent)' }}
      >
        CI
      </div>
      {!isCollapsed && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-base tracking-tighter uppercase" style={{ color: 'var(--color-text-on-dark)' }}>
            CIEBO
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-50" style={{ color: 'var(--color-accent)' }}>
            Mi Portal
          </span>
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

    {/* Nav */}
    <nav className="flex-grow py-4 px-2 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        item.isDivider ? (
          <div key={item.label} className="px-3 pt-4 pb-1">
            <span className="text-[9px] font-black tracking-widest uppercase opacity-40 text-white">
              {item.label.replace('— ', '').replace(' —', '')}
            </span>
            <div className="mt-1 border-t border-white/10" />
          </div>
        ) : (
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
        )
      ))}
    </nav>

    {/* Logout */}
    <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
      <button
        onClick={onLogout}
        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors hover:bg-white/10 ${isCollapsed ? 'justify-center' : ''}`}
        style={{ color: 'var(--color-danger)' }}
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
  onLogout,
}: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onMobileClose}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Mobile drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <SidebarContent navItems={navItems} activeTab={activeTab} onTabChange={onTabChange} isCollapsed={false} onMobileClose={onMobileClose} onLogout={onLogout} isMobile />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={[
          'relative hidden md:flex flex-col h-screen sticky top-0 shadow-2xl transition-all duration-300 ease-in-out flex-shrink-0',
          isCollapsed ? 'w-20' : 'w-72',
        ].join(' ')}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <SidebarContent navItems={navItems} activeTab={activeTab} onTabChange={onTabChange} isCollapsed={isCollapsed} onLogout={onLogout} />

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full border border-white/20 text-white/60 shadow-md transition-all duration-150 hover:text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
};

export default DashboardSidebar;
