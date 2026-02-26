import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './features/landing/Home';

// Pages
import Cursos from './pages/Formacion/Talleres';
import MisionVision from './pages/MisionVision/MisionVision';
import JuntaDirectiva from './pages/Juntadirectiva/JuntaDirectiva';
import Historia from './pages/Historia/Historia';
import CIV from './pages/CIV/Civ';
import Direccion from './pages/Direccion/Direccion';
import Proposito from './pages/Proposito/Proposito';

export default function App() {
  return (
    <BrowserRouter basename="/Camara_inmobiliaria">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/talleres" element={<Cursos />} />
        <Route path='/mision_vision' element={<MisionVision />} />
        <Route path='/junta_directiva' element={<JuntaDirectiva />} />
        <Route path='/historia' element={<Historia />} />
        <Route path='/codigo_etica' element={<CIV />} />
        <Route path='/direccion' element={<Direccion />} />
        <Route path='/proposito' element={<Proposito />} />
      </Routes>
    </BrowserRouter>
  );
}