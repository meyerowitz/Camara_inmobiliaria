import React, { useState, useEffect, useRef } from 'react'
import { API_URL } from '@/config/env'
import { STATIC } from '@/pages/landing/config/staticContent'

const s = STATIC.noticias

const FALLBACK_NOTICIAS = [
  { id: 1, titulo: 'Nuevas tasas de registro 2026', extracto: 'Bolívar actualiza aranceles para transacciones de bienes raíces este trimestre.', imagen_url: 'https://sectorpublico.softplan.com.br/wp-content/uploads/2022/04/softplanplanejamentoesistemasltda_softplan_image_440-1.jpeg', tag: 'Legal' },
  { id: 2, titulo: 'Crecimiento en Puerto Ordaz', extracto: 'La zona industrial y comercial muestra signos de recuperación tras nuevas inversiones.', imagen_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', tag: 'Mercado' },
  { id: 3, titulo: 'Taller de Ventas Digitales', extracto: 'Éxito total en el último evento presencial realizado en el Hotel Eurobuilding.', imagen_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800', tag: 'Eventos' },
  { id: 4, titulo: 'Innovación Inmobiliaria', extracto: 'Nuevas tecnologías aplicadas al sector de bienes raíces en la región.', imagen_url: 'https://www.elnuevoherald.com/public/ultimas-noticias/5hl2um/picture314557289/alternates/LANDSCAPE_1140/CONDO11.jpg', tag: 'Tecnología' }
]

// Tier 3: News fetched only when section mounts.
// Tier 1: All UI labels from staticContent.
export default function NoticiasSection() {
  const [noticiasBase, setNoticiasBase] = useState(FALLBACK_NOTICIAS)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/cms/noticias?publicado=1`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data.length > 0) setNoticiasBase(data.data) })
      .catch(() => { })
  }, [])

  const noticias = [...noticiasBase, ...noticiasBase]

  const scroll = React.useCallback((direction: 'left' | 'right') => {
    const current = scrollRef.current
    if (!current) return
    const cardWidth = current.offsetWidth / 3
    const maxScroll = current.scrollWidth - current.offsetWidth
    if (direction === 'right') {
      if (current.scrollLeft >= maxScroll - 10) current.scrollTo({ left: 0, behavior: 'instant' })
      else current.scrollBy({ left: cardWidth, behavior: 'smooth' })
    } else {
      if (current.scrollLeft <= 0) current.scrollTo({ left: maxScroll, behavior: 'instant' })
      else current.scrollBy({ left: -cardWidth, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => scroll('right'), 4000)
    return () => clearInterval(interval)
  }, [scroll])

  return (
    <section id='noticias' className='bg-white text-slate-900 px-6 lg:px-10 pt-10 pb-10 lg:pb-24 scroll-mt-20 overflow-hidden rounded-b-[4rem]'>
      <div className='max-w-8xl mx-auto flex justify-between items-end mb-12'>
        <div>
          <h2 className='text-4xl lg:text-5xl font-bold text-[#022c22] tracking-tighter'>
            {s.titulo}
          </h2>
          <p className='text-slate-500 mt-2 font-medium'>
            {s.subtitulo}
          </p>
        </div>
        <button className='hidden md:flex text-emerald-600 font-bold hover:text-emerald-800 transition-colors items-center gap-2'>
          {s.boton} <span className='text-xl'>→</span>
        </button>
      </div>

      <div className='relative max-w-8xl mx-auto group'>
        <button onClick={() => scroll('left')} className='absolute -left-4 lg:-left-12 top-1/3 z-30 p-4 rounded-full bg-white shadow-2xl text-slate-800 hover:bg-emerald-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 hidden md:block'>
          <span className='block rotate-180 text-xl font-bold'>→</span>
        </button>

        <div ref={scrollRef} className='flex gap-10 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {noticias.map((news: any, i) => (
            <div key={i} className='min-w-full md:min-w-[calc(50%-20px)] lg:min-w-[calc(33.333%-27px)] snap-start group/card cursor-pointer'>
              <div className='relative aspect-[16/10] mb-6 overflow-hidden rounded-[2.5rem] shadow-xl shadow-emerald-900/5'>
                <div className='absolute inset-0 bg-emerald-900/20 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 duration-500' />
                <img 
                  src={news.imagen_url || news.img} 
                  alt={news.titulo} 
                  loading="lazy"
                  decoding="async"
                  className='w-full h-full object-cover group-hover/card:scale-110 transition duration-700 ease-out' 
                />
                <span className='absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg'>
                  {news.tag}
                </span>
              </div>
              <div className='space-y-3 px-2'>
                <p className='text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]'>
                  {s.cardMeta}
                </p>
                <h4 className='text-2xl font-bold leading-tight text-[#022c22] group-hover/card:text-emerald-600 transition-colors'>
                  {news.titulo || news.t}
                </h4>
                <p className='text-slate-500 text-sm leading-relaxed line-clamp-2'>
                  {news.extracto || news.d}
                </p>
                <div className='pt-2'>
                  <span className='text-xs font-bold text-slate-400 group-hover/card:text-emerald-500 transition-colors italic'>
                    {s.leerMas}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => scroll('right')} className='absolute -right-4 lg:-right-12 top-1/3 z-30 p-4 rounded-full bg-white shadow-2xl text-slate-800 hover:bg-emerald-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 hidden md:block'>
          <span className='text-xl font-bold block'>→</span>
        </button>
      </div>
    </section>
  )
}
