import { useState } from 'react'
import CmsHeader from './components/CmsHeader'
import CmsAside from './components/CmsAside'
import CmsContent from './components/CmsContent'

const NAV_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen financiero y actividad reciente' },
  articles: { title: 'Artículos', subtitle: 'Gestionar el contenido del sitio' },
  formacion: { title: 'Formación', subtitle: 'Cursos, talleres y programa CIBIR' },
  cms: { title: 'Contenido', subtitle: 'Gestión de artículos y página web' },
  media: { title: 'Medios', subtitle: 'Gestionar archivos e imágenes' },
  users: { title: 'Afiliados', subtitle: 'Directorio y gestión de afiliados' },
  analytics: { title: 'Análisis', subtitle: 'Métricas y rendimiento general' },
  settings: { title: 'Configuración', subtitle: 'Ajustes del sistema y preferencias' },
}

const AdminPage = () => {
  const [activeId, setActiveId] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const meta = NAV_META[activeId] ?? NAV_META['dashboard']

  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar — handles both mobile drawer and desktop sidebar internally */}
      <CmsAside
        activeId={activeId}
        onNavigate={setActiveId}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
        <CmsHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />
        <main className='flex-1 overflow-y-auto'>
          <CmsContent activeId={activeId} />
        </main>
      </div>
    </div>
  )
}

export default AdminPage
