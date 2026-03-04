import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'

// Pages
import FormacionPage from './pages/formacion/FormacionPage'
import MisionVisionPage from './pages/mision-vision/MisionVisionPage'
import JuntaDirectivaPage from './pages/junta-directiva/JuntaDirectivaPage'
import HistoriaPage from './pages/historia/HistoriaPage'
import CivPage from './pages/civ/CivPage'
import AdminPage from './pages/admin/AdminPage'
import DireccionPage from './pages/direccion/DireccionPage'
import PropositoPage from './pages/proposito/PropositoPage'

export default function App() {
  return (
    <BrowserRouter basename='/Camara_inmobiliaria'>
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
      </Routes>
    </BrowserRouter>
  )
}
