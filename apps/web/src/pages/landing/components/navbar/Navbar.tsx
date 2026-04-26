import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logo from '@/assets/Logo3.png'
import LoginModal from '@/pages/landing/components/LoginModal'
import NavItem from './NavItem'
import { NAV_ITEMS } from './navData'

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  setIsSesionModalOpen?: (val: boolean) => void;
  setIsRegisterModalOpen?: (val: boolean) => void;
}

const Navbar = ({ darkMode, setDarkMode, setIsSesionModalOpen, setIsRegisterModalOpen }: NavbarProps) => {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const labelLogin = 'Acceder'
  const labelSalir = 'Salir'

  return (
    <>
      <nav
        className={`${
        darkMode ? "dark bg-[#011a14]/90 border-white/10" : " bg-[#011a14]/90 border-white/10"
      } flex items-center justify-between px-6 py-5 lg:px-20 backdrop-blur-md sticky top-0 z-50 border-b`}
      >
        {/* 1. ZONA IZQUIERDA: LOGO */}
        <div className="relative z-10 shrink-0">
          <Link to='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
            <img
              src={logo}
              alt='Cámara Inmobiliaria del Estado Bolívar (CIBIR) - Logo'
              className='h-25 w-auto object-contain'
            />
          </Link>
        </div>

        {/* 2. ZONA CENTRAL: ENLACES DEL MENÚ (Desktop) */}
        <div className='hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 text-[11px] font-bold uppercase tracking-wider text-white dark:text-white w-max z-0'>
          {NAV_ITEMS.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </div>

        {/* 3. ZONA DERECHA: AUTENTICACIÓN Y HAMBURGUESA */}
        <div className='relative z-10 flex items-center gap-2 sm:gap-3'>
          {user ? (
            /* --- ESTADO: LOGUEADO --- */
            <>
              <Link
                to='/panel'
                className='hidden md:flex items-center gap-2 px-4 py-1.5 bg-emerald-900/30 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold hover:bg-emerald-800/50 hover:border-emerald-400 transition-all shadow-inner'
              >
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'></span>
                </span>
                {user.email.split('@')[0]}
              </Link>

              <button
                onClick={logout}
                title={labelSalir}
                className='p-2 text-emerald-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all flex items-center gap-1 text-xs font-bold'
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            /* --- ESTADO: SIN SESIÓN --- */
            <>
              {/* Botón de Login estilo Componente B */}
              <button
                onClick={() => setShowLoginModal(true)}
                className='px-6 py-2 bg-emerald-500 text-white dark:text-[#022c22] rounded-full text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all'
              >
                {labelLogin}
              </button>
            </>
          )}

          {/* Hamburger Menu (Mobile/Tablet) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='xl:hidden p-2 text-emerald-100 hover:bg-emerald-800/40 rounded-lg transition-all'
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </nav>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[70] w-[85%] max-w-sm bg-[#022c22] shadow-2xl transition-transform duration-300 ease-in-out xl:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Cámara Inmobiliaria del Estado Bolívar Logo" className="h-8 w-auto" />
              <div className="flex flex-col leading-tight">
                <span className="text-white font-black text-[11px] tracking-widest uppercase">Cámara Inmobiliaria</span>
                <span className="text-emerald-500 text-[9px] font-bold">Estado Bolívar</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {NAV_ITEMS.map((item, idx) => (
              <div key={idx} className="space-y-4">
                <Link
                  to={item.items ? '#' : item.Tpath}
                  onClick={() => !item.items && setIsMobileMenuOpen(false)}
                  className="block text-white text-lg font-black uppercase tracking-wider"
                >
                  {item.title}
                </Link>
                {item.items && (
                  <div className="ml-4 pl-4 border-l border-emerald-500/30 flex flex-col gap-3">
                    {item.items.map((sub, sidx) => (
                      <Link
                        key={sidx}
                        to={sub.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-emerald-400/80 text-sm font-bold"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-white/10 bg-emerald-950/40">
            {user ? (
              <Link
                to="/panel"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-[#022c22] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
              >
                Mi Panel de Control
              </Link>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true)
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-[#022c22] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar;
