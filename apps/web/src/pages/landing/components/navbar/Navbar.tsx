import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logo from '@/pages/landing/assets/Logo.png'
import LoginModal from '@/pages/landing/components/LoginModal'
import NavItem from './NavItem'
import { NAV_ITEMS } from './navData'

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  setIsSesionModalOpen?: (val: boolean) => void;
  setIsRegisterModalOpen?: (val: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode, setIsSesionModalOpen, setIsRegisterModalOpen }: NavbarProps) {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const labelLogin = 'Acceder'
  const labelSalir = 'Salir'

  return (
    <nav
      className={`${darkMode ? 'dark bg-[#011a14]/95 border-white/5' : 'bg-[#022c22]/95 border-[#04432f]/60'
        } relative flex items-center justify-between px-6 py-3 lg:px-12 backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300`}
    >
      {/* 1. ZONA IZQUIERDA: LOGO (Anclado a la izquierda naturalmente) */}
      <div className="relative z-10 flex-shrink-0">
        <Link to='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
          <img src={logo} alt='Logo Cámara' className='h-10 w-auto object-contain' />
          <div className='hidden sm:block leading-tight'>
            <p className='text-white font-bold text-sm tracking-widest uppercase'>Cámara Inmobiliaria</p>
            <p className='text-emerald-500 text-[10px] font-bold'>Estado Bolívar</p>
          </div>
        </Link>
      </div>

      {/* 2. ZONA CENTRAL: ENLACES DEL MENÚ (Centrado de forma absoluta para no empujar los extremos) */}
      <div className='hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 text-[11px] font-bold uppercase tracking-wider text-emerald-100/90 dark:text-emerald-100/80 w-max z-0'>
        {NAV_ITEMS.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </div>

      {/* 3. ZONA DERECHA: AUTENTICACIÓN (Sin anchos fijos ni bordes, se pega a la derecha) */}
      <div className='relative z-10 flex items-center gap-3'>
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
            <button
              onClick={() => setShowLoginModal(true)}
              className='hidden md:flex items-center gap-1.5 px-4 py-2 text-emerald-200 text-xs font-bold hover:text-white hover:bg-emerald-800/40 rounded-full transition-all'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {labelLogin}
            </button>
          </>
        )}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </nav>
  )
}