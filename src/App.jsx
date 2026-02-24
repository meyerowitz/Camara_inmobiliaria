
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Cursos from './pages/Formacion/Talleres';
import Home from './Home';
//Pages
import MisionVision from './pages/MisionVision/MisionVision';
import JuntaDirectiva from './pages/Juntadirectiva/JuntaDirectiva';
import Historia from './pages/Historia/Historia';

export default function LandingBolivar() {
 
  return (
   <BrowserRouter basename="/Camara_inmobiliaria" >
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/talleres" element={<Cursos/>} />
        <Route path='/mision_vision' element={<MisionVision/>} />
        <Route path='/junta_directiva' element={<JuntaDirectiva/>} />
        <Route path='/historia' element={<Historia/>} />
      </Routes>
    </BrowserRouter>
  );
}