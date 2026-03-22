import React from 'react';
import { Bell, HelpCircle, Menu, Search, User } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuOpen: () => void;
  userName?: string;
  userCode?: string;
  searchPlaceholder?: string;
}

const DashboardHeader = ({
  onMenuOpen,
  userName = 'Juan Pérez',
  userCode = 'CIBIR-2026-001',
  searchPlaceholder = 'Buscar trámites, cursos o solvencias...',
}: DashboardHeaderProps) => (
  <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-emerald-100/50 px-4 sm:px-8 h-18 py-3 flex items-center justify-between gap-4 shadow-sm">
    {/* Left: Hamburger + Search */}
    <div className="flex items-center gap-3 flex-grow max-w-xl">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuOpen}
        className="md:hidden p-2 hover:bg-emerald-50 rounded-lg transition-colors text-slate-500 flex-shrink-0"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all outline-none text-slate-700"
        />
      </div>
    </div>

    {/* Right: Notifications + Profile */}
    <div className="flex items-center gap-4 flex-shrink-0">
      {/* Notification bell */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
        <button className="relative p-2 hover:bg-emerald-50 rounded-full transition-colors group">
          <Bell size={20} className="text-slate-500 group-hover:text-emerald-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </button>
        <button className="p-2 hover:bg-emerald-50 rounded-full transition-colors">
          <HelpCircle size={20} className="text-slate-500 hover:text-emerald-600" />
        </button>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="font-bold text-sm text-slate-800">{userName}</span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{userCode}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition-all">
          <User size={18} className="text-emerald-600" />
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
