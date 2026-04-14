import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

interface CursoDB {
  id_curso: number;
  id_instructor: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  programa_codigo: string | null;
  nivel_academico: string | null;
  cupos_totales: number;
  cupos_disponibles: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  precio: string | null;
  estatus: 'Abierto' | 'Cerrado' | 'En curso' | 'Próximamente';
  creado_en: string;
  actualizado_en: string | null;
  instructor_nombre?: string;
}

const STATUS_STYLES: Record<string, string> = {
  'Abierto': 'bg-emerald-50 text-emerald-600',
  'Próximamente': 'bg-blue-50 text-blue-500',
  'En curso': 'bg-amber-50 text-amber-600',
  'Cerrado': 'bg-slate-100 text-slate-500',
};

const NIVEL_STYLES: Record<string, string> = {
  'Principiante': 'bg-teal-50 text-teal-600',
  'Intermedio': 'bg-violet-50 text-violet-600',
  'Avanzado': 'bg-rose-50 text-rose-500',
  'Libre': 'bg-gray-50 text-gray-600',
};

const CursosAdminPanel = () => {
  const { token } = useAuth();
  const [cursos, setCursos] = useState<CursoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingCurso, setViewingCurso] = useState<CursoDB | null>(null);

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen_url: '',
    nivel_academico: 'Libre',
    cupos_totales: 30,
    precio: 'Gratis',
    fecha_inicio: '',
    estatus: 'Abierto',
    id_instructor: 1, // default
  });

  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  const fetchCursos = async () => {
    setLoading(true);
    try {
      // Usamos el endpoint sin estatus para traer todos en admin
      const res = await fetch(`${API_URL}/api/academia/cursos`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) {
        setCursos(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handleOpenModal = (curso?: CursoDB) => {
    if (curso) {
      setEditingId(curso.id_curso);
      setFormData({
        nombre: curso.nombre,
        descripcion: curso.descripcion || '',
        imagen_url: curso.imagen_url || '',
        nivel_academico: curso.nivel_academico || 'Libre',
        cupos_totales: curso.cupos_totales,
        precio: curso.precio || 'Gratis',
        fecha_inicio: curso.fecha_inicio || '',
        estatus: curso.estatus,
        id_instructor: curso.id_instructor || 1,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        descripcion: '',
        imagen_url: '',
        nivel_academico: 'Libre',
        cupos_totales: 30,
        precio: 'Gratis',
        fecha_inicio: '',
        estatus: 'Abierto',
        id_instructor: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/api/academia/cursos/${editingId}` : `${API_URL}/api/academia/cursos`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire('Éxito', `Curso ${editingId ? 'actualizado' : 'creado'} correctamente`, 'success');
        handleCloseModal();
        fetchCursos();
      } else {
        Swal.fire('Error', json.message || 'Error al guardar el curso', 'error');
      }
    } catch (error) {
       Swal.fire('Error', 'Problema de conexión al servidor', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "El curso cambiará a estado 'Cerrado' pero mantendrá su historial",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00D084',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/academia/cursos/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire('Cerrado', 'El curso ahora está cerrado.', 'success');
          fetchCursos();
        } else {
          Swal.fire('Error', json.message || 'No se pudo cerrar el curso', 'error');
        }
      } catch (error) {
         Swal.fire('Error', 'Problema de conexión al servidor', 'error');
      }
    }
  };

  if (viewingCurso) {
    return <ListaInscritosCurso curso={viewingCurso} onBack={() => { setViewingCurso(null); fetchCursos() }} token={token} />;
  }

  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full relative">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Cursos & Talleres</h3>
          <p className="text-xs text-slate-400 mt-0.5">{cursos.length} programas registrados</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00D084] text-white text-xs font-semibold hover:bg-[#00B870] transition-colors whitespace-nowrap"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Curso
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><span className="text-sm text-slate-500 font-semibold">Cargando cursos...</span></div>
      ) : (
        <>
          {/* ── MOBILE: cards ── */}
          <div className="sm:hidden flex flex-col gap-3">
            {cursos.map(c => (
              <div key={c.id_curso} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800 text-sm leading-tight flex-1">{c.nombre}</p>
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[c.estatus] || 'bg-gray-100'}`}>
                    {c.estatus}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                  <span>{c.instructor_nombre || 'Sin Instructor'}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${NIVEL_STYLES[c.nivel_academico || 'Libre'] || 'bg-gray-100'}`}>{c.nivel_academico || 'Libre'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>📅 {c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString() : 'Por definir'}</span>
                  <span className="font-semibold text-slate-700">{c.precio || 'Gratis'}</span>
                </div>
                {/* Cupos bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00D084] rounded-full" style={{ width: `${Math.max(0, Math.min(100, ((c.cupos_totales - c.cupos_disponibles) / c.cupos_totales) * 100))}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap tabular-nums">{(c.cupos_totales - c.cupos_disponibles)}/{c.cupos_totales} inscritos</span>
                </div>
                <div className="flex gap-2 mt-2 border-t pt-2 border-gray-50">
                  <button onClick={() => setViewingCurso(c)} className="text-xs text-[#00D084] font-semibold hover:underline">Inscritos</button>
                  <button onClick={() => handleOpenModal(c)} className="text-xs text-blue-600 font-semibold hover:underline">Editar</button>
                  <button onClick={() => handleDelete(c.id_curso)} className="text-xs text-red-500 font-semibold hover:underline">Cerrar</button>
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP: table with horizontal scroll fallback ── */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50/60">
                  {['CURSO', 'INSTRUCTOR', 'NIVEL', 'INSCRITOS', 'FECHA INICIO', 'PRECIO', 'ESTADO', 'ACCIONES'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 tracking-wide uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cursos.map(c => {
                  const ins = c.cupos_totales - c.cupos_disponibles;
                  return (
                  <tr key={c.id_curso} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 text-xs leading-tight max-w-[200px]">{c.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{c.instructor_nombre || 'Sin Instructor'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${NIVEL_STYLES[c.nivel_academico || 'Libre'] || 'bg-gray-100'}`}>{c.nivel_academico || 'Libre'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-16 overflow-hidden">
                          <div className="h-full bg-[#00D084] rounded-full" style={{ width: `${Math.max(0, Math.min(100, (ins / c.cupos_totales) * 100))}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap tabular-nums">{ins}/{c.cupos_totales}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString() : 'Por definir'}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 tabular-nums">{c.precio || 'Gratis'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[c.estatus] || 'bg-gray-100'}`}>{c.estatus}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                       <button onClick={() => setViewingCurso(c)} className="text-xs text-[#00D084] font-semibold hover:underline">Inscritos</button>
                       <button onClick={() => handleOpenModal(c)} className="text-xs text-blue-600 font-semibold hover:underline">Editar</button>
                       <button onClick={() => handleDelete(c.id_curso)} className="text-xs text-red-500 font-semibold hover:underline">Cerrar</button>
                    </td>
                  </tr>
                )})}
                {cursos.length === 0 && (
                   <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm font-semibold text-slate-400">
                      No hay cursos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{editingId ? 'Editar Curso' : 'Nuevo Curso'}</h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 font-bold p-1">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Nombre del Curso</label>
                  <input required
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                    value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Descripción</label>
                  <textarea 
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                    value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">URL de Imagen</label>
                  <input type="url"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                    value={formData.imagen_url} onChange={e => setFormData({...formData, imagen_url: e.target.value})} 
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Cupos Totales</label>
                    <input type="number" required min="1"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                      value={formData.cupos_totales} onChange={e => setFormData({...formData, cupos_totales: Number(e.target.value)})} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Precio (ej. $20.00)</label>
                    <input 
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                      value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Nivel</label>
                     <select
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                      value={formData.nivel_academico} onChange={e => setFormData({...formData, nivel_academico: e.target.value})} 
                    >
                      <option value="Libre">Libre</option>
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Estatus</label>
                     <select
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                      value={formData.estatus} onChange={e => setFormData({...formData, estatus: e.target.value})} 
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="Próximamente">Próximamente</option>
                      <option value="En curso">En curso</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Fecha de Inicio</label>
                    <input type="date"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-700 focus:outline-[#00D084]"
                      value={formData.fecha_inicio ? formData.fecha_inicio.substring(0, 10) : ''} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} 
                    />
                  </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#00D084] hover:bg-[#00B870] rounded-xl transition-colors shadow-[0_4px_12px_rgba(0,208,132,0.25)]">
                    {editingId ? 'Actualizar' : 'Guardar Curso'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const ListaInscritosCurso = ({ curso, onBack, token }: { curso: CursoDB, onBack: () => void, token: string | null }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ cursoId: curso.id_curso.toString(), estatus: 'Todos' });
      const res = await fetch(`${API_URL}/api/academia/preinscripciones?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setRows(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, [curso.id_curso]);

  const procesar = async (id: number, action: 'aprobar' | 'rechazar' | 'completar') => {
    try {
      const res = await fetch(`${API_URL}/api/academia/inscripciones/${id}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: action === 'rechazar' ? JSON.stringify({ notaAdmin: '' }) : undefined,
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({ title: 'Éxito', text: 'Estado actualizado', icon: 'success', timer: 1500, showConfirmButton: false });
        fetchRows();
      } else {
        Swal.fire('Error', json.message || 'Error al procesar', 'error');
      }
    } catch (e) {
      Swal.fire('Error', 'Fallo de conexión', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full bg-slate-50/50 absolute inset-0 z-40 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm tracking-tight text-slate-500 font-semibold group">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-lg sm:text-xl truncate">{curso.nombre}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Gestión de Inscritos</p>
          </div>
        </div>
        <div className="flex gap-3 text-xs font-semibold text-slate-500 bg-white/60 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm whitespace-nowrap overflow-x-auto">
          <span>Cupos Disponibles: <strong className="text-slate-800 tabular-nums">{curso.cupos_disponibles}</strong> / {curso.cupos_totales}</span>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-4 text-slate-400 h-full">
            <svg className="animate-spin w-8 h-8 text-[#00D084]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="font-semibold text-sm uppercase tracking-wider">Cargando inscritos...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-4 text-slate-400 h-full">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <span className="font-semibold text-base">No hay solicitudes registradas aún.</span>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-0 flex-1 h-full">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-gray-100">
                <tr>
                  <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 tracking-wider uppercase">Aspirante</th>
                  <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 tracking-wider uppercase">Documento / Contacto</th>
                  <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 tracking-wider uppercase">Fecha</th>
                  <th className="px-5 py-4 text-left text-[10px] font-bold text-slate-400 tracking-wider uppercase">Estado</th>
                  <th className="px-5 py-4 text-right text-[10px] font-bold text-slate-400 tracking-wider uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 h-full">
                {rows.map(r => (
                  <tr key={r.id_inscripcion} className="hover:bg-[#fcfdfd] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">{r.estudiante_nombre?.charAt(0)}</div>
                        <span className="font-bold text-slate-700">{r.estudiante_nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-slate-600">{r.estudiante_cedula_rif || 'S/N'}</div>
                      <div className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{r.estudiante_email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-500 tabular-nums">{new Date(r.creado_en).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      {r.completado === 1 ? (
                        <span className="text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1 w-max">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Completado
                        </span>
                      ) : (
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${
                          r.estatus === 'Preinscrito' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          r.estatus === 'Inscrito' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-red-50 text-red-500 border border-red-100'
                        }`}>{r.estatus === 'Preinscrito' ? 'Pendiente' : r.estatus === 'Inscrito' ? 'Aprobado' : r.estatus}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right flex justify-end gap-2 items-center opacity-70 group-hover:opacity-100 transition-opacity">
                       {r.estatus === 'Preinscrito' && (
                         <>
                           <button onClick={() => procesar(r.id_inscripcion, 'aprobar')} className="px-3 py-1.5 bg-[#00D084] text-white rounded-lg text-xs font-bold hover:bg-[#00B870] shadow-sm transform active:scale-95 transition-all">✓ Validar</button>
                           <button onClick={() => procesar(r.id_inscripcion, 'rechazar')} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-all">Rechazar</button>
                         </>
                       )}
                       {r.estatus === 'Inscrito' && r.completado !== 1 && (
                         <>
                           <button onClick={() => procesar(r.id_inscripcion, 'completar')} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] uppercase tracking-wide font-bold hover:bg-blue-100 transition-all flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg> Graduar</button>
                           <button onClick={() => procesar(r.id_inscripcion, 'rechazar')} className="px-3 py-1.5 border border-red-100 text-red-400 bg-white rounded-lg text-[10px] uppercase tracking-wide font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">Revocar</button>
                         </>
                       )}
                       {r.completado === 1 && (
                          <span className="text-xs text-slate-400 font-bold italic tracking-wide">Finalizado</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CursosAdminPanel;

