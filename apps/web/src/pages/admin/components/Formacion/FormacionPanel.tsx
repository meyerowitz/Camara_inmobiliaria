import React, { useState, useEffect } from 'react'
import { API_URL } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
import AsignarEstudiantePanel from './AsignarEstudiantePanel'
import PreinscripcionesPrincipalesPanel from './PreinscripcionesPrincipalesPanel'
import CursosAdminPanel from './CursosAdminPanel'

// ─── MAIN FORMACION PANEL ─────────────────────────────────────────────────────
type SubTab = 'cursos' | 'preinscripciones' | 'asignar'


const FormacionPanel = () => {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<SubTab>('cursos')

  const tabs: { id: SubTab; label: string; badge?: number }[] = [
    { id: 'cursos', label: 'Cursos & Talleres' },
    { id: 'preinscripciones', label: 'Preinscripciones' },
    { id: 'asignar', label: 'Asignar Estudiante' },
  ]


  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 px-4 sm:px-5 pt-4 pb-0 bg-white border-b border-gray-100 flex-shrink-0 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.id
                ? 'text-[#00B870] border-[#00D084] bg-[#E9FAF4]'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'cursos' && <CursosAdminPanel />}
        {activeTab === 'preinscripciones' && <PreinscripcionesPrincipalesPanel />}
        {activeTab === 'asignar' && <AsignarEstudiantePanel />}

      </div>
    </div>
  )
}

export default FormacionPanel
