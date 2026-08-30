import React from 'react'
import useScrollReveal from './useScrollReveal'

export interface ProgramModule {
  numero: string
  titulo: string
  descripcion: string
}

interface TimelineItemProps extends ProgramModule {
  index: number
}

function TimelineItem({ numero, titulo, descripcion, index }: TimelineItemProps) {
  const setReveal = useScrollReveal()
  const isEven = index % 2 === 0

  return (
    <div
      ref={(el) => setReveal(el)}
      className="reveal-on-scroll relative mb-16 md:mb-20 flex flex-col md:flex-row items-center"
    >
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex w-12 h-12 rounded-xl bg-emerald-500 items-center justify-center z-20 shadow-lg border-2 border-white text-white font-black">
        {numero}
      </div>
      <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-20 md:text-right' : 'md:pl-20 md:order-last text-left'}`}>
        <h3 className="text-2xl font-black text-[#022c22] mb-3 uppercase tracking-tight">{titulo}</h3>
        <p className="text-slate-600 leading-relaxed text-lg italic">{descripcion}</p>
      </div>
      <div className="hidden md:block md:w-1/2" />
    </div>
  )
}

interface ProgramTimelineProps {
  modules: ProgramModule[]
}

export default function ProgramTimeline({ modules }: ProgramTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />
      {modules.map((mod, index) => (
        <TimelineItem key={`${mod.numero}-${mod.titulo}`} index={index} {...mod} />
      ))}
    </div>
  )
}

