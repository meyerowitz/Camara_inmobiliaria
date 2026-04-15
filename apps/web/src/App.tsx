import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LandingPage from '@/pages/landing/LandingPage'

// Pages
import CursosCatalogPage   from '@/pages/landing/courses/CursosCatalogPage'
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
import PreaniPage          from '@/pages/landing/courses/PREANI/PreaniPage'
import PegiPage            from '@/pages/landing/courses/PEGI/PegiPage'
import PadiPage            from '@/pages/landing/courses/PADI/PadiPage'
import VerificarPreinscripcionProgramaPage from '@/pages/landing/courses/VerificarPreinscripcionProgramaPage'
import SetupPasswordPage    from '@/pages/auth/SetupPasswordPage'
import LobbyPage           from '@/pages/lobby/LobbyPage'
import ComprobantePublicoPage from '@/pages/comprobante/ComprobantePublicoPage'
import ScrollToHash        from '@/components/ScrollToHash'
import Convenios from '@/pages/landing/marco-legal/convenios/comerciales'
import NormativasPage from '@/pages/landing/marco-legal/NormativasPage'

function PreservingQueryNavigate({ to }: { to: string }) {
  const [searchParams] = useSearchParams()
  const q = searchParams.toString()
  return <Navigate to={q ? `${to}?${q}` : to} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path='/'              element={<LandingPage />} />
          <Route path='/cursos'        element={<CursosCatalogPage />} />
          <Route path='/talleres'      element={<CursosCatalogPage />} />
          <Route path='/mision_vision' element={<MisionVisionPage />} />
          <Route path='/junta_directiva' element={<JuntaDirectivaPage />} />
          <Route path='/historia'      element={<HistoriaPage />} />
          <Route path='/codigo_etica'  element={<CivPage />} />
          <Route path='/direccion'     element={<DireccionPage />} />
          <Route path='/proposito'     element={<PropositoPage />} />
          <Route path='/cibir'         element={<CibirPage />} />
          <Route path='/cibir/verificar' element={<VerificarEmailPage />} />
          <Route path='/cursos/verificar' element={<VerificarPreinscripcionProgramaPage />} />
          <Route path='/formacion/verificar' element={<PreservingQueryNavigate to='/cursos/verificar' />} />
          <Route path='/convenios' element={<Convenios />} />
          <Route path='/normativas' element={<NormativasPage />} />
          <Route path='/directorio'    element={<DirectorioPage />} />
          <Route path='/comprobante/:codigo' element={<ComprobantePublicoPage />} />
          <Route path='/establecer-contrasena' element={<SetupPasswordPage />} />

          {/* Rutas Dinámicas */}
          <Route path='/preani' element={<PreaniPage />} />
          <Route path='/pegi'   element={<PegiPage />} />
          <Route path='/padi'   element={<PadiPage />} />
          
          {/* ── Panel Unificado (afiliado + admin en una sola vista) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path='/panel' element={<PanelPage />} />
            <Route path='/lobby' element={<LobbyPage />} />
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
