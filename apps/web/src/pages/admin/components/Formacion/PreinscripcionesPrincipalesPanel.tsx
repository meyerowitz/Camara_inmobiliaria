import React, { useEffect, useMemo, useState } from 'react'
import { API_URL } from '@/config/env'
import { useAuth } from '@/context/AuthContext'

type ProgramaCodigo = 'PADI' | 'PEGI' | 'PREANI' | 'CIBIR' | 'AFILIACION'
type Estatus = 'Preinscrito' | 'Entrevista' | 'Inscrito' | 'Rechazado' | 'Cancelado'

type Row = {
  id_inscripcion: number
  programa_codigo: ProgramaCodigo
  estatus: Estatus
  creado_en: string
  estudiante_nombre: string
  estudiante_email: string
  estudiante_telefono: string | null
  estudiante_cedula_rif: string | null
  entrevista_fecha?: string
  entrevista_hora?: string
  entrevista_lugar?: string
}

export default function PreinscripcionesPrincipalesPanel({
  initialPrograma = 'Todos'
}: {
  initialPrograma?: ProgramaCodigo | 'Todos'
}) {
  const { token } = useAuth()
  const [programa, setPrograma] = useState<ProgramaCodigo | 'Todos'>(initialPrograma)
  type UiEstatus = 'Todos' | 'Pendiente' | 'Entrevista' | 'Aprobado' | 'Rechazado'
  const [uiEstatus, setUiEstatus] = useState<UiEstatus>('Pendiente')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [counts, setCounts] = useState({ Todos: 0, Pendiente: 0, Entrevista: 0, Aprobado: 0, Rechazado: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Row | null>(null)

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {}
    if (token) h.Authorization = `Bearer ${token}`
    return h
  }, [token])

  const [showModalAgendar, setShowModalAgendar] = useState(false)
  const [showModalFinalizar, setShowModalFinalizar] = useState(false)
  const [entrevista, setEntrevista] = useState({ fecha: '', hora: '', lugar: 'Sede Cámara Inmobiliaria' })
  const [finalizarData, setFinalizarData] = useState<{ resultado: 'Aprobado' | 'Parcial' | 'Rechazado', modulos: number[], nota: string }>({
    resultado: 'Aprobado',
    modulos: [1, 2, 3, 4, 5],
    nota: ''
  })

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (uiEstatus === 'Todos') qs.set('estatus', 'Todos')
      else if (uiEstatus === 'Pendiente') qs.set('estatus', 'Preinscrito')
      else if (uiEstatus === 'Entrevista') qs.set('estatus', 'Entrevista')
      else if (uiEstatus === 'Aprobado') qs.set('estatus', 'Inscrito')
      else if (uiEstatus === 'Rechazado') qs.set('estatus', 'Rechazado')

      if (programa !== 'Todos') qs.set('programaCodigo', programa)

      const res = await fetch(`${API_URL}/api/academia/preinscripciones?${qs.toString()}`, {
        headers: { ...authHeaders },
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Error cargando preinscripciones')

      const data = json.data as Row[]
      setRows(data)

      if (json.meta && json.meta.counts) {
        setCounts({
          Todos: json.meta.counts.Todos || 0,
          Pendiente: json.meta.counts.Pendiente || 0,
          Entrevista: json.meta.counts.Entrevista || 0,
          Aprobado: json.meta.counts.Aprobado || 0,
          Rechazado: json.meta.counts.Rechazado || 0,
        })
      }

      const urlParams = new URLSearchParams(window.location.search)
      const idFromUrl = urlParams.get('id')
      if (idFromUrl) {
        const found = data.find(r => r.id_inscripcion === Number(idFromUrl))
        if (found) setSelected(found)
      } else {
        setSelected(null)
      }
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

  const agendarEntrevista = async () => {
    if (!selected) return
    try {
      const res = await fetch(`${API_URL}/api/academia/inscripciones/${selected.id_inscripcion}/agendar-entrevista`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          entrevistaFecha: entrevista.fecha,
          entrevistaHora: entrevista.hora,
          entrevistaLugar: entrevista.lugar
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'No se pudo agendar')
      setShowModalAgendar(false)
      await fetchData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const finalizarEntrevista = async () => {
    if (!selected) return
    try {
      const res = await fetch(`${API_URL}/api/academia/inscripciones/${selected.id_inscripcion}/finalizar-entrevista`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          resultado: finalizarData.resultado,
          modulosConvalidados: finalizarData.modulos,
          notaAdmin: finalizarData.nota
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'No se pudo finalizar')
      setShowModalFinalizar(false)
      await fetchData()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const rechazar = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/academia/inscripciones/${id}/rechazar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ notaAdmin: '' }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'No se pudo rechazar')
      await fetchData()
    } catch (e: any) {
      setError(e.message)
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
    if (s === 'Entrevista') return 'bg-[#E6FBF3] text-[#00D084]'
    if (s === 'Inscrito') return 'bg-emerald-50 text-emerald-600'
    if (s === 'Rechazado') return 'bg-red-50 text-red-500'
    return 'bg-slate-100 text-slate-500'
  }

  return (
    <div className="flex h-full overflow-hidden relative">
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
              {(['Todos', 'AFILIACION', 'CIBIR', 'PADI', 'PEGI', 'PREANI'] as const).map(p => (
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
            {(['Todos', 'Pendiente', 'Entrevista', 'Aprobado', 'Rechazado'] as const).map(f => (
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

            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-2">
              {selected.estatus === 'Preinscrito' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModalAgendar(true)}
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-semibold hover:bg-[#00B870] transition-colors"
                  >
                    Agendar Entrevista
                  </button>
                  <button
                    onClick={() => rechazar(selected.id_inscripcion)}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              )}
              {selected.estatus === 'Entrevista' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-[#E6FBF3] border border-[#00D084]/20 rounded-xl p-3">
                    <p className="text-[11px] font-bold text-[#00D084] uppercase tracking-wider mb-1">Cita Programada</p>
                    <p className="text-xs text-[#00B870]">
                      {selected.entrevista_fecha} a las {selected.entrevista_hora} <br />
                      <span className="opacity-70">{selected.entrevista_lugar}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModalFinalizar(true)}
                      className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-semibold hover:bg-[#00B870] transition-colors shadow-lg shadow-[#00D084]/20"
                    >
                      Dar Veredicto Final
                    </button>
                    <button
                      onClick={() => setShowModalAgendar(true)}
                      className="px-4 py-2.5 rounded-xl border border-[#00D084]/20 text-[#00D084] text-sm font-semibold hover:bg-emerald-50 transition-colors"
                    >
                      Reprogramar
                    </button>
                  </div>
                </div>
              )}
            </div>
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
      {/* Modal Agendar Entrevista */}
      {showModalAgendar && selected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#00D084] p-6 text-white relative">
              <h3 className="text-xl font-bold">Agendar Entrevista</h3>
              <p className="text-white/80 text-sm mt-1">Programa: {selected.programa_codigo}</p>
              <button
                onClick={() => setShowModalAgendar(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha de Entrevista</label>
                <input
                  type="date"
                  value={entrevista.fecha}
                  onChange={e => setEntrevista({ ...entrevista, fecha: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Hora</label>
                <input
                  type="time"
                  value={entrevista.hora}
                  onChange={e => setEntrevista({ ...entrevista, hora: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Lugar</label>
                <input
                  type="text"
                  value={entrevista.lugar}
                  onChange={e => setEntrevista({ ...entrevista, lugar: e.target.value })}
                  placeholder="Ej: Sede Cámara Inmobiliaria"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={agendarEntrevista}
                  disabled={!entrevista.fecha || !entrevista.hora || !entrevista.lugar}
                  className="w-full py-4 rounded-2xl bg-[#00D084] text-white font-bold shadow-lg shadow-[#00D084]/20 hover:bg-[#00B870] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  Confirmar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Finalizar Entrevista */}
      {showModalFinalizar && selected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#00D084] p-6 text-white relative">
              <h3 className="text-xl font-bold">Veredicto de la Entrevista</h3>
              <p className="text-white/80 text-sm mt-1">{selected.estudiante_nombre}</p>
              <button
                onClick={() => setShowModalFinalizar(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Resultado Final</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Aprobado', 'Parcial', 'Rechazado'] as const).map(res => (
                    <button
                      key={res}
                      onClick={() => setFinalizarData({ ...finalizarData, resultado: res, modulos: res === 'Aprobado' ? [1, 2, 3, 4, 5] : finalizarData.modulos })}
                      className={[
                        'py-2 px-3 rounded-xl text-xs font-bold border transition-all',
                        finalizarData.resultado === res
                          ? 'bg-[#00D084] border-[#00D084] text-white shadow-md'
                          : 'bg-white border-gray-200 text-slate-500 hover:bg-gray-50'
                      ].join(' ')}
                    >
                      {res === 'Parcial' ? 'Parcial (CIEBO)' : res}
                    </button>
                  ))}
                </div>
              </div>

              {finalizarData.resultado === 'Parcial' && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Módulos Convalidados (CIEBO)</label>
                    <span className="text-[10px] font-bold bg-emerald-100 text-[#00D084] px-2 py-0.5 rounded-full">{finalizarData.modulos.length}/5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(m => {
                      const active = finalizarData.modulos.includes(m)
                      return (
                        <button
                          key={m}
                          onClick={() => {
                            const next = active ? finalizarData.modulos.filter(x => x !== m) : [...finalizarData.modulos, m]
                            setFinalizarData({ ...finalizarData, modulos: next })
                          }}
                          className={[
                            'h-12 rounded-xl border flex flex-col items-center justify-center transition-all',
                            active ? 'bg-white border-[#00D084] text-[#00D084] shadow-sm' : 'bg-gray-100 border-transparent text-slate-400 opacity-60'
                          ].join(' ')}
                        >
                          <span className="text-[10px] font-bold">M{m}</span>
                          <div className={['w-1.5 h-1.5 rounded-full mt-1', active ? 'bg-[#00D084]' : 'bg-slate-300'].join(' ')} />
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Marca los módulos que el aspirante ya conoce o ha convalidado por experiencia.</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nota Administrativa (Opcional)</label>
                <textarea
                  value={finalizarData.nota}
                  onChange={e => setFinalizarData({ ...finalizarData, nota: e.target.value })}
                  placeholder="Observaciones de la entrevista..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] outline-none transition-all h-20 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={finalizarEntrevista}
                  className="w-full py-4 rounded-2xl bg-[#00D084] text-white font-bold shadow-lg shadow-[#00D084]/20 hover:bg-[#00B870] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Finalizar Proceso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
