import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, BtnPrimary, BtnDanger, BtnSecondary, ListDetail } from './CmsShared'

export const DirectivaPanel = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [form, setForm] = useState({ nombre: '', cargo: '', foto_url: '', orden: 0, activo: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => { setLoading(true); const data = await api.get('/api/cms/directiva'); if (data.success) setItems(data.data); setLoading(false) }, [])
  useEffect(() => { load() }, [load])
  const openEdit = (item: any) => { setSelectedId(item.id); setForm({ nombre: item.nombre, cargo: item.cargo, foto_url: item.foto_url || '', orden: item.orden, activo: item.activo === 1 }) }
  const openNew = () => { setSelectedId('new'); setForm({ nombre: '', cargo: '', foto_url: '', orden: 0, activo: true }) }
  const save = async () => { setSaving(true); if (selectedId === 'new') await api.post('/api/cms/directiva', form); else await api.put(`/api/cms/directiva/${selectedId}`, form); setSaving(false); setSelectedId(null); load() }
  const remove = async (id: any) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/api/cms/directiva/${id}`); setSelectedId(null); load() }
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nuevo Miembro' : 'Editar Miembro'}</h3>
      <FormField label="Nombre completo"><Input value={form.nombre} onChange={f('nombre')} /></FormField>
      <FormField label="Cargo"><Input value={form.cargo} onChange={f('cargo')} placeholder="Presidente, Secretario..." /></FormField>
      <FormField label="URL de foto"><Input value={form.foto_url} onChange={f('foto_url')} placeholder="https://..." /></FormField>
      {form.foto_url && <img src={form.foto_url} alt="" className="w-16 h-16 object-cover rounded-full border border-gray-100" />}
      <FormField label="Orden"><Input type="number" value={form.orden} onChange={f('orden')} /></FormField>
      <div className="flex gap-2 pt-2"><BtnPrimary onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnPrimary><BtnSecondary onClick={() => setSelectedId(null)}>Cancelar</BtnSecondary></div>
    </div>
  )

  return (
    <ListDetail
      items={items} loading={loading} selectedId={selectedId} setSelectedId={setSelectedId} onNew={openNew}
      renderRow={(item, sel) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E9FAF4] flex items-center justify-center text-[#00B870] font-black text-sm flex-shrink-0 overflow-hidden">
            {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : item.nombre.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={['text-sm font-semibold truncate', sel ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>{item.nombre}</span>
            <span className="text-xs text-slate-400 truncate">{item.cargo}</span>
          </div>
        </div>
      )}
      renderDetail={(item) => (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E9FAF4] flex items-center justify-center text-[#00B870] font-black text-lg overflow-hidden">
                {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : item.nombre.charAt(0)}
              </div>
              <div><h3 className="text-sm font-bold text-slate-800">{item.nombre}</h3><p className="text-xs text-slate-400">{item.cargo}</p></div>
            </div>
            <div className="flex gap-2"><BtnSecondary onClick={() => openEdit(item)}>Editar</BtnSecondary><BtnDanger onClick={() => remove(item.id)}>Eliminar</BtnDanger></div>
          </div>
        </div>
      )}
      renderForm={formBody}
    />
  )
}
