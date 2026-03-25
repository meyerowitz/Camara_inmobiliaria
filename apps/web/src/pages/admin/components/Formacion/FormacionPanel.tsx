import React, { useState, useEffect } from 'react'
import { API_URL } from '@/config/env'
// ─── Types ────────────────────────────────────────────────────────────────────
type CibirStatus = 'Pendiente' | 'Aprobado' | 'Rechazado'
type CursoNivel = 'Principiante' | 'Intermedio' | 'Avanzado'

interface Solicitud {
  id: string
  nombre: string
  cedula: string
  email: string
  telefono: string
  empresa: string
  fechaSolicitud: string
  status: CibirStatus
  nota?: string
}

interface Curso {
  id: string
  titulo: string
  instructor: string
  nivel: CursoNivel
  inscritos: number
  cupos: number
  fecha: string
  precio: string
  status: 'Activo' | 'Próximamente' | 'Finalizado'
}

// --- Eliminado el mock SOLICITUDES ya que ahora se obtiene desde la BD ---

const CURSOS: Curso[] = [
  { id: '1', titulo: 'Diplomado en Derecho Inmobiliario', instructor: 'Abog. Luis Martínez', nivel: 'Avanzado', inscritos: 18, cupos: 25, fecha: 'Mar 15, 2026', precio: '$45.00', status: 'Activo' },
  { id: '2', titulo: 'Marketing Digital para Real Estate', instructor: 'Lic. Elena Pérez', nivel: 'Principiante', inscritos: 30, cupos: 30, fecha: 'Mar 20, 2026', precio: '$29.99', status: 'Activo' },
  { id: '3', titulo: 'Tasación de Inmuebles Urbanos', instructor: 'Ing. Carlos Ruiz', nivel: 'Intermedio', inscritos: 12, cupos: 20, fecha: 'Abr 5, 2026', precio: '$35.00', status: 'Próximamente' },
  { id: '4', titulo: 'Neuroventas para Corredores', instructor: 'Coach Mario Vargas', nivel: 'Intermedio', inscritos: 25, cupos: 25, fecha: 'Feb 10, 2026', precio: '$19.99', status: 'Finalizado' },
]

// ─── Status helpers ───────────────────────────────────────────────────────────
const CIBIR_STATUS_STYLES: Record<CibirStatus, string> = {
  Pendiente: 'bg-amber-50 text-amber-600',
  Aprobado: 'bg-emerald-50 text-emerald-600',
  Rechazado: 'bg-red-50 text-red-500',
}

const CURSO_STATUS_STYLES: Record<Curso['status'], string> = {
  'Activo': 'bg-emerald-50 text-emerald-600',
  'Próximamente': 'bg-blue-50 text-blue-500',
  'Finalizado': 'bg-slate-100 text-slate-500',
}

const NIVEL_STYLES: Record<CursoNivel, string> = {
  Principiante: 'bg-teal-50 text-teal-600',
  Intermedio: 'bg-violet-50 text-violet-600',
  Avanzado: 'bg-rose-50 text-rose-500',
}

