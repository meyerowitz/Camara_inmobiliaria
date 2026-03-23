import React from 'react'
import { NoticiasPanel } from './NoticiasPanel'
import { CursosPanel } from './CursosPanel'
import { ConveniosPanel } from './ConveniosPanel'
import { DirectivaPanel } from './DirectivaPanel'
import { HitosPanel } from './HitosPanel'
import { ConfigPanel } from './ConfigPanel'

export type CmsTab = 'noticias' | 'cursos' | 'convenios' | 'directiva' | 'hitos' | 'config'

export default function CmsArticlesPanel({ externalTab = 'config' }: { externalTab?: CmsTab }) {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-hidden relative">
        {externalTab === 'noticias' && <NoticiasPanel />}
        {externalTab === 'cursos' && <CursosPanel />}
        {externalTab === 'convenios' && <ConveniosPanel />}
        {externalTab === 'directiva' && <DirectivaPanel />}
        {externalTab === 'hitos' && <HitosPanel />}
        {externalTab === 'config' && <ConfigPanel />}
      </div>
    </div>
  )
}
