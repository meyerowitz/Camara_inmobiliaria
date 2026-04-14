import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, Textarea, BtnPrimary, BtnDanger, BtnSecondary, ListDetail } from '@/pages/admin/components/Cms/CmsShared'

interface NoticiaItem {
  id: string | number;
  titulo: string;
  extracto: string;
  imagen_url: string;
  categoria: string;
  tag: string;
  fecha: string;
  publicado: number | boolean;
}

export const NoticiasPanel = () => {
  const [items, setItems] = useState<NoticiaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [form, setForm] = useState({ titulo: '', extracto: '', imagen_url: '', categoria: 'Noticias', tag: '', fecha: '', publicado: true })
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await api.get('/api/cms/noticias')
    if (data.success) setItems(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openEdit = (item: NoticiaItem) => {
    setSelectedId(item.id)
    setForm({ titulo: item.titulo, extracto: item.extracto, imagen_url: item.imagen_url || '', categoria: item.categoria, tag: item.tag || '', fecha: item.fecha?.split('T')[0] || '', publicado: item.publicado === 1 || item.publicado === true })
    setIsEditing(true)
  }

  const openNew = () => {
    setSelectedId('new')
    setForm({ titulo: '', extracto: '', imagen_url: '', categoria: 'Noticias', tag: '', fecha: new Date().toISOString().split('T')[0], publicado: true })
    setIsEditing(true)
  }

  const save = async () => {
    setSaving(true)
    if (selectedId === 'new') await api.post('/api/cms/noticias', form)
    else await api.put(`/api/cms/noticias/${selectedId}`, form)
    setSaving(false)
    setSelectedId(null)
    setIsEditing(false)
    load()
  }

  const remove = async (id: string | number) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await api.delete(`/api/cms/noticias/${id}`)
    setSelectedId(null)
    load()
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nueva Noticia' : 'Editar Noticia'}</h3>
      <FormField label="Título"><Input value={form.titulo} onChange={f('titulo')} placeholder="Título de la noticia" /></FormField>
      <FormField label="Extracto"><Textarea value={form.extracto} onChange={f('extracto')} placeholder="Descripción corta..." /></FormField>
      <FormField label="URL de imagen"><Input value={form.imagen_url} onChange={f('imagen_url')} placeholder="https://..." /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Categoría"><Input value={form.categoria} onChange={f('categoria')} /></FormField>
        <FormField label="Tag"><Input value={form.tag} onChange={f('tag')} placeholder="Legal, Mercado..." /></FormField>
        <FormField label="Fecha"><Input type="date" value={form.fecha} onChange={f('fecha')} /></FormField>
        <FormField label="Publicado">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={form.publicado} onChange={f('publicado')} className="w-4 h-4 accent-[#00D084]" />
            <span className="text-sm text-slate-600">Visible en la web</span>
          </label>
        </FormField>
      </div>
      <div className="flex gap-2 pt-2">
        <BtnPrimary onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnPrimary>
        <BtnSecondary onClick={() => { setSelectedId(null); setIsEditing(false) }}>Cancelar</BtnSecondary>
      </div>
    </div>
  )

  return (
    <ListDetail
      items={items} loading={loading} selectedId={selectedId} setSelectedId={(id) => { setSelectedId(id); setIsEditing(false) }}
      isEditing={isEditing} setIsEditing={setIsEditing}
      onNew={openNew}
      renderRow={(item, sel) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className={['text-sm font-semibold truncate', sel ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>{item.titulo}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.publicado ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{item.publicado ? 'Publicado' : 'Borrador'}</span>
          </div>
          <span className="text-xs text-slate-400 truncate">{item.categoria} · {item.fecha?.split('T')[0]}</span>
        </div>
      )}
      renderDetail={(item) => (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">{item.titulo}</h3>
            <div className="flex gap-2 flex-shrink-0">
              <BtnSecondary onClick={() => openEdit(item)}>Editar</BtnSecondary>
              <BtnDanger onClick={() => remove(item.id)}>Eliminar</BtnDanger>
            </div>
          </div>
          {item.imagen_url && <img src={item.imagen_url} alt="" className="w-full h-40 object-cover rounded-xl" />}
          <p className="text-sm text-slate-600 leading-relaxed">{item.extracto}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.categoria}</span>
            {item.tag && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{item.tag}</span>}
            <span>{item.fecha?.split('T')[0]}</span>
          </div>
        </div>
      )}
      renderForm={formBody}
    />
  )
}
