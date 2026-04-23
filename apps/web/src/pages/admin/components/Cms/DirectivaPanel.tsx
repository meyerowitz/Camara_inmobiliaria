import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, BtnPrimary, BtnDanger, BtnSecondary, ListDetail, uploadFileSupabase } from '@/pages/admin/components/Cms/CmsShared'
import { sendToPreview } from '@/pages/admin/components/Cms/LandingPreviewPane'
import { invalidateDirectivaCache } from '@/pages/landing/junta-directiva/JuntaDirectivaPage'

interface DirectivaItem {
  id: string | number;
  nombre: string;
  cargo: string;
  foto_url?: string;
  orden: number;
  activo: number | boolean;
}

/** Invalida caché local y emite evento para que la landing recargue si está abierta en la misma pestaña */
function purgeCache() {
  invalidateDirectivaCache()
  window.dispatchEvent(new CustomEvent('directiva-cache-invalidated'))
}

export const DirectivaPanel = () => {
  const [items, setItems] = useState<DirectivaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [form, setForm] = useState({ nombre: '', cargo: '', foto_url: '', orden: 0, activo: true })
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = async (file: File) => {
    setUploadError(null)
    setUploading(true)
    try {
      const publicUrl = await uploadFileSupabase(file, 'directiva')
      setForm((p) => ({ ...p, foto_url: publicUrl }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const load = useCallback(async () => { setLoading(true); const data = await api.get('/api/cms/directiva'); if (data.success) setItems(data.data); setLoading(false) }, [])

  useEffect(() => { load() }, [load])
  const openEdit = (item: DirectivaItem) => { setSelectedId(item.id); setForm({ nombre: item.nombre, cargo: item.cargo, foto_url: item.foto_url || '', orden: item.orden, activo: item.activo === 1 }); setIsEditing(true) }
  const openNew = () => { setSelectedId('new'); setForm({ nombre: '', cargo: '', foto_url: '', orden: 0, activo: true }); setIsEditing(true) }
  const save = async () => { setSaving(true); if (selectedId === 'new') await api.post('/api/cms/directiva', form); else await api.put(`/api/cms/directiva/${selectedId}`, form); setSaving(false); setSelectedId(null); setIsEditing(false); load(); purgeCache(); setTimeout(() => sendToPreview({ type: 'refresh_data' }), 500) }
  const remove = async (id: string | number) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/api/cms/directiva/${id}`); setSelectedId(null); load(); purgeCache(); setTimeout(() => sendToPreview({ type: 'refresh_data' }), 500) }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nuevo Miembro' : 'Editar Miembro'}</h3>
      <FormField label="Nombre completo"><Input value={form.nombre} onChange={f('nombre')} /></FormField>
      <FormField label="Cargo"><Input value={form.cargo} onChange={f('cargo')} placeholder="Presidente, Secretario..." /></FormField>
      <FormField label="Foto (subida directa)">
         <Input
           type="file"
           accept="image/*,.svg,.png,.jpg,.jpeg,.webp"
           disabled={uploading}
           onChange={(e) => {
             const file = e.target.files?.[0]
             if (file) uploadImage(file)
           }}
         />
      </FormField>
      {uploadError && <p className="text-[11px] text-red-600 -mt-2">{uploadError}</p>}
      <p className="text-[10px] text-slate-400 leading-relaxed -mt-2">
        Al subir el archivo, se guarda y completa automáticamente la foto.
      </p>
      {form.foto_url && <img src={form.foto_url} alt="" className="w-16 h-16 object-cover rounded-full border border-gray-100" />}
      <FormField label="Orden"><Input type="number" value={form.orden} onChange={f('orden')} /></FormField>
      <div className="flex gap-2 pt-2"><BtnPrimary onClick={save} disabled={saving || uploading}>{uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar'}</BtnPrimary><BtnSecondary onClick={() => { setSelectedId(null); setIsEditing(false) }}>Cancelar</BtnSecondary></div>
    </div>
  )

  return (
    <ListDetail
      items={items} loading={loading} selectedId={selectedId} setSelectedId={(id) => { setSelectedId(id); setIsEditing(false) }}
      isEditing={isEditing} setIsEditing={setIsEditing}
      onNew={openNew}
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
