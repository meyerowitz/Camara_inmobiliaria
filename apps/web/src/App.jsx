
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Cursos from './features/landing/Talleres';
import Home from './features/landing/Home';

export default function LandingBolivar() {

  return (
    <BrowserRouter basename="/Camara_inmobiliaria" >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Cursos />} />
      </Routes>
    </BrowserRouter>
  );
}