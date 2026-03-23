import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, Textarea, BtnPrimary, BtnDanger, BtnSecondary, ListDetail } from './CmsShared'

export const HitosPanel = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [form, setForm] = useState({ anio: '', titulo: '', descripcion: '', orden: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => { setLoading(true); const data = await api.get('/api/cms/hitos'); if (data.success) setItems(data.data); setLoading(false) }, [])
  useEffect(() => { load() }, [load])
  const openEdit = (item: any) => { setSelectedId(item.id); setForm({ anio: item.anio, titulo: item.titulo, descripcion: item.descripcion, orden: item.orden }) }
  const openNew = () => { setSelectedId('new'); setForm({ anio: '', titulo: '', descripcion: '', orden: items.length }) }
  const save = async () => { setSaving(true); if (selectedId === 'new') await api.post('/api/cms/hitos', form); else await api.put(`/api/cms/hitos/${selectedId}`, form); setSaving(false); setSelectedId(null); load() }
  const remove = async (id: any) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/api/cms/hitos/${id}`); setSelectedId(null); load() }
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nuevo Hito' : 'Editar Hito'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Año"><Input value={form.anio} onChange={f('anio')} placeholder="1994" /></FormField>
        <FormField label="Orden"><Input type="number" value={form.orden} onChange={f('orden')} /></FormField>
      </div>
      <FormField label="Título"><Input value={form.titulo} onChange={f('titulo')} placeholder="Fundación..." /></FormField>
      <FormField label="Descripción"><Textarea value={form.descripcion} onChange={f('descripcion')} placeholder="Descripción del hito..." /></FormField>
      <div className="flex gap-2 pt-2"><BtnPrimary onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnPrimary><BtnSecondary onClick={() => setSelectedId(null)}>Cancelar</BtnSecondary></div>
    </div>
  )

  return (
    <ListDetail
      items={items} loading={loading} selectedId={selectedId} setSelectedId={setSelectedId} onNew={openNew}
      renderRow={(item, sel) => (
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-[#00D084] flex-shrink-0 w-12">{item.anio}</span>
          <div className="flex flex-col min-w-0">
            <span className={['text-sm font-semibold truncate', sel ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>{item.titulo}</span>
            <span className="text-xs text-slate-400 truncate">{item.descripcion}</span>
          </div>
        </div>
      )}
      renderDetail={(item) => (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <div><span className="text-3xl font-black text-[#00D084]">{item.anio}</span><h3 className="text-sm font-bold text-slate-800 mt-1">{item.titulo}</h3></div>
            <div className="flex gap-2"><BtnSecondary onClick={() => openEdit(item)}>Editar</BtnSecondary><BtnDanger onClick={() => remove(item.id)}>Eliminar</BtnDanger></div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{item.descripcion}</p>
        </div>
      )}
      renderForm={formBody}
    />
  )
}
