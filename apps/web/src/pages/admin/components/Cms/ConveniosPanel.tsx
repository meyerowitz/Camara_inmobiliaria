import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, BtnPrimary, BtnDanger, BtnSecondary, ListDetail } from './CmsShared'

export const ConveniosPanel = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [form, setForm] = useState({ nombre: '', logo_url: '', orden: 0, activo: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => { setLoading(true); const data = await api.get('/api/cms/convenios'); if (data.success) setItems(data.data); setLoading(false) }, [])
  useEffect(() => { load() }, [load])
  const openEdit = (item: any) => { setSelectedId(item.id); setForm({ nombre: item.nombre, logo_url: item.logo_url, orden: item.orden, activo: item.activo === 1 }) }
  const openNew = () => { setSelectedId('new'); setForm({ nombre: '', logo_url: '', orden: 0, activo: true }) }
  const save = async () => { setSaving(true); if (selectedId === 'new') await api.post('/api/cms/convenios', form); else await api.put(`/api/cms/convenios/${selectedId}`, form); setSaving(false); setSelectedId(null); load() }
  const remove = async (id: any) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/api/cms/convenios/${id}`); setSelectedId(null); load() }
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nuevo Convenio' : 'Editar Convenio'}</h3>
      <FormField label="Nombre del aliado"><Input value={form.nombre} onChange={f('nombre')} placeholder="Nombre de la organización" /></FormField>
      <FormField label="URL del logo"><Input value={form.logo_url} onChange={f('logo_url')} placeholder="https://..." /></FormField>
      {form.logo_url && <img src={form.logo_url} alt="preview" className="h-16 w-auto object-contain rounded-lg border border-gray-100 p-2" />}
      <FormField label="Orden"><Input type="number" value={form.orden} onChange={f('orden')} /></FormField>
      <div className="flex gap-2 pt-2"><BtnPrimary onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnPrimary><BtnSecondary onClick={() => setSelectedId(null)}>Cancelar</BtnSecondary></div>
    </div>
  )

  return (
    <ListDetail
      items={items} loading={loading} selectedId={selectedId} setSelectedId={setSelectedId} onNew={openNew}
      renderRow={(item, sel) => (
        <div className="flex items-center gap-3">
          <img src={item.logo_url} alt="" className="w-8 h-8 object-contain flex-shrink-0 rounded" />
          <span className={['text-sm font-semibold truncate', sel ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>{item.nombre}</span>
        </div>
      )}
      renderDetail={(item) => (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">{item.nombre}</h3>
            <div className="flex gap-2"><BtnSecondary onClick={() => openEdit(item)}>Editar</BtnSecondary><BtnDanger onClick={() => remove(item.id)}>Eliminar</BtnDanger></div>
          </div>
          <img src={item.logo_url} alt={item.nombre} className="h-20 w-auto object-contain rounded-xl border border-gray-100 p-3" />
          <p className="text-xs text-slate-400">Orden: {item.orden}</p>
        </div>
      )}
      renderForm={formBody}
    />
  )
}
