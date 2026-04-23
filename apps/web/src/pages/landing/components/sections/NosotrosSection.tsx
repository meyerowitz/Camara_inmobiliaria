import React from 'react'
import { Link } from 'react-router-dom'
import { STATIC } from '@/pages/landing/config/staticContent'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const s = STATIC.nosotros

export default function NosotrosSection() {
  const revealTitle = useScrollReveal()
  const revealCards = useScrollReveal()

  return (
    <section id='nosotros' className='scroll-mt-24 bg-white text-slate-900 rounded-t-[4rem] px-6 lg:px-20 py-24 border-b border-gray-100 relative z-10 -mt-12'>
      <div className='max-w-6xl mx-auto text-center space-y-12'>
        <div ref={revealTitle} className='space-y-4 reveal-on-scroll'>
          <p className='text-emerald-600 font-black uppercase tracking-[0.3em] text-xs'>
            Nuestra Institución
          </p>
          <h2 className='text-4xl lg:text-6xl font-black text-[#022c22] tracking-tighter'>
            {s.titulo}
          </h2>
          <div className='w-20 h-1.5 bg-emerald-500 mx-auto rounded-full' />
          <p className='text-xl text-slate-600 leading-relaxed italic max-w-3xl mx-auto pt-4'>
            {s.descripcion}
          </p>
        </div>

        <div ref={revealCards} className='grid md:grid-cols-3 gap-8 lg:gap-12 reveal-on-scroll' style={{ transitionDelay: '0.2s' }}>
          {s.cards.map((card, i) => (
            <Link key={i} to={card.path} className='group cursor-pointer block'>
              <div className='relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-6 shadow-2xl shadow-emerald-900/10 border border-slate-100'>
                <img
                  src={card.img}
                  alt={card.title}
                  className='w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-in-out'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#022c22]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
              </div>
              <div className='bg-[#022c22] group-hover:bg-emerald-600 text-white p-6 rounded-2xl flex items-center justify-between gap-3 transition-all duration-500 shadow-xl shadow-emerald-900/20 group-hover:-translate-y-2'>
                <span className='font-black uppercase tracking-widest text-xs'>
                  {card.title}
                </span>
                <div className='w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#022c22] transition-colors'>
                  <svg
                    className='w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M14 5l7 7m0 0l-7 7m7-7H3' />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

