import React, { useState, useEffect } from 'react'
import { API_URL } from '@/config/env'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const FALLBACK_CONVENIOS = [
  { id: 1, nombre: 'Convenio 1', logo_url: '#' },
  { id: 2, nombre: 'Convenio 2', logo_url: '#' },
  { id: 3, nombre: 'Convenio 3', logo_url: '#' },
  { id: 4, nombre: 'Convenio 4', logo_url: '#' },
]

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(url)
}

export default function ConveniosSection({ cfg = {} }: { cfg?: Record<string, string> }) {
  const [convenios, setConvenios] = useState(FALLBACK_CONVENIOS)
  const revealTextConvenios = useScrollReveal()

  // Evita huecos en el marquee cuando hay pocos items
  const marqueeItems = (() => {
    if (convenios.length === 0) return FALLBACK_CONVENIOS
    const minItems = 8
    const result: typeof convenios = []
    while (result.length < minItems) result.push(...convenios)
    return result.slice(0, Math.max(minItems, convenios.length))
  })()

  useEffect(() => {
    fetch(`${API_URL}/api/cms/convenios`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data.length > 0) setConvenios(data.data) })
      .catch(() => { })
  }, [])

  const marqueeStyle = `
    @keyframes marquee-infinite { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-marquee-infinite { display: flex; width: max-content; animation: marquee-infinite 28s linear infinite; will-change: transform; }
  `

  return (
    <section id='convenios' className='bg-white py-10 scroll-mt-24 overflow-hidden'>
      <style>{marqueeStyle}</style>
      <div className='max-w-7xl mx-auto px-6 lg:px-20 mb-16'>
        <div ref={revealTextConvenios} className='space-y-4 reveal-on-scroll -ml-8'>
          <h2 className='text-5xl lg:text-7xl font-bold text-[#333333] tracking-tighter -ml-4'>
            {cfg['convenios_marquee_titulo'] || 'Convenios y beneficios'}
          </h2>
        </div>
        <div className='relative mt-16 bg-slate-50 border border-gray-100 rounded-[3rem] py-12 overflow-hidden'>
          <div className='absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none' />
          <div className='absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none' />
          <div className='flex'>
            <div className='animate-marquee-infinite flex items-center'>
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <a
                  key={i}
                  href={item.logo_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mx-4 lg:mx-6 flex-shrink-0 group transition-all duration-500'
                >
                  <div className='h-32 lg:h-40 w-56 lg:w-80 rounded-2xl overflow-hidden flex items-center justify-center grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-500'>
                    {isImageUrl(item.logo_url) ? (
                      <img src={item.logo_url} alt={item.nombre} className='w-full h-full object-cover' />
                    ) : (
                      <span className='text-3xl lg:text-4xl' aria-hidden>📄</span>
                    )}
                  </div>
                  <p className='mt-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700 max-w-56 lg:max-w-80 truncate'>
                    {item.nombre}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className='pt-10 border-t border-gray-100'>
          <a href='#formacion' className='group flex items-center gap-3'>
            <span className='text-emerald-600 font-black uppercase tracking-widest text-xs group-hover:mr-4 transition-all'>
              {cfg['convenios_link'] || 'Conoce nuestros programas de formación inmobiliaria'}
            </span>
            <div className='h-[2px] w-12 bg-emerald-500 group-hover:w-24 transition-all' />
          </a>
        </div>
      </div>
    </section>
  )
}