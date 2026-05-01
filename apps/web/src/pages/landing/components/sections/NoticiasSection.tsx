import React, { useState, useEffect, useRef } from 'react'
import { API_URL } from '@/config/env'
import { STATIC } from '@/pages/landing/config/staticContent'

const s = STATIC.noticias

export default function NoticiasSection() {
  const [noticiasBase, setNoticiasBase] = useState<any[]>([])
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

  if (noticiasBase.length === 0) return null

  return (
    <section id='noticias' className='bg-white text-slate-900 px-6 lg:px-10 pt-10 pb-10 lg:pb-24 scroll-mt-20 overflow-hidden'>
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
        <button 
          onClick={() => scroll('left')} 
          className='absolute -left-2 md:-left-10 lg:-left-12 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white border border-emerald-50 shadow-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M15 19l-7-7 7-7' /></svg>
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

        <button 
          onClick={() => scroll('right')} 
          className='absolute -right-2 md:-right-10 lg:-right-12 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white border border-emerald-50 shadow-xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M9 5l7 7-7 7' /></svg>
        </button>
      </div>
    </section>
  )
}
