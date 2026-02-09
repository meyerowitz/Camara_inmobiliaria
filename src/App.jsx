
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Cursos from './Talleres';
import Home from './Home';

export default function LandingBolivar() {
 
  return (
   <BrowserRouter basename="/Camara_inmobiliaria" >
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/cursos" element={<Cursos/>} />
      </Routes>
    </BrowserRouter>
  );
}