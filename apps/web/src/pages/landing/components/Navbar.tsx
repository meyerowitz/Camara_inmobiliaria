import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logoA from '@/pages/landing/assets/Logo2.png'
import logo from '@/pages/landing/assets/Logo3.png'
import LoginModal from '@/pages/landing/components/LoginModal'

export interface NavOption {
  label: string;
  path: string;
}
export type NavOptionItem = string | NavOption;

interface NavItemProps {
  title: string;
  options: NavOptionItem[] | null;
  Tpath: string;
}

const NavItem = ({ title, options, Tpath }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className='relative group'
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link to={!options ? Tpath : '#'}>
        <button className='flex items-center gap-1 hover:text-emerald-400 transition py-2 font-medium font-bold text-sm'>
          {title}
          {options && (
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
            </svg>
          )}
        </button>
      </Link>
      {options && isOpen && (
        <div className='absolute top-full left-0 w-48 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xl rounded-xl py-2 mt-0 border border-emerald-500/10 z-[60]'>
          {options.map((opt, idx) => {
            const label = typeof opt === 'string' ? opt : opt.label
            const path = typeof opt === 'string' ? '/' : opt.path
            return (
              <Link
                key={idx}
                to={path}
                className='block px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition text-xs font-bold'
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  setIsSesionModalOpen?: (val: boolean) => void;
  setIsRegisterModalOpen?: (val: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode, setIsSesionModalOpen, setIsRegisterModalOpen }: NavbarProps) {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const menuConfig = [
    {
      title: 'Nosotros',
      items: [
        { label: 'Misión y Visión', path: '/mision_vision' },
        { label: 'Junta Directiva', path: '/junta_directiva' },
        { label: 'Historia', path: '/historia' },
        { label: 'Dirección', path: '/direccion' }
      ],
      Tpath: ''
    },
    { title: 'CIV', items: null, Tpath: '/codigo_etica' },
    { title: 'Eventos', items: null, Tpath: '/eventos' },
    { title: 'Afiliados', items: [{ label: 'Directorio', path: '/directorio' }, { label: 'Beneficios', path: '/beneficios' }, { label: 'Requisitos', path: '/requisitos' }], Tpath: '' },
    { title: 'Formación', items: [{ label: 'PREANI', path: '/preani' }, { label: 'CIBIR', path: '/cibir' }, { label: 'PEGI', path: '/pegi' }, { label: 'PADI', path: '/padi' }], Tpath: '' },
    { title: 'Convenios', items: [{ label: 'Institucionales', path: '/convenios-institucionales' }, { label: 'Comerciales', path: '/convenios-comerciales' }, { label: 'Internacionales', path: '/convenios-internacionales' }], Tpath: '' },
    { title: 'Normativas', items: null, Tpath: '/normativas' },
    { title: 'Prensa', items: [{ label: 'Noticias', path: '#noticias' }, { label: 'Galería', path: '/galeria' }, { label: 'Comunicados', path: '/comunicados' }], Tpath: '' },
    { title: 'Contacto', items: null, Tpath: '/contacto' }
  ]

  return (
    <nav
      className={`${darkMode ? 'dark bg-[#011a14]/95 border-white/5' : 'bg-[#022c22]/95 border-[#04432f]/60'
        } flex items-center justify-between px-6 py-5 lg:px-20 backdrop-blur-md sticky top-0 z-50 border-b transition-colors duration-300`}
    >
      <Link to='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
        <img
          src={logo}
          alt='Logo Cámara'
          className='h-23 w-auto object-contain'
        />
      </Link>

      <div className='hidden xl:flex ml-auto gap-6 text-[11px] font-bold uppercase tracking-wider text-emerald-100/90 dark:text-emerald-100/80'>
        <a href='#inicio' className='text-emerald-400 py-2 flex items-center'>
          Inicio
        </a>
        {menuConfig.map((item, index) => (
          <NavItem key={index} title={item.title} options={item.items} Tpath={item.Tpath || '/'} />
        ))}
      </div>

      <div className='flex items-center gap-4 ml-7'>
        {user ? (
          /* ── Sesión activa ─────────────────────────────────── */
          <>
            <Link
              to='/panel'
              className='hidden md:flex items-center gap-2 px-5 py-2 text-emerald-600 text-xs font-bold hover:text-emerald-700 transition'
            >
              <span className='w-2 h-2 rounded-full bg-emerald-500 inline-block' />
              {user.email.split('@')[0]}
            </Link>
            <button
              onClick={logout}
              className='px-6 py-2 border border-emerald-400 text-emerald-500 rounded-full text-xs font-bold hover:bg-emerald-50 transition-all'
            >
              Salir
            </button>
          </>
        ) : (
          /* ── Sin sesión ────────────────────────────────────── */
          <>
            <button
              onClick={() => setShowLoginModal(true)}
              className='hidden md:block px-5 py-2 text-emerald-400 text-xs font-bold hover:text-emerald-300 transition'
            >
              Login
            </button>
            <Link
              to='/cibir'
              className='px-6 py-2 bg-emerald-500 text-white dark:text-[#022c22] rounded-full text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all'
            >
              Registro
            </Link>
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-2xl shadow-xl transition-all hover:rotate-12 ${darkMode ? 'bg-white text-black' : 'bg-[#022c22] text-white'
            }`}
        >
          {darkMode
            ? (
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z' />
              </svg>
            )
            : (
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
              </svg>
            )}
        </button>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </nav>
  )
}
