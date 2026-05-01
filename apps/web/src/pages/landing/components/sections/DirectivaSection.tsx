import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '@/config/env'
import { STATIC } from '@/pages/landing/config/staticContent'
import { formatNombreCard } from '@/utils/formatters'
import Mision_img from '@/assets/Mision.jpeg'

const s = STATIC.directiva

// Tier 3: Directiva members fetched on mount.
// Tier 1: All UI labels come from staticContent.
export default function DirectivaSection() {
  const [directivaMembers, setDirectivaMembers] = useState<any[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/cms/directiva`)
      .then(r => r.json())
      .then(data => { if (data.success) setDirectivaMembers(data.data || []) })
      .catch(() => { })
  }, [])

  return (
    <section id='directiva' className='bg-white px-6 lg:px-20 py-24 scroll-mt-24'>
      <div className='max-w-7xl mx-auto space-y-16'>
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div className='space-y-4'>
            <p className='text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs'>
              {s.subtitulo}
            </p>
            <h2 className='text-4xl sm:text-5xl lg:text-7xl font-black text-[#022c22] tracking-tighter'>
              {s.titulo}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {directivaMembers.length > 0 ? (
            directivaMembers.slice(0, 4).map((m, i) => (
              <div key={m.id} className="group relative flex flex-col items-center text-center space-y-4">
                <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-[2.5rem] overflow-hidden shadow-xl ring-4 ring-emerald-50 transition-all group-hover:ring-emerald-500/20">
                  <img
                    src={m.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=10b981&color=fff&size=200`}
                    alt={m.nombre}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#022c22]">{formatNombreCard(m.nombre)}</h4>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1 opacity-80">{m.cargo}</p>
                </div>
              </div>
            ))
          ) : (
            <Link to='/junta_directiva' className='col-span-full max-w-4xl mx-auto group cursor-pointer w-full'>
              <div className='relative aspect-video overflow-hidden rounded-[2.5rem] mb-4 shadow-2xl shadow-emerald-900/10'>
                <img 
                  src={Mision_img} 
                  alt='Junta Directiva' 
                  loading="lazy"
                  decoding="async"
                  className='w-full h-full object-cover group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out' 
                />
                <div className='absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
              </div>
              <div className='bg-white border-2 border-gray-100 group-hover:border-emerald-500 p-6 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 shadow-sm'>
                <span className='font-black text-emerald-700 uppercase tracking-widest text-sm group-hover:scale-105 transition-transform'>
                  {s.cta}
                </span>
              </div>
            </Link>
          )}
        </div>

        {directivaMembers.length > 0 && (
          <div className="flex justify-center pt-8">
            <Link to="/junta_directiva" className="px-10 py-3 border-2 border-emerald-500 text-emerald-600 rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
              {s.verTodos}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
