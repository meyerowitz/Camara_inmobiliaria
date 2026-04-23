import React, { useEffect, useMemo, useState } from 'react'
import { API_URL } from '@/config/env'
import { useAuth } from '@/context/AuthContext'

type EstatusAgremiado = 
  | '1_SOLICITUD' | '2_REQUISITOS' | '3_CONFIRMACION' 
  | '4_RECEPCION' | '5_ENTREVISTA' | '6_JUNTA_DIRECTIVA' 
  | '7_RESULTADO' | '8_FORMALIZACION' | '9_AFILIACION'
  | 'Moroso' | 'Suspendido' | 'Rechazado' | 'Preinscrito' | 'CIBIR'

type Agremiado = {
  id_agremiado: number
  codigo_cibir: string | null
  cedula_rif: string
  nombre_completo: string
  nombres: string | null
  apellidos: string | null
  razon_social: string | null
  cedula_personal: string | null
  tipo_afiliado: 'Natural' | 'Juridico'
  email: string
  telefono: string | null
  direccion: string | null
  fecha_nacimiento: string | null
  nivel_academico: string | null
  notas: string | null
  estatus: EstatusAgremiado
  cibir_convalidado?: number
  inscripcion_pagada: number
  fecha_registro: string
  fecha_ultimo_cambio_estatus: string | null
}

