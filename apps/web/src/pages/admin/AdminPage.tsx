import { useState } from 'react'
import CmsHeader from './components/CmsHeader'
import CmsAside from './components/CmsAside'
import CmsContent from './components/CmsContent'

const NAV_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen financiero y actividad reciente' },
  articles: { title: 'Artículos', subtitle: 'Gestionar el contenido del sitio' },
  formacion: { title: 'Formación', subtitle: 'Cursos, talleres y programa CIBIR' },
  cms: { title: 'Contenido', subtitle: 'Todas las secciones de la Landing' },
  cms_noticias: { title: 'Noticias', subtitle: 'Últimas novedades y artículos' },
  cms_cursos: { title: 'Cursos', subtitle: 'Programas de formación académica' },
  cms_convenios: { title: 'Convenios', subtitle: 'Alianzas y beneficios para afiliados' },
  cms_directiva: { title: 'Directiva', subtitle: 'Miembros de la Junta Directiva' },
  cms_hitos: { title: 'Historia', subtitle: 'Hitos históricos de la Cámara' },
  cms_config: { title: 'Configuración de Contenido', subtitle: 'Textos fijos e imágenes de la Landing' },
  media: { title: 'Medios', subtitle: 'Gestionar archivos e imágenes' },
  users: { title: 'Afiliados', subtitle: 'Directorio y gestión de afiliados' },
  analytics: { title: 'Análisis', subtitle: 'Métricas y rendimiento general' },
  settings: { title: 'Configuración del Sistema', subtitle: 'Ajustes del sistema y preferencias' },
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
