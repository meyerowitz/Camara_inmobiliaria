import React, { useEffect, useMemo, useState } from 'react'
import { API_URL } from '@/config/env'
import { useAuth } from '@/context/AuthContext'
import { formatNombreCard } from '@/utils/formatters'

import {
  UserPlus, Search, Filter, RefreshCw, Trash2, Edit3, Save, X,
  ChevronRight, Building2, User as UserIcon, CheckCircle2, AlertCircle,
  Mail, Phone, MapPin, BadgeCheck, FileText, Calendar, CreditCard,
  ShieldAlert
} from 'lucide-react'

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
  estatus: string
  inscripcion_pagada: number
  fecha_registro: string
  id_agremiado_corp: number | null
  corp_razon_social: string | null
  corp_rif: string | null
  representante_legal: string | null
  instagram: string | null
  facebook: string | null
  linkedin: string | null
  twitter: string | null
  website: string | null
  activo: number
}

const ID_PREFIXES = ['V', 'E', 'J', 'G', 'P']

export default function MiembrosPanel() {
  const { token } = useAuth()
  const authHeaders = useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token])

  const [items, setItems] = useState<Agremiado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<'Todos' | 'Natural' | 'Juridico'>('Todos')

  const [selected, setSelected] = useState<Agremiado | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Agremiado>>({})
  const [companies, setCompanies] = useState<Agremiado[]>([])

  const [showNewModal, setShowNewModal] = useState(false)
  const [newForm, setNewForm] = useState<Partial<Agremiado>>({
    tipo_afiliado: 'Natural',
    estatus: '9_AFILIACION'
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/afiliados`, { headers: authHeaders })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Error cargando miembros')
      const all = json.data as Agremiado[]
      setItems(all)
      setCompanies(all.filter(i => i.tipo_afiliado === 'Juridico'))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
        item.cedula_rif.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
      const matchTipo = filterTipo === 'Todos' || item.tipo_afiliado === filterTipo
      return matchSearch && matchTipo
    })
  }, [items, search, filterTipo])

  const handleEdit = (item: Agremiado) => {
    setSelected(item)
    setEditForm(item)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selected) return
    try {
      const res = await fetch(`${API_URL}/api/afiliados/${selected.id_agremiado}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(editForm)
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setIsEditing(false)
        load()
        setSelected(json.data)
      } else {
        alert(json.message || 'Error al actualizar')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este afiliado? Esta acción no se puede deshacer.')) return
    try {
      const res = await fetch(`${API_URL}/api/afiliados/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      })
      if (res.ok) {
        setSelected(null)
        load()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_URL}/api/afiliados`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newForm)
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setShowNewModal(false)
        setNewForm({ tipo_afiliado: 'Natural', estatus: '9_AFILIACION' })
        load()
      } else {
        alert(json.message || 'Error al crear')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const ACADEMIC_OPTIONS = [
    { value: 'Bachiller', label: 'Bachiller' },
    { value: 'TSU', label: 'Técnico Superior (TSU)' },
    { value: 'Universitario', label: 'Universitario' },
    { value: 'Postgrado', label: 'Postgrado' },
  ]

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* Sidebar de Lista */}
      <div className="w-full sm:w-80 border-r border-gray-100 flex flex-col min-h-0 overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Directorio</h2>
            <button
              onClick={() => setShowNewModal(true)}
              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
            >
              <UserPlus size={18} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Buscar miembro..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterTipo('Todos')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${filterTipo === 'Todos' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-gray-200 hover:border-slate-300'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterTipo('Natural')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${filterTipo === 'Natural' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-gray-200 hover:border-slate-300'}`}
            >
              Indep.
            </button>
            <button
              onClick={() => setFilterTipo('Juridico')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${filterTipo === 'Juridico' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-gray-200 hover:border-slate-300'}`}
            >
              Corp.
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 text-center"><RefreshCw size={24} className="animate-spin text-emerald-500 mx-auto" /></div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No se encontraron miembros</div>
          ) : (
            filteredItems.map(item => (
              <button
                key={item.id_agremiado}
                onClick={() => { setSelected(item); setIsEditing(false); }}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors group flex items-center justify-between ${selected?.id_agremiado === item.id_agremiado ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{formatNombreCard(item.nombre_completo)}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${item.tipo_afiliado === 'Juridico' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.tipo_afiliado === 'Juridico' ? 'Corporativo' : 'Independiente'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.cedula_rif}</span>
                  </div>
                </div>
                <ChevronRight size={14} className={`text-slate-300 group-hover:translate-x-1 transition-transform ${selected?.id_agremiado === item.id_agremiado ? 'text-emerald-500' : ''}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Panel de Detalle / Edición */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30 p-6 sm:p-8">
        {!selected ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
              <BadgeCheck size={40} strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-600">Selecciona un miembro</p>
              <p className="text-xs">Para visualizar o editar su información completa</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Cabecera de Detalle */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 flex gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => handleEdit(selected)}
                      className="p-2.5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(selected.id_agremiado)}
                      className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="p-2.5 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                      title="Guardar"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner ${selected.tipo_afiliado === 'Juridico' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {selected.tipo_afiliado === 'Juridico' ? <Building2 size={40} /> : <UserIcon size={40} />}
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {isEditing ? (
                        <input
                          className="bg-slate-50 border-b-2 border-emerald-500 outline-none px-2 py-1"
                          value={editForm.nombre_completo || ''}
                          onChange={(e) => setEditForm({ ...editForm, nombre_completo: e.target.value })}
                        />
                      ) : formatNombreCard(selected.nombre_completo)}
                    </h2>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado en Directorio:</span>
                      <button
                        onClick={() => setEditForm({ ...editForm, activo: editForm.activo ? 0 : 1 })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${editForm.activo ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-600'}`}
                      >
                        {editForm.activo ? <CheckCircle2 size={14} /> : <X size={14} />}
                        {editForm.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1">
                    <DataField
                      label="Código CIBIR"
                      value={selected.codigo_cibir || 'Sin Código'}
                      isEditing={isEditing}
                      fieldName="codigo_cibir"
                      form={editForm}
                      setForm={setEditForm}
                      className="!bg-transparent !p-0 !border-none !text-slate-400 !font-bold !text-sm !uppercase !tracking-widest"
                      labelClassName="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Datos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal / Legal */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <FileText size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Identificación y Perfil</h3>
                </div>

                <div className="space-y-4">
                  {/* Cédula del Afiliado */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Cédula del Afiliado
                    </label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <select
                          className="w-20 bg-slate-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                          value={editForm.cedula_rif?.split('-')[0] || 'V'}
                          onChange={(e) => {
                            // Al cambiar el prefijo, mantenemos el resto del string tal cual
                            const parts = (editForm.cedula_rif || '').split('-');
                            const rest = parts.slice(1).join('-');
                            setEditForm({ ...editForm, cedula_rif: `${e.target.value}-${rest}` })
                          }}
                        >
                          {ID_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input
                          type="text"
                          className="flex-1 bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                          value={(editForm.cedula_rif || '').split('-').slice(1).join('-')}
                          onChange={(e) => {
                            const pre = (editForm.cedula_rif || '').split('-')[0] || 'V'
                            setEditForm({ ...editForm, cedula_rif: `${pre}-${e.target.value}` })
                          }}
                        />
                      </div>
                    ) : (
                      <p className="bg-slate-50/50 border border-transparent rounded-xl px-4 py-2 text-sm font-bold text-slate-700">{selected.cedula_rif}</p>
                    )}
                  </div>

                  {/* Campo adicional para Cédula Personal */}
                  <DataField
                    label={selected.tipo_afiliado === 'Juridico' ? "Cédula del Representante" : "Cédula Personal"}
                    value={selected.cedula_personal || 'No registrada'}
                    isEditing={isEditing}
                    fieldName="cedula_personal"
                    form={editForm}
                    setForm={setEditForm}
                  />

                  {selected.tipo_afiliado === 'Juridico' && (
                    <DataField
                      label="Representante Legal"
                      value={selected.representante_legal || 'No registrado'}
                      isEditing={isEditing}
                      fieldName="representante_legal"
                      form={editForm}
                      setForm={setEditForm}
                    />
                  )}

                  {/* Identificación de Tipo de Afiliado y Corporativo */}
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Afiliación</p>
                      {isEditing ? (
                        <select
                          className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/10"
                          value={editForm.tipo_afiliado}
                          onChange={(e) => setEditForm({ ...editForm, tipo_afiliado: e.target.value as any })}
                        >
                          <option value="Natural">Independiente / Persona</option>
                          <option value="Juridico">Empresa (Jurídico)</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${selected.tipo_afiliado === 'Juridico' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {selected.tipo_afiliado === 'Juridico' ? 'Corporativo (Empresa)' : (selected.id_agremiado_corp ? 'Corporativo (Empleado)' : 'Independiente')}
                        </span>
                      )}
                    </div>

                    {(isEditing ? editForm.tipo_afiliado === 'Natural' : selected.tipo_afiliado === 'Natural') && (
                      <div className="pt-2 border-t border-gray-200 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vinculación a Empresa (RIF)</p>
                        {isEditing ? (
                          <select
                            className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                            value={editForm.id_agremiado_corp || ''}
                            onChange={(e) => setEditForm({ ...editForm, id_agremiado_corp: e.target.value ? Number(e.target.value) : null })}
                          >
                            <option value="">Sin vinculación (Independiente)</option>
                            {companies.map(c => (
                              <option key={c.id_agremiado} value={c.id_agremiado}>
                                {c.razon_social} (RIF: {c.cedula_rif})
                              </option>
                            ))}
                          </select>
                        ) : selected.id_agremiado_corp ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-emerald-500" />
                              <span className="text-xs font-black text-slate-700">{selected.corp_razon_social}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold ml-6 mt-0.5">VINCULADO AL RIF: {selected.corp_rif}</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No vinculado a ninguna empresa</p>
                        )}
                      </div>
                    )}
                  </div>

                  {selected.tipo_afiliado === 'Juridico' && (
                    <DataField
                      label="Razón Social"
                      value={selected.razon_social || 'N/A'}
                      isEditing={isEditing}
                      fieldName="razon_social"
                      form={editForm}
                      setForm={setEditForm}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <DataField
                      label="Nombres"
                      value={selected.nombres || 'N/A'}
                      isEditing={isEditing}
                      fieldName="nombres"
                      form={editForm}
                      setForm={setEditForm}
                    />
                    <DataField
                      label="Apellidos"
                      value={selected.apellidos || 'N/A'}
                      isEditing={isEditing}
                      fieldName="apellidos"
                      form={editForm}
                      setForm={setEditForm}
                    />
                  </div>
                  <DataField
                    label="Nivel Académico"
                    value={selected.nivel_academico || 'No especificado'}
                    isEditing={isEditing}
                    fieldName="nivel_academico"
                    form={editForm}
                    setForm={setEditForm}
                    type="select"
                    options={ACADEMIC_OPTIONS}
                  />
                </div>
              </div>

              {/* Información de Contacto y Ubicación */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Contacto y Ubicación</h3>
                </div>

                <div className="space-y-4">
                  <DataField
                    label="Correo Electrónico"
                    value={selected.email}
                    isEditing={isEditing}
                    fieldName="email"
                    form={editForm}
                    setForm={setEditForm}
                  />
                  <DataField
                    label="Teléfono"
                    value={selected.telefono || 'Sin teléfono'}
                    isEditing={isEditing}
                    fieldName="telefono"
                    form={editForm}
                    setForm={setEditForm}
                  />
                  <DataField
                    label="Dirección"
                    value={selected.direccion || 'Sin dirección'}
                    isEditing={isEditing}
                    fieldName="direccion"
                    form={editForm}
                    setForm={setEditForm}
                  />
                  <DataField
                    label="Fecha Nacimiento"
                    value={selected.fecha_nacimiento || 'N/A'}
                    isEditing={isEditing}
                    fieldName="fecha_nacimiento"
                    form={editForm}
                    setForm={setEditForm}
                    type="date"
                  />
                </div>
              </div>

              {/* Redes Sociales y Web (Full Width) */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 md:col-span-2 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <BadgeCheck size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Redes Sociales y Web</h3>
                </div>

                <div className="space-y-4">
                  <DataField
                    label="Instagram"
                    value={selected.instagram || 'No configurado'}
                    isEditing={isEditing}
                    fieldName="instagram"
                    form={editForm}
                    setForm={setEditForm}
                  />
                  <DataField
                    label="Facebook"
                    value={selected.facebook || 'No configurado'}
                    isEditing={isEditing}
                    fieldName="facebook"
                    form={editForm}
                    setForm={setEditForm}
                  />
                  <DataField
                    label="LinkedIn"
                    value={selected.linkedin || 'No configurado'}
                    isEditing={isEditing}
                    fieldName="linkedin"
                    form={editForm}
                    setForm={setEditForm}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-2">
              <Calendar size={12} /> Registrado el {new Date(selected.fecha_registro).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo Miembro */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800">Registrar Nuevo Miembro</h3>
                <p className="text-sm text-slate-400 font-medium">Carga un nuevo afiliado directamente al directorio</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              {/* Información de Identidad */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Identidad del Afiliado</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DataInput label="Nombre Completo" placeholder="Ej: Juan Perez" value={newForm.nombre_completo || ''} onChange={(v: string) => setNewForm({ ...newForm, nombre_completo: v })} />
                  <DataInput label="Cédula" placeholder="V-12345678" value={newForm.cedula_rif || ''} onChange={(v: string) => setNewForm({ ...newForm, cedula_rif: v })} />
                  <DataInput label="Código (Opcional)" placeholder="359" value={newForm.codigo_cibir || ''} onChange={(v: string) => setNewForm({ ...newForm, codigo_cibir: v })} />
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Afiliación Corporativa (Opcional)</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa a la que pertenece</label>
                    <select
                      className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                      value={newForm.id_agremiado_corp || ''}
                      onChange={(e) => {
                        const corpId = e.target.value ? Number(e.target.value) : null;
                        setNewForm({ ...newForm, id_agremiado_corp: corpId, tipo_afiliado: 'Natural' });
                      }}
                    >
                      <option value="">Independiente (Sin Empresa)</option>
                      {companies.map(c => (
                        <option key={c.id_agremiado} value={c.id_agremiado}>
                          {c.razon_social} (RIF: {c.cedula_rif})
                        </option>
                      ))}
                    </select>
                    {newForm.id_agremiado_corp && (
                      <p className="text-[10px] text-emerald-600 font-bold ml-1 mt-1">
                        * Se registrará como afiliado vinculado al RIF de la empresa seleccionada.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contacto y Perfil */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Contacto y Perfil</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DataInput label="Correo Electrónico" placeholder="juan@ejemplo.com" value={newForm.email || ''} onChange={(v: string) => setNewForm({ ...newForm, email: v })} />
                  <DataInput label="Teléfono" placeholder="+58 412..." value={newForm.telefono || ''} onChange={(v: string) => setNewForm({ ...newForm, telefono: v })} />

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nivel Académico</label>
                    <select
                      className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                      value={newForm.nivel_academico || ''}
                      onChange={(e) => setNewForm({ ...newForm, nivel_academico: e.target.value })}
                    >
                      <option value="">No especificado</option>
                      <option value="Bachiller">Bachiller</option>
                      <option value="TSU">TSU</option>
                      <option value="Universitario">Universitario</option>
                      <option value="Postgrado">Postgrado</option>
                    </select>
                  </div>

                  <DataInput label="Fecha Nacimiento" type="date" value={newForm.fecha_nacimiento || ''} onChange={(v: string) => setNewForm({ ...newForm, fecha_nacimiento: v })} />
                </div>

                <DataInput label="Dirección" placeholder="Av. Principal..." value={newForm.direccion || ''} onChange={(v: string) => setNewForm({ ...newForm, direccion: v })} />
              </div>

              {/* Redes Sociales */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <BadgeCheck size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Redes Sociales</h3>
                </div>

                <div className="space-y-4">
                  <DataInput label="Instagram" placeholder="@usuario" value={newForm.instagram || ''} onChange={(v: string) => setNewForm({ ...newForm, instagram: v })} />
                  <DataInput label="Facebook" placeholder="facebook.com/usuario" value={newForm.facebook || ''} onChange={(v: string) => setNewForm({ ...newForm, facebook: v })} />
                  <DataInput label="LinkedIn" placeholder="linkedin.com/in/usuario" value={newForm.linkedin || ''} onChange={(v: string) => setNewForm({ ...newForm, linkedin: v })} />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-50 flex gap-4 shrink-0 bg-white">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-8 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Registrar Miembro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DataField({ label, value, isEditing, fieldName, form, setForm, type = 'text', options = [], className = '', labelClassName = '' }: any) {
  return (
    <div className="space-y-1">
      <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ${labelClassName}`}>{label}</label>
      {isEditing ? (
        type === 'select' ? (
          <select
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            value={form[fieldName] || ''}
            onChange={(e) => setForm({ ...form, [fieldName]: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            value={form[fieldName] || ''}
            onChange={(e) => setForm({ ...form, [fieldName]: e.target.value })}
          />
        )
      ) : (
        <p className={`bg-slate-50/50 border border-transparent rounded-xl px-4 py-2 text-sm font-bold text-slate-700 ${className}`}>{value}</p>
      )}
    </div>
  )
}

function DataInput({ label, placeholder, value, onChange, type = 'text' }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