export default function AfiliadosPanel() {
  const { token } = useAuth()
  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {}
    if (token) h.Authorization = `Bearer ${token}`
    return h
  }, [token])

  const [estatus, setEstatus] = useState<'Todos' | EstatusAgremiado>('Todos')
  const [filterTipo, setFilterTipo] = useState<'Todos' | 'Natural' | 'Juridico'>('Todos')
  const [items, setItems] = useState<Agremiado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Agremiado | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (estatus !== 'Todos') qs.set('estatus', estatus)
      if (filterTipo !== 'Todos') qs.set('tipo_afiliado', filterTipo)
      
      const res = await fetch(`${API_URL}/api/afiliados?${qs.toString()}`, { headers: authHeaders })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Error cargando afiliados')
      setItems(json.data as Agremiado[])
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const loadDetail = async (id: number) => {
    setDetailLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/afiliados/${id}`, { headers: authHeaders })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Error cargando detalle')
      setSelected(json.data as Agremiado)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || 'Error inesperado')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateField = async (field: keyof Agremiado, value: any) => {
    if (!selected) return
    try {
      const res = await fetch(`${API_URL}/api/afiliados/${selected.id_agremiado}`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      if (res.ok) {
        await loadDetail(selected.id_agremiado)
        if (['estatus', 'nombre_completo', 'codigo_cibir', 'tipo_afiliado'].includes(field)) await load()
      }
    } catch (err) { console.error(err) }
  }

  useEffect(() => { load() }, []) // initial
  useEffect(() => { load() }, [estatus, filterTipo]) // reload on filter

  const procesar = async (id: number, action: 'aprobar' | 'rechazar') => {
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/afiliados/${id}/${action}`, { method: 'PATCH', headers: authHeaders })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'No se pudo procesar')
      await load()
      await loadDetail(id)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || 'Error inesperado')
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* List */}
      <div className="flex flex-col bg-white border-r border-gray-100 overflow-hidden w-full sm:w-[360px] flex-shrink-0">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Afiliados / Agremiados (CIBIR)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Gestión de candidatos, aprobaciones y estatus.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <select
              value={estatus}
              onChange={(e) => setEstatus(e.target.value as any)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-[11px] font-bold text-slate-700 bg-slate-50"
            >
              <option value="Todos">Todos los estados</option>
              <optgroup label="Proceso de Afiliación">
                <option value="1_SOLICITUD">1. Solicitud</option>
                <option value="2_REQUISITOS">2. Requisitos</option>
                <option value="3_CONFIRMACION">3. Confirmación</option>
                <option value="4_RECEPCION">4. Recepción</option>
                <option value="5_ENTREVISTA">5. Entrevista</option>
                <option value="6_JUNTA_DIRECTIVA">6. Junta Directiva</option>
                <option value="7_RESULTADO">7. Resultado</option>
                <option value="8_FORMALIZACION">8. Formalización</option>
              </optgroup>
              <optgroup label="Estados Finales">
                <option value="9_AFILIACION">9. Afiliación (CIBIR)</option>
                <option value="Moroso">Moroso</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Rechazado">Rechazado</option>
              </optgroup>
            </select>

            <div className="flex gap-2">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value as any)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-[11px] font-bold text-slate-700 bg-slate-50"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Natural">Independientes</option>
                <option value="Juridico">Corporativos</option>
              </select>
              <button
                onClick={load}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 transition-colors"
              >
                Refrescar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-400 font-semibold uppercase tracking-widest mt-10">Cargando...</div>
          ) : error ? (
            <div className="p-4 text-center text-xs text-red-500 mt-10">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 mt-10">Sin resultados.</div>
          ) : (
            items.map(a => (
              <button
                key={a.id_agremiado}
                onClick={() => loadDetail(a.id_agremiado)}
                className={['w-full text-left px-4 py-3.5 transition-colors flex flex-col gap-1',
                  selected?.id_agremiado === a.id_agremiado ? 'bg-[#E9FAF4]' : 'hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-slate-800">{a.nombre_completo}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${a.tipo_afiliado === 'Juridico' ? 'text-emerald-600' : 'text-blue-500'}`}>
                      {a.tipo_afiliado === 'Juridico' ? 'Corporativo' : 'Independiente'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                    {a.estatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">{a.email}</span>
                <span className="text-[10px] text-slate-300">
                  #{a.id_agremiado} · {a.codigo_cibir || 'sin código'} · {new Date(a.fecha_registro).toLocaleDateString('es-ES')}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 min-w-0 bg-gray-50 hidden sm:flex sm:flex-col">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
            <p className="text-sm font-medium">Selecciona un afiliado</p>
          </div>
        ) : detailLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
            <p className="text-sm font-medium">Cargando detalle...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-y-auto scrollbar-hide h-full">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <select
                      value={selected.tipo_afiliado}
                      onChange={(e) => updateField('tipo_afiliado', e.target.value)}
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-500 border-none focus:ring-0 cursor-pointer"
                    >
                      <option value="Natural">Natural</option>
                      <option value="Juridico">Juridico</option>
                    </select>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {selected.tipo_afiliado === 'Juridico' ? (selected.razon_social || selected.nombre_completo) : selected.nombre_completo}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                    {selected.estatus.replace(/_/g, ' ')}
                  </span>
                  {selected.codigo_cibir && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                      {selected.codigo_cibir}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Información del Perfil</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selected.tipo_afiliado === 'Juridico' && (
                  <div className="col-span-full flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Razón Social</label>
                    <input 
                      type="text" 
                      value={selected.razon_social || ''} 
                      onChange={(e) => updateField('razon_social', e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                )}
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nombres</label>
                  <input 
                    type="text" 
                    value={selected.nombres || ''} 
                    onChange={(e) => updateField('nombres', e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Apellidos</label>
                  <input 
                    type="text" 
                    value={selected.apellidos || ''} 
                    onChange={(e) => updateField('apellidos', e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cédula / RIF</label>
                  <input 
                    type="text" 
                    value={selected.cedula_rif || ''} 
                    disabled
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cédula Personal</label>
                  <input 
                    type="text" 
                    value={selected.cedula_personal || ''} 
                    onChange={(e) => updateField('cedula_personal', e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</label>
                  <input 
                    type="text" 
                    value={selected.telefono || ''} 
                    onChange={(e) => updateField('telefono', e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Nacimiento</label>
                  <input 
                    type="text" 
                    value={selected.fecha_nacimiento || ''} 
                    onChange={(e) => updateField('fecha_nacimiento', e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div className="col-span-full flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dirección</label>
                  <textarea 
                    value={selected.direccion || ''} 
                    onChange={(e) => updateField('direccion', e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Process Management */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gestión del Proceso</h4>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Estado Actual</label>
                <select 
                  value={selected.estatus}
                  onChange={(e) => updateField('estatus', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700"
                >
                  <option value="1_SOLICITUD">1. Solicitud de Afiliación</option>
                  <option value="2_REQUISITOS">2. Requisitos</option>
                  <option value="3_CONFIRMACION">3. Confirmación</option>
                  <option value="4_RECEPCION">4. Recepción</option>
                  <option value="5_ENTREVISTA">5. Entrevista</option>
                  <option value="6_JUNTA_DIRECTIVA">6. Junta Directiva</option>
                  <option value="7_RESULTADO">7. Resultado</option>
                  <option value="8_FORMALIZACION">8. Formalización</option>
                  <option value="9_AFILIACION">9. Afiliación (CIBIR)</option>
                  <option value="Moroso">Moroso</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <input 
                  type="checkbox" 
                  id="cibir_convalidado"
                  checked={!!selected.cibir_convalidado}
                  onChange={(e) => updateField('cibir_convalidado', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="cibir_convalidado" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Convalidar conocimientos CIBIR (Vía Entrevista)
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <input 
                  type="checkbox" 
                  id="inscripcion_pagada"
                  checked={!!selected.inscripcion_pagada}
                  onChange={(e) => updateField('inscripcion_pagada', e.target.checked ? 1 : 0)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="inscripcion_pagada" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Cuota de inscripción pagada
                </label>
              </div>

              {['1_SOLICITUD', '6_JUNTA_DIRECTIVA'].includes(selected.estatus) && (
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => procesar(selected.id_agremiado, 'aprobar')}
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-bold hover:bg-[#00B870] shadow-sm shadow-emerald-200 transition-all hover:-translate-y-0.5"
                  >
                    ✓ Aprobar (A Paso 7)
                  </button>
                  <button
                    onClick={() => procesar(selected.id_agremiado, 'rechazar')}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    ✗ Rechazar
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl p-4">{error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

