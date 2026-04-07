import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LandingPage from '@/pages/landing/LandingPage'

// Pages
import FormacionPage       from '@/pages/landing/formacion/FormacionPage'
import MisionVisionPage    from '@/pages/landing/mision-vision/MisionVisionPage'
import JuntaDirectivaPage  from '@/pages/landing/junta-directiva/JuntaDirectivaPage'
import HistoriaPage        from '@/pages/landing/historia/HistoriaPage'
import CivPage             from '@/pages/landing/courses/CIV/CivPage'
import AdminPage           from '@/pages/admin/AdminPage'
import DireccionPage       from '@/pages/landing/direccion/DireccionPage'
import PropositoPage       from '@/pages/landing/proposito/PropositoPage'
import PanelPage           from '@/pages/panel/PanelPage'
import CibirPage           from '@/pages/landing/courses/CIBIR/CibirPage'
import VerificarEmailPage  from '@/pages/landing/courses/CIBIR/VerificarEmailPage'
import DirectorioPage      from '@/pages/landing/directorio/DirectorioPage'
import GenericPageTemplate from '@/pages/landing/components/GenericPageTemplate'
import PreaniPage          from '@/pages/landing/formacion/PreaniPage'
import PegiPage            from '@/pages/landing/formacion/PegiPage'
import PadiPage            from '@/pages/landing/formacion/PadiPage'
import SetupPasswordPage    from '@/pages/auth/SetupPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path='/'              element={<LandingPage />} />
          <Route path='/cursos'        element={<FormacionPage />} />
          <Route path='/talleres'      element={<FormacionPage />} />
          <Route path='/mision_vision' element={<MisionVisionPage />} />
          <Route path='/junta_directiva' element={<JuntaDirectivaPage />} />
          <Route path='/historia'      element={<HistoriaPage />} />
          <Route path='/codigo_etica'  element={<CivPage />} />
          <Route path='/direccion'     element={<DireccionPage />} />
          <Route path='/proposito'     element={<PropositoPage />} />
          <Route path='/cibir'         element={<CibirPage />} />
          <Route path='/cibir/verificar' element={<VerificarEmailPage />} />
          <Route path='/directorio'    element={<DirectorioPage />} />
          <Route path='/establecer-contrasena' element={<SetupPasswordPage />} />

          {/* Rutas Dinámicas */}
          <Route path='/preani' element={<PreaniPage />} />
          <Route path='/pegi'   element={<PegiPage />} />
          <Route path='/padi'   element={<PadiPage />} />
          <Route path='/beneficios' element={<GenericPageTemplate pageKey="beneficios" />} />
          <Route path='/requisitos' element={<GenericPageTemplate pageKey="requisitos" />} />
          <Route path='/convenios-institucionales' element={<GenericPageTemplate pageKey="convenios-institucionales" />} />
          <Route path='/convenios-comerciales' element={<GenericPageTemplate pageKey="convenios-comerciales" />} />
          <Route path='/convenios-internacionales' element={<GenericPageTemplate pageKey="convenios-internacionales" />} />
          <Route path='/normativas' element={<GenericPageTemplate pageKey="normativas" />} />
          <Route path='/eventos' element={<GenericPageTemplate pageKey="eventos" />} />
          <Route path='/galeria' element={<GenericPageTemplate pageKey="galeria" />} />
          <Route path='/comunicados' element={<GenericPageTemplate pageKey="comunicados" />} />
          <Route path='/contacto' element={<GenericPageTemplate pageKey="contacto" />} />

          {/* ── Panel Unificado (afiliado + admin en una sola vista) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path='/panel' element={<PanelPage />} />
          </Route>

          {/* ── CMS Visual Editor (solo admin) ── */}
          <Route element={<ProtectedRoute requiredRoles={['admin', 'super_admin']} />}>
            <Route path='/admin' element={<AdminPage />} />
          </Route>

          {/* Redireccion de rutas antiguas al panel unificado */}
          <Route path='/afiliado' element={<Navigate to='/panel' replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
