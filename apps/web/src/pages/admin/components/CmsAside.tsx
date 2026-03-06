import React, { useState } from 'react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  cms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  formacion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

const NAV_MAIN: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
  { id: 'cms', label: 'Contenido', icon: icons.cms },
  { id: 'formacion', label: 'Formación', icon: icons.formacion },
  { id: 'media', label: 'Medios', icon: icons.media },
  { id: 'users', label: 'Afiliados', icon: icons.users },
  { id: 'analytics', label: 'Análisis', icon: icons.analytics },
]

const NAV_BOTTOM: NavItem[] = [
  { id: 'settings', label: 'Configuración', icon: icons.settings },
]

interface CmsAsideProps {
  /** Mobile: whether the drawer is open */
  mobileOpen?: boolean
  /** Called when user closes mobile drawer */
  onMobileClose?: () => void
  activeId?: string
  onNavigate?: (id: string) => void
}

const NavButton = ({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    title={isCollapsed ? item.label : undefined}
    className={[
      'relative flex items-center gap-3 rounded-xl py-2.5 transition-all duration-150 w-full text-left group',
      isCollapsed ? 'justify-center px-0' : 'px-3',
      isActive
        ? 'bg-[#E9FAF4] text-[#00C07A]'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
    ].join(' ')}
  >
    <span className="flex-shrink-0">{item.icon}</span>
    {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
    {isCollapsed && isActive && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00C07A] rounded-r-full" />
    )}
  </button>
)

const SidebarContent = ({
  isCollapsed,
  activeId,
  onNav,
  onClose,
  isMobile = false,
}: {
  isCollapsed: boolean
  activeId: string
  onNav: (id: string) => void
  onClose?: () => void
  isMobile?: boolean
}) => (
  <>
    {/* Logo area */}
    <div className={['flex items-center gap-3 px-4 py-5 border-b border-gray-100 overflow-hidden', isCollapsed ? 'justify-center px-0' : ''].join(' ')}>
      <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-[#00D084] text-white font-bold text-base shadow-sm">
        RE
      </div>
      {!isCollapsed && (
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-slate-800 font-bold text-sm truncate">CIEBO</span>
          <span className="text-slate-400 text-xs truncate">Panel Admin</span>
        </div>
      )}
      {/* Close button visible only on mobile */}
      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          {icons.close}
        </button>
      )}
    </div>

    {/* Main nav */}
    <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
      {NAV_MAIN.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          isCollapsed={isCollapsed}
          onClick={() => onNav(item.id)}
        />
      ))}
    </nav>

    {/* Bottom nav */}
    <div className="pb-4 px-2 flex flex-col gap-1 border-t border-gray-100 pt-4">
      {NAV_BOTTOM.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          isCollapsed={isCollapsed}
          onClick={() => onNav(item.id)}
        />
      ))}
    </div>
  </>
)

const CmsAside = ({
  mobileOpen = false,
  onMobileClose,
  activeId: controlledActiveId,
  onNavigate,
}: CmsAsideProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [internalActiveId, setInternalActiveId] = useState('dashboard')

  const isCollapsed = internalCollapsed
  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId

  const handleNav = (id: string) => {
    setInternalActiveId(id)
    onNavigate?.(id)
    // Close mobile drawer on navigation
    onMobileClose?.()
  }

  return (
    <>
      {/* ── MOBILE DRAWER ─────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onMobileClose}
      />

      {/* Drawer panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-white border-r border-gray-100 shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent
          isCollapsed={false}
          activeId={activeId}
          onNav={handleNav}
          onClose={onMobileClose}
          isMobile
        />
      </aside>

      {/* ── DESKTOP SIDEBAR ───────────────────────────────────────────── */}
      <aside
        className={[
          'relative hidden md:flex flex-col justify-between h-full bg-white border-r border-gray-100 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-[220px]',
        ].join(' ')}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          activeId={activeId}
          onNav={handleNav}
        />

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setInternalCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[72px] z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-slate-500 shadow-sm hover:bg-[#00D084] hover:text-white hover:border-[#00D084] transition-all duration-150"
        >
          {isCollapsed ? icons.chevronRight : icons.chevronLeft}
        </button>
      </aside>
    </>
  )
}

export default CmsAside
