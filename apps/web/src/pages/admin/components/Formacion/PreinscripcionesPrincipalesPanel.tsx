import React, { useEffect, useMemo, useState } from 'react'
import { API_URL } from '@/config/env'
import { useAuth } from '@/context/AuthContext'

type ProgramaCodigo = 'PADI' | 'PEGI' | 'PREANI' | 'CIBIR'
type Estatus = 'Preinscrito' | 'Inscrito' | 'Rechazado' | 'Cancelado'

type Row = {
  id_inscripcion: number
  programa_codigo: ProgramaCodigo
  estatus: Estatus
  creado_en: string
  estudiante_nombre: string
  estudiante_email: string
  estudiante_telefono: string | null
  estudiante_cedula_rif: string | null
}

export default function PreinscripcionesPrincipalesPanel() {
  const { token } = useAuth()
  const [programa, setPrograma] = useState<ProgramaCodigo | 'Todos'>('Todos')
  type UiEstatus = 'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado'
  const [uiEstatus, setUiEstatus] = useState<UiEstatus>('Pendiente')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [counts, setCounts] = useState({ Todos: 0, Pendiente: 0, Aprobado: 0, Rechazado: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Row | null>(null)

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {}
    if (token) h.Authorization = `Bearer ${token}`
    return h
  }, [token])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      // Map UI estatus to DB estatus
      if (uiEstatus === 'Todos') qs.set('estatus', 'Todos')
      else if (uiEstatus === 'Pendiente') qs.set('estatus', 'Preinscrito')
      else if (uiEstatus === 'Aprobado') qs.set('estatus', 'Inscrito')
      else if (uiEstatus === 'Rechazado') qs.set('estatus', 'Rechazado')

      if (programa !== 'Todos') qs.set('programaCodigo', programa)

      const res = await fetch(`${API_URL}/api/academia/preinscripciones?${qs.toString()}`, {
        headers: { ...authHeaders },
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Error cargando preinscripciones')
      setRows(json.data as Row[])
      if (json.meta && json.meta.counts) {
        setCounts({
          Todos: json.meta.counts.Todos || 0,
          Pendiente: json.meta.counts.Pendiente || 0,
          Aprobado: json.meta.counts.Aprobado || 0,
          Rechazado: json.meta.counts.Rechazado || 0,
        })
      }
      setSelected(null)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [programa, uiEstatus, token])

  const procesar = async (id: number, action: 'aprobar' | 'rechazar') => {
    try {
      const res = await fetch(`${API_URL}/api/academia/inscripciones/${id}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: action === 'rechazar' ? JSON.stringify({ notaAdmin: '' }) : undefined,
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'No se pudo procesar')
      await fetchData()
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || 'Error inesperado')
    }
  }

  const filteredRows = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.estudiante_nombre?.toLowerCase().includes(q) ||
      r.estudiante_email?.toLowerCase().includes(q) ||
      r.estudiante_cedula_rif?.toLowerCase().includes(q)
    )
  }, [rows, search])

  const mapStatusUI = (s: Estatus) => {
    if (s === 'Preinscrito') return 'Pendiente'
    if (s === 'Inscrito') return 'Aprobado'
    return s
  }
  const getStatusStyles = (s: Estatus) => {
    if (s === 'Preinscrito') return 'bg-amber-50 text-amber-600'
    if (s === 'Inscrito') return 'bg-emerald-50 text-emerald-600'
    if (s === 'Rechazado') return 'bg-red-50 text-red-500'
    return 'bg-slate-100 text-slate-500'
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* List */}
      <div className={['flex flex-col bg-white border-r border-gray-100 overflow-hidden w-full sm:w-[340px] flex-shrink-0', selected ? 'hidden sm:flex' : 'flex'].join(' ')}>

        <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex flex-col gap-2">
          {/* Buscar aspirante */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /></svg>
            <input
              type="text"
              placeholder="Buscar aspirante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-slate-700 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {(['Todos', 'CIBIR', 'PADI', 'PEGI', 'PREANI'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPrograma(p)}
                  className={[
                    'text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border',
                    programa === p 
                      ? 'bg-[#00D084] border-[#00D084] text-white' 
                      : 'bg-white border-gray-200 text-slate-500 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {(['Todos', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map(f => (
              <button
                key={f}
                onClick={() => setUiEstatus(f)}
                className={[
                  'text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1',
                  uiEstatus === f ? 'bg-[#00D084] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200',
                ].join(' ')}
              >
                {f}
                <span className={['px-1.5 rounded-full text-[9px] font-bold', uiEstatus === f ? 'bg-white/25' : 'bg-white text-slate-400'].join(' ')}>
                  {counts[f] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400 font-semibold uppercase tracking-widest mt-10">Cargando...</div>
          ) : error ? (
            <div className="p-4 text-center text-xs text-red-500 mt-10">{error}</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 mt-10">No hay registros.</div>
          ) : (
            filteredRows.map(r => (
              <button
                key={r.id_inscripcion}
                onClick={() => setSelected(r)}
                className={['w-full text-left px-4 py-3.5 transition-colors flex flex-col gap-1',
                  selected?.id_inscripcion === r.id_inscripcion ? 'bg-[#E9FAF4]' : 'hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={['text-sm font-semibold truncate', selected?.id_inscripcion === r.id_inscripcion ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>
                    {r.estudiante_nombre}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusStyles(r.estatus)}`}>
                    {mapStatusUI(r.estatus)}
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">{r.programa_codigo} • {r.estudiante_cedula_rif || 'S/N'}</span>
                <span className="text-[10px] text-slate-300">{new Date(r.creado_en).toLocaleDateString('es-ES', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className={['flex-1 min-w-0 bg-gray-50', selected ? 'flex flex-col' : 'hidden sm:flex sm:flex-col'].join(' ')}>
        {selected ? (
          <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto h-full">
            <button
              onClick={() => setSelected(null)}
              className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors self-start"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              Volver a la lista
            </button>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 flex-wrap">
              <div className="w-11 h-11 rounded-full bg-[#E9FAF4] flex items-center justify-center text-[#00B870] font-black text-lg flex-shrink-0">
                {selected.estudiante_nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{selected.estudiante_nombre}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{selected.estudiante_cedula_rif || 'Sin documento'}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusStyles(selected.estatus)}`}>
                  {mapStatusUI(selected.estatus)}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {selected.programa_codigo}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Cédula/RIF</span>
                <span className="text-sm text-slate-700 font-medium break-all">{selected.estudiante_cedula_rif || 'No indicado'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Teléfono</span>
                <span className="text-sm text-slate-700 font-medium break-all">{selected.estudiante_telefono || 'No indicado'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Email</span>
                <span className="text-sm text-slate-700 font-medium break-all">{selected.estudiante_email}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fecha de Solicitud</span>
                <span className="text-sm text-slate-700 font-medium break-all">{new Date(selected.creado_en).toLocaleString('es-ES')}</span>
              </div>
            </div>

            {selected.estatus === 'Preinscrito' && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-2">
                <button
                  onClick={() => procesar(selected.id_inscripcion, 'aprobar')}
                  className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-semibold hover:bg-[#00B870] transition-colors"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => procesar(selected.id_inscripcion, 'rechazar')}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  ✗ Rechazar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
            <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">Selecciona una preinscripción</p>
          </div>
        )}
      </div>
    </div>
  )
}

