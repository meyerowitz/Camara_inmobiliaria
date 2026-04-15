import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/pages/landing/components/LoginModal'
import NavItem from './NavItem'
import { NAV_ITEMS } from './navData'
import Logo from "../../assets/Logo3.png"

interface NavbarProps {
  setIsSesionModalOpen?: (val: boolean) => void;
  setIsRegisterModalOpen?: (val: boolean) => void;
}

export default function Navbar({ setIsSesionModalOpen, setIsRegisterModalOpen }: NavbarProps) {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [darkMode, setDarkMode] = useState(true);

  return (
    <nav
      className={`${
        // Aumentamos a /95 para que el verde sea profundo y no se vea "lavado"
        darkMode ? "dark bg-[#011a14]/95 border-white/10" : "bg-white/95 border-[#011a14]/10"
      } flex items-center justify-center px-6 py-5 lg:px-20 backdrop-blur-xl sticky top-0 z-50 border-b transition-all duration-300`}
    >
      {/* 1. LOGO: Recuperamos la altura h-23 que tenías en el original */}
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
        <img
          src={Logo}
          alt="Logo Cámara"
          className="h-25 w-auto object-contain" // Ajustado para presencia masiva
        />
      </Link>

      {/* 2. MENÚ: Espaciado gap-6 y texto más brillante para nitidez */}
      <div className='hidden xl:flex ml-auto mr-10 gap-6 text-[11px] font-bold uppercase tracking-wider text-white/90'>
        {/* Enlace de Inicio manual para que se vea verde como en tu foto */}
        <a href="/" className="text-emerald-500 py-2 flex items-center hover:text-emerald-400 transition-colors">
          Inicio
        </a>
        
        {NAV_ITEMS.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </div>

      {/* 3. ACCIONES: Botones con el estilo "hermoso" del primero */}
      <div className='flex items-center gap-4 ml-7'>
        {user ? (
          <>
            <Link
              to='/panel'
              className='hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold hover:bg-emerald-800/50 transition-all'
            >
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
              </span>
              {user.email.split('@')[0]}
            </Link>
            <button onClick={logout} className='p-2 text-gray-400 hover:text-red-400 transition-colors'>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowLoginModal(true)}
              className="hidden md:block px-5 py-2 text-emerald-500 text-xs font-bold hover:text-emerald-400 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setIsRegisterModalOpen?.(true)}
              className="px-6 py-2 bg-emerald-500 text-white dark:text-[#011a14] rounded-full text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/40 transition-all active:scale-95"
            >
              Registro
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