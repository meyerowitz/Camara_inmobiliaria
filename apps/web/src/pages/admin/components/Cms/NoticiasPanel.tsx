import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, Textarea, BtnPrimary, BtnDanger, BtnSecondary, ListDetail, uploadFileSupabase } from '@/pages/admin/components/Cms/CmsShared'
import { Upload, Image as ImageIcon, CheckCircle, Trash2, X } from 'lucide-react'

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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const uploadImage = async (file: File) => {
    setUploadError(null)
    setUploading(true)
    try {
      const publicUrl = await uploadFileSupabase(file, 'noticias')
      setForm((p) => ({ ...p, imagen_url: publicUrl }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

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
    try {
      const res = selectedId === 'new' 
        ? await api.post('/api/cms/noticias', form)
        : await api.put(`/api/cms/noticias/${selectedId}`, form)

      if (res.success) {
        setSelectedId(null)
        setIsEditing(false)
        load()
      } else {
        alert(res.message || 'Error al guardar la noticia')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión con el servidor')
    } finally {
      setSaving(false)
    }
  }


  const remove = async (id: string | number) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await api.delete(`/api/cms/noticias/${id}`)
    setSelectedId(null)
    load()
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-800 leading-tight">
            {selectedId === 'new' ? 'Nueva Noticia' : 'Editar Noticia'}
          </h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Portal de Actualidad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <FormField label="Título de la Noticia">
          <Input 
            value={form.titulo} 
            onChange={f('titulo')} 
            placeholder="Ej. Nuevas tendencias del mercado inmobiliario..." 
            className="!text-sm !py-3 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
          />
        </FormField>

        <FormField label="Extracto / Resumen">
          <Textarea 
            value={form.extracto} 
            onChange={f('extracto')} 
            placeholder="Breve resumen para la vista previa..." 
            rows={3} 
            className="!text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all resize-none"
          />
        </FormField>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Imagen de Portada</span>
            {form.imagen_url && (
              <button 
                onClick={() => setForm(p => ({ ...p, imagen_url: '' }))}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
              >
                <Trash2 size={12} />
                Quitar imagen
              </button>
            )}
          </div>

          <div className="relative group">
            <input
              type="file"
              accept="image/*,.svg,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadImage(file)
              }}
              disabled={uploading}
              onDragEnter={() => setIsDraggingOver(true)}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={() => setIsDraggingOver(false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className={`flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-2xl transition-all duration-300 ${
              uploading 
                ? 'border-emerald-200 bg-emerald-50/30' 
                : isDraggingOver
                  ? 'border-emerald-500 bg-emerald-100 scale-[1.02] shadow-xl shadow-emerald-500/10'
                  : form.imagen_url 
                    ? 'border-emerald-400 bg-emerald-50/50' 
                    : 'border-slate-200 group-hover:border-emerald-400 group-hover:bg-emerald-50/10'
            }`}>
              
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-bold text-emerald-700">Subiendo imagen...</span>
                </div>
              ) : form.imagen_url ? (
                <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <img src={form.imagen_url} alt="Preview" className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white ring-4 ring-emerald-50" />
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg ring-2 ring-white">
                      <CheckCircle size={14} strokeWidth={3} />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/50 px-3 py-1 rounded-full">¡Imagen cargada!</p>
                  <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">Haga clic o arrastre para cambiar</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <Upload size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700">
                    Arrastre su imagen aquí
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter font-bold">o haga clic para seleccionar archivo</p>
                </>
              )}
            </div>
          </div>
          {uploadError && <p className="text-[11px] text-rose-600 font-bold px-2">× {uploadError}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Categoría">
            <Input value={form.categoria} onChange={f('categoria')} className="!text-xs !py-2.5 bg-slate-50 border-slate-200" />
          </FormField>
          <FormField label="Etiqueta (Tag)">
            <Input value={form.tag} onChange={f('tag')} placeholder="Legal, Mercado..." className="!text-xs !py-2.5 bg-slate-50 border-slate-200" />
          </FormField>
          <FormField label="Fecha de Publicación">
            <Input type="date" value={form.fecha} onChange={f('fecha')} className="!text-xs !py-2.5 bg-slate-50 border-slate-200" />
          </FormField>
          <div className="flex items-center h-full pt-4">
            <label className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all w-full">
              <input 
                type="checkbox" 
                checked={form.publicado} 
                onChange={f('publicado')} 
                className="w-4 h-4 rounded accent-emerald-500 border-slate-300" 
              />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Publicar noticia</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-50">
          <BtnPrimary 
            onClick={save} 
            disabled={saving || uploading}
            className="!rounded-xl !py-3 flex-1"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </BtnPrimary>
          <BtnSecondary 
            onClick={() => { setSelectedId(null); setIsEditing(false) }}
            className="!rounded-xl !py-3 flex-1"
          >
            Cancelar
          </BtnSecondary>
        </div>
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
