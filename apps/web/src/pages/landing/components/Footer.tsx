import React from 'react'
import logo from '@/pages/landing/assets/Logo3.png'
import { useCachedConfig } from '@/hooks/useCachedConfig'
import { STATIC } from '@/pages/landing/config/staticContent'

const s = STATIC.footer

// Tier 1: Static text (descripcion, direccion, copyright)
// Tier 2: Social links (instagram, facebook, linkedin) — loaded from cache
export default function Footer() {
  const cfg = useCachedConfig()

  return (
    <footer className='bg-[#022c22] px-6 lg:px-20 py-16 text-center border-t border-white/5 space-y-6'>
      <img src={logo} alt='Logo' className='h-20 mx-auto opacity-50 grayscale brightness-200' />
      <p className='text-gray-500 text-sm max-w-lg mx-auto leading-relaxed'>
        {s.descripcion} <br />
        {s.direccion}
      </p>
      <div className='flex justify-center gap-6 text-gray-400 text-xs'>
        <a href={cfg['redes_instagram'] || '#'} target='_blank' rel='noopener noreferrer' className='hover:text-emerald-400'>Instagram</a>
        <a href={cfg['redes_facebook'] || '#'} target='_blank' rel='noopener noreferrer' className='hover:text-emerald-400'>Facebook</a>
        <a href={cfg['redes_linkedin'] || '#'} target='_blank' rel='noopener noreferrer' className='hover:text-emerald-400'>LinkedIn</a>
      </div>
      <p className='text-gray-600 text-[10px] pt-4'>
        {s.copyright}
      </p>
    </footer>
  )
}