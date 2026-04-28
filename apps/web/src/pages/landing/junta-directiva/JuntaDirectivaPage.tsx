import React, { useRef, useEffect, useState } from 'react'
import bgBolivar from '@/assets/Pzo.jpg'
import Navbar from '@/pages/landing/components/navbar/Navbar'
import { API_URL } from '@/config/env'

// ── Cache key & TTL ────────────────────────────────────────────────────────────
const CACHE_KEY = 'cache_directiva_v1'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

interface CacheEntry {
  data: MiembroDirectiva[]
  ts: number
}

function readCache(): MiembroDirectiva[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function writeCache(data: MiembroDirectiva[]) {
  try {
    const entry: CacheEntry = { data, ts: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {}
}

export function invalidateDirectivaCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

// ── Scroll reveal ──────────────────────────────────────────────────────────────
const useScrollReveal = () => {
  const [node, setNode] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('active') },
      { threshold: 0.1 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])
  return (element: HTMLElement | null) => setNode(element)
}

interface MiembroDirectiva {
  id?: string | number
  nombre: string
  cargo: string
  foto_url?: string
  orden?: number
  activo?: number | boolean
}

const DirectorCard = ({ nombre, cargo, foto, index }: { nombre: string; cargo: string; foto: string; index: number }) => {
  const setReveal = useScrollReveal()
  return (
    <div ref={setReveal} style={{ transitionDelay: `${index * 0.1}s` }} className='reveal-on-scroll group bg-white rounded-[2.5rem] p-5 border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-700'>
      <div className='relative overflow-hidden rounded-[2rem] aspect-square mb-6 bg-slate-100'>
        {foto ? (
          <img src={foto} alt={nombre} className='w-full h-full object-cover group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-110' />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-5xl font-black text-emerald-200'>
            {nombre.charAt(0)}
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-[#022c22]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
      </div>
      <div className='text-center space-y-2'>
        <h3 className='text-xl font-black text-[#022c22] leading-tight group-hover:text-emerald-600 transition-colors'>{nombre}</h3>
        <p className='text-emerald-500 font-black uppercase tracking-[0.15em] text-[10px] bg-emerald-50 py-1 px-3 rounded-full inline-block'>{cargo}</p>
      </div>
    </div>
  )
}

export default function EquipoDirectivo() {
  const [darkMode, setDarkMode] = useState(false)
  const [directiva, setDirectiva] = useState<MiembroDirectiva[]>(() => readCache() ?? [])
  const [loading, setLoading] = useState(directiva.length === 0)

  useEffect(() => {
    // Si ya tenemos datos del caché, no bloquear la UI
    const cached = readCache()
    if (cached) {
      setDirectiva(cached)
      setLoading(false)
      window.scrollTo(0, 0)
      return
    }

    setLoading(true)
    fetch(`${API_URL}/api/cms/directiva`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          const activos = data.data
            .filter((m: MiembroDirectiva) => m.activo !== 0 && m.activo !== false)
            .sort((a: MiembroDirectiva, b: MiembroDirectiva) => (a.orden || 0) - (b.orden || 0))
          setDirectiva(activos)
          writeCache(activos)
        }
      })
      .catch(err => console.error('Error fetching directiva:', err))
      .finally(() => {
        setLoading(false)
        window.scrollTo(0, 0)
      })
  }, [])

  // Escucha evento de invalidación emitido desde el panel CMS
  useEffect(() => {
    const handler = () => {
      invalidateDirectivaCache()
      setLoading(true)
      fetch(`${API_URL}/api/cms/directiva`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            const activos = data.data
              .filter((m: MiembroDirectiva) => m.activo !== 0 && m.activo !== false)
              .sort((a: MiembroDirectiva, b: MiembroDirectiva) => (a.orden || 0) - (b.orden || 0))
            setDirectiva(activos)
            writeCache(activos)
          }
        })
        .finally(() => setLoading(false))
    }
    window.addEventListener('directiva-cache-invalidated', handler)
    return () => window.removeEventListener('directiva-cache-invalidated', handler)
  }, [])

  return (
    <div className='min-h-screen bg-[#022c22] text-white font-sans selection:bg-emerald-500/30'>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <header className='relative px-6 lg:px-20 py-16 lg:py-24 flex items-center justify-center min-h-[40vh] bg-cover animate-header-bg' style={{ backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.85), rgba(2, 44, 34, 0.85)), url(${bgBolivar})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className='text-center space-y-4'>
          <p className='text-emerald-500 font-black uppercase tracking-[0.3em] text-xs animate-header-text' style={{ animationDelay: '0.2s', opacity: 0 }}>Liderazgo Gremial</p>
          <h1 style={{ animationDelay: '0.4s', opacity: 0 }} className='text-5xl lg:text-7xl font-black tracking-tighter animate-header-text'>
            Junta <span className='text-emerald-500 italic'>Directiva</span>
          </h1>
          <p className='text-emerald-100/60 text-sm tracking-widest uppercase font-medium animate-header-text' style={{ animationDelay: '0.5s', opacity: 0 }}>Gestión 2024 - 2026</p>
        </div>
      </header>
      <main className='bg-white text-slate-900 rounded-t-[4rem] -mt-12 relative z-10 px-6 lg:px-20 py-24'>
        <div className='max-w-7xl mx-auto'>
          {loading && directiva.length === 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='bg-gray-100 rounded-[2.5rem] aspect-[3/4] animate-pulse' />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10'>
              {directiva.map((miembro, index) => (
                <DirectorCard key={miembro.id || index} index={index} nombre={miembro.nombre} cargo={miembro.cargo} foto={miembro.foto_url || ''} />
              ))}
            </div>
          )}
          <div className='mt-24 p-12 rounded-[3rem] bg-[#022c22] text-white text-center space-y-6 shadow-2xl shadow-emerald-900/20'>
            <h2 className='text-3xl font-black tracking-tight'>¿Deseas contactar con alguna dirección?</h2>
            <button className='px-10 py-4 bg-emerald-500 text-[#022c22] rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all'>Enviar un mensaje</button>
          </div>
        </div>
      </main>
      <footer className='bg-[#011a14] px-6 lg:px-20 py-12 text-center border-t border-white/5'>
        <p className='text-gray-600 text-[10px] uppercase tracking-[0.2em]'>© 2026 Cámara Inmobiliaria del Estado Bolívar • RIF J-30462520-0</p>
      </footer>
    </div>
  )
}
