import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'

// Pages
import FormacionPage from './pages/landing/formacion/FormacionPage'
import MisionVisionPage from './pages/landing/mision-vision/MisionVisionPage'
import JuntaDirectivaPage from './pages/landing/junta-directiva/JuntaDirectivaPage'
import HistoriaPage from './pages/landing/historia/HistoriaPage'
import CivPage from './pages/landing/CIV/CivPage'
import AdminPage from './pages/admin/AdminPage'
import DireccionPage from './pages/landing/direccion/DireccionPage'
import PropositoPage from './pages/landing/proposito/PropositoPage'
import AfiliadoPage from './pages/afiliado/afiliadoPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/cursos' element={<FormacionPage />} />
        <Route path='/talleres' element={<FormacionPage />} />
        <Route path='/mision_vision' element={<MisionVisionPage />} />
        <Route path='/junta_directiva' element={<JuntaDirectivaPage />} />
        <Route path='/historia' element={<HistoriaPage />} />
        <Route path='/codigo_etica' element={<CivPage />} />
        <Route path='/direccion' element={<DireccionPage />} />
        <Route path='/proposito' element={<PropositoPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/afiliado' element={<AfiliadoPage />} />
      </Routes>
    </BrowserRouter>
  )
}
