import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, BtnPrimary, BtnDanger, BtnSecondary, ListDetail } from './CmsShared'

export const CursosPanel = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<any>(null)
  const [form, setForm] = useState({ codigo: '', titulo: '', subtitulo: '', imagen_url: '', orden: 0, activo: true })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await api.get('/api/cms/cursos')
    if (data.success) setItems(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openEdit = (item: any) => {
    setSelectedId(item.id)
    setForm({ codigo: item.codigo, titulo: item.titulo, subtitulo: item.subtitulo || '', imagen_url: item.imagen_url || '', orden: item.orden, activo: item.activo === 1 })
  }
  const openNew = () => { setSelectedId('new'); setForm({ codigo: '', titulo: '', subtitulo: '', imagen_url: '', orden: 0, activo: true }) }
  const save = async () => {
    setSaving(true)
    if (selectedId === 'new') await api.post('/api/cms/cursos', form)
    else await api.put(`/api/cms/cursos/${selectedId}`, form)
    setSaving(false); setSelectedId(null); load()
  }
  const remove = async (id: any) => {
    if (!confirm('¿Eliminar?')) return
    await api.delete(`/api/cms/cursos/${id}`); setSelectedId(null); load()
  }
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nuevo Curso' : 'Editar Curso'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Código"><Input value={form.codigo} onChange={f('codigo')} placeholder="CIBIR" /></FormField>
        <FormField label="Orden"><Input type="number" value={form.orden} onChange={f('orden')} /></FormField>
      </div>
      <FormField label="Título"><Input value={form.titulo} onChange={f('titulo')} placeholder="Nombre del curso" /></FormField>
      <FormField label="Subtítulo"><Input value={form.subtitulo} onChange={f('subtitulo')} placeholder="Descripción breve" /></FormField>
      <FormField label="URL de imagen"><Input value={form.imagen_url} onChange={f('imagen_url')} placeholder="https://..." /></FormField>
      <FormField label="Activo">
        <label className="flex items-center gap-2 mt-1 cursor-pointer">
          <input type="checkbox" checked={form.activo} onChange={f('activo')} className="w-4 h-4 accent-[#00D084]" />
          <span className="text-sm text-slate-600">Visible en la web</span>
        </label>
      </FormField>
      <div className="flex gap-2 pt-2">
        <BtnPrimary onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnPrimary>
        <BtnSecondary onClick={() => setSelectedId(null)}>Cancelar</BtnSecondary>
      </div>
    </div>
  )

  return (
    <ListDetail
      items={items} loading={loading} selectedId={selectedId} setSelectedId={setSelectedId}
      onNew={openNew}
      renderRow={(item, sel) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className={['text-sm font-semibold truncate', sel ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>{item.titulo}</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{item.codigo}</span>
          </div>
          <span className="text-xs text-slate-400 truncate">{item.subtitulo}</span>
        </div>
      )}
      renderDetail={(item) => (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <div><h3 className="text-sm font-bold text-slate-800">{item.titulo}</h3><p className="text-xs text-slate-400">{item.codigo}</p></div>
            <div className="flex gap-2"><BtnSecondary onClick={() => openEdit(item)}>Editar</BtnSecondary><BtnDanger onClick={() => remove(item.id)}>Eliminar</BtnDanger></div>
          </div>
          {item.imagen_url && <img src={item.imagen_url} alt="" className="w-full h-40 object-cover rounded-xl" />}
          <p className="text-sm text-slate-600">{item.subtitulo}</p>
        </div>
      )}
      renderForm={formBody}
    />
  )
}