// ─── CIBIR DETAIL ─────────────────────────────────────────────────────────────
const CibirDetail = ({
  selected,
  nota,
  setNota,
  onUpdate,
  onBack,
}: {
  selected: Solicitud
  nota: string
  setNota: (v: string) => void
  onUpdate: (id: string, status: CibirStatus) => void
  onBack?: () => void
}) => (
  <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto h-full">
    {/* Back button — visible only on mobile */}
    {onBack && (
      <button
        onClick={onBack}
        className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors self-start"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        Volver a la lista
      </button>
    )}

    {/* Header card */}
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 flex-wrap">
      <div className="w-11 h-11 rounded-full bg-[#E9FAF4] flex items-center justify-center text-[#00B870] font-black text-lg flex-shrink-0">
        {selected.nombre.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-900 leading-tight">{selected.nombre}</h3>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{selected.cedula} · {selected.empresa}</p>
      </div>
      <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${CIBIR_STATUS_STYLES[selected.status]}`}>
        {selected.status}
      </span>
    </div>

    {/* Info grid */}
    <div className="bg-white rounded-2xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { label: 'Email', value: selected.email },
        { label: 'Teléfono', value: selected.telefono },
        { label: 'Empresa', value: selected.empresa },
        { label: 'Fecha solicitud', value: selected.fechaSolicitud },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
          <span className="text-sm text-slate-700 font-medium break-all">{value}</span>
        </div>
      ))}
    </div>

    {/* Nota existente */}
    {selected.nota && (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">Nota interna</p>
        <p className="text-sm text-amber-800">{selected.nota}</p>
      </div>
    )}

    {/* Acciones para Pendiente */}
    {selected.status === 'Pendiente' && (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nota (opcional)</label>
        <textarea
          value={nota}
          onChange={e => setNota(e.target.value)}
          rows={2}
          placeholder="Agregar observación antes de procesar…"
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00D084]/40 focus:border-[#00D084] resize-none transition-all"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(selected.id, 'Aprobado')}
            className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-semibold hover:bg-[#00B870] transition-colors"
          >
            ✓ Aprobar
          </button>
          <button
            onClick={() => onUpdate(selected.id, 'Rechazado')}
            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            ✗ Rechazar
          </button>
        </div>
      </div>
    )}
  </div>
)

// ─── CIBIR PANEL ─────────────────────────────────────────────────────────────
const CibirPanel = ({ onCountsUpdate }: { onCountsUpdate?: (pendientes: number) => void }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [filter, setFilter] = useState<CibirStatus | 'Todos'>('Todos')
  const [selected, setSelected] = useState<Solicitud | null>(null)
  const [nota, setNota] = useState('')
  const [counts, setCounts] = useState({ Todos: 0, Pendiente: 0, Aprobado: 0, Rechazado: 0 })
  const [loading, setLoading] = useState(true)

  const fetchSolicitudes = async () => {
    setLoading(true)
    try {
      const tabParam = filter.toLowerCase();
      const res = await fetch(`${API_URL}/api/afiliados/cibir/solicitudes?tab=${tabParam}`)
      const json = await res.json()

      if (json.success) {
        const nuevosCuentas = {
          Todos: json.meta.counts.todos || 0,
          Pendiente: json.meta.counts.pendiente || 0,
          Aprobado: json.meta.counts.aprobado || 0,
          Rechazado: json.meta.counts.rechazado || 0,
        }
        setCounts(nuevosCuentas)
        if (onCountsUpdate) onCountsUpdate(nuevosCuentas.Pendiente)

        const mapped: Solicitud[] = json.data.map((item: { id_agremiado: string | number; nombre_completo: string; cedula_rif: string; email: string; telefono: string; estatus: string; fecha_registro: string }) => {
          let status: CibirStatus = 'Pendiente'
          if (item.estatus === 'CIBIR') status = 'Aprobado'
          if (item.estatus === 'Rechazado') status = 'Rechazado'

          return {
            id: String(item.id_agremiado),
            nombre: item.nombre_completo,
            cedula: item.cedula_rif,
            email: item.email,
            telefono: item.telefono || 'No indicado',
            empresa: 'Por definir',
            fechaSolicitud: new Date(item.fecha_registro).toLocaleDateString('es-ES', { month: 'short', day: '2-digit', year: 'numeric' }),
            status,
          }
        })
        setSolicitudes(mapped)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes()
    setSelected(null)
  }, [filter])

  const updateStatus = async (id: string, status: CibirStatus) => {
    try {
      if (status === 'Aprobado') {
        await fetch(`${API_URL}/api/afiliados/${id}/aprobar`, { method: 'PATCH' })
      } else if (status === 'Rechazado') {
        await fetch(`${API_URL}/api/afiliados/${id}/rechazar`, { method: 'PATCH' })
      }
      // Re-descargar información de servidor 
      setNota('')
      fetchSolicitudes()
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const filtered = solicitudes;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── List pane — hidden on mobile when detail is open ── */}
      <div className={[
        'flex flex-col bg-white border-r border-gray-100 overflow-hidden',
        'w-full sm:w-[300px] md:w-[340px] flex-shrink-0',
        // On mobile: hide list when detail is selected
        selected ? 'hidden sm:flex' : 'flex',
      ].join(' ')}>
        {/* Filter pills */}
        <div className="px-3 py-3 border-b border-gray-100 flex flex-wrap gap-1.5">
          {(['Todos', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1',
                filter === f ? 'bg-[#00D084] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {f}
              <span className={['px-1.5 rounded-full text-[9px] font-bold', filter === f ? 'bg-white/25' : 'bg-white text-slate-400'].join(' ')}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400 font-semibold uppercase tracking-widest mt-10">Cargando...</div>
          ) : filtered.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelected(s); setNota('') }}
              className={['w-full text-left px-4 py-3.5 transition-colors flex flex-col gap-1',
                selected?.id === s.id ? 'bg-[#E9FAF4]' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={['text-sm font-semibold truncate', selected?.id === s.id ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>
                  {s.nombre}
                </span>
                <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${CIBIR_STATUS_STYLES[s.status]}`}>
                  {s.status}
                </span>
              </div>
              <span className="text-xs text-slate-400 truncate">{s.cedula} · {s.empresa}</span>
              <span className="text-[10px] text-slate-300">{s.fechaSolicitud}</span>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400 mt-10">No hay solicitudes en esta vista.</div>
          )}
        </div>
      </div>

      {/* ── Detail pane ── */}
      <div className={[
        'flex-1 min-w-0 bg-gray-50',
        // On mobile: show detail full-width when selected, hide otherwise
        selected ? 'flex flex-col' : 'hidden sm:flex sm:flex-col',
      ].join(' ')}>
        {selected ? (
          <CibirDetail
            selected={selected}
            nota={nota}
            setNota={setNota}
            onUpdate={updateStatus}
            onBack={() => setSelected(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
            <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">Selecciona una solicitud</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CURSOS PANEL ─────────────────────────────────────────────────────────────
const CursosAdminPanel = () => {
  return (
    <div className="p-4 sm:p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Cursos & Talleres</h3>
          <p className="text-xs text-slate-400 mt-0.5">{CURSOS.length} programas registrados</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00D084] text-white text-xs font-semibold hover:bg-[#00B870] transition-colors whitespace-nowrap">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Curso
        </button>
      </div>

      {/* ── MOBILE: cards ── */}
      <div className="sm:hidden flex flex-col gap-3">
        {CURSOS.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-slate-800 text-sm leading-tight flex-1">{c.titulo}</p>
              <span className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${CURSO_STATUS_STYLES[c.status]}`}>
                {c.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span>{c.instructor}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${NIVEL_STYLES[c.nivel]}`}>{c.nivel}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>📅 {c.fecha}</span>
              <span className="font-semibold text-slate-700">{c.precio}</span>
            </div>
            {/* Cupos bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00D084] rounded-full" style={{ width: `${(c.inscritos / c.cupos) * 100}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap tabular-nums">{c.inscritos}/{c.cupos} cupos</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: table with horizontal scroll fallback ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gray-50/60">
              {['CURSO', 'INSTRUCTOR', 'NIVEL', 'INSCRITOS', 'FECHA', 'PRECIO', 'ESTADO'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 tracking-wide uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {CURSOS.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800 text-xs leading-tight max-w-[200px]">{c.titulo}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{c.instructor}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${NIVEL_STYLES[c.nivel]}`}>{c.nivel}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-16 overflow-hidden">
                      <div className="h-full bg-[#00D084] rounded-full" style={{ width: `${(c.inscritos / c.cupos) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap tabular-nums">{c.inscritos}/{c.cupos}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{c.fecha}</td>
                <td className="px-4 py-3 text-xs font-semibold text-slate-700 tabular-nums">{c.precio}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${CURSO_STATUS_STYLES[c.status]}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MAIN FORMACION PANEL ─────────────────────────────────────────────────────
type SubTab = 'cursos' | 'cibir'

const FormacionPanel = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('cursos')
  const [pendientesCount, setPendientesCount] = useState(0)

  // Cargar contadores globales al inicio para el badge del tab CIBIR
  useEffect(() => {
    const fetchGlobalCounts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/afiliados/cibir/solicitudes?tab=todos`)
        const json = await res.json()
        if (json.success) setPendientesCount(json.meta.counts.pendiente || 0)
      } catch (e) {
        console.error('Error fetching global counts', e)
      }
    }
    fetchGlobalCounts()
  }, [])

  const tabs: { id: SubTab; label: string; badge?: number }[] = [
    { id: 'cursos', label: 'Cursos & Talleres' },
    { id: 'cibir', label: 'CIBIR', badge: pendientesCount },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-nav tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-5 pt-4 pb-0 bg-white border-b border-gray-100 flex-shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.id
                ? 'text-[#00B870] border-[#00D084] bg-[#E9FAF4]'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}

        {activeTab === 'cibir' && (
          <span className="ml-auto mb-1 text-[10px] text-slate-400 font-medium hidden md:block whitespace-nowrap">
            Curso de Incorporación al Bienes Inmuebles Registrados
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'cursos' && <CursosAdminPanel />}
        {activeTab === 'cibir' && <CibirPanel onCountsUpdate={setPendientesCount} />}
      </div>
    </div>
  )
}

export default FormacionPanel
