import React, { useState, useEffect, useCallback } from 'react'
import { api, FormField, Input, BtnPrimary, BtnDanger, BtnSecondary, ListDetail, uploadFileSupabase } from '@/pages/admin/components/Cms/CmsShared'

interface ConvenioItem {
  id: string | number;
  nombre: string;
  logo_url: string; // URL de la imagen (logo)
  orden: number;
  activo: boolean | number;
}

export const ConveniosPanel = () => {
  const [items, setItems] = useState<ConvenioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [form, setForm] = useState({ nombre: '', logo_url: '', orden: 0, activo: true })
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const load = useCallback(async () => { setLoading(true); const data = await api.get('/api/cms/convenios'); if (data.success) setItems(data.data); setLoading(false) }, [])
  useEffect(() => { load() }, [load])
  const openEdit = (item: ConvenioItem) => { setSelectedId(item.id); setForm({ nombre: item.nombre, logo_url: item.logo_url, orden: item.orden, activo: item.activo === 1 }); setIsEditing(true) }
  const openNew = () => { setSelectedId('new'); setForm({ nombre: '', logo_url: '', orden: 0, activo: true }); setIsEditing(true) }
  const save = async () => { setSaving(true); if (selectedId === 'new') await api.post('/api/cms/convenios', form); else await api.put(`/api/cms/convenios/${selectedId}`, form); setSaving(false); setSelectedId(null); setIsEditing(false); load() }
  const remove = async (id: string | number) => { if (!confirm('¿Eliminar?')) return; await api.delete(`/api/cms/convenios/${id}`); setSelectedId(null); load() }
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const uploadDocumento = async (file: File) => {
    setUploadError(null)
    setUploading(true)
    try {
      const publicUrl = await uploadFileSupabase(file, 'convenios')
      setForm((p) => ({ ...p, logo_url: publicUrl }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const formBody = () => (
    <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
      <h3 className="text-sm font-bold text-slate-800">{selectedId === 'new' ? 'Nuevo convenio' : 'Editar convenio'}</h3>
      <FormField label="Nombre del convenio"><Input value={form.nombre} onChange={f('nombre')} placeholder="Ej. Convenio marco con aliado" /></FormField>
      <FormField label="Imagen (Logo del convenio)">
        <Input
          type="file"
          accept="image/*,.svg,.png,.jpg,.jpeg,.webp"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadDocumento(file)
          }}
        />
      </FormField>
      {uploadError && <p className="text-[11px] text-red-600 -mt-2">{uploadError}</p>}
      {form.logo_url && (
        <img src={form.logo_url} alt="Vista previa" className="mt-2 h-20 w-auto object-contain rounded-lg border border-gray-100 p-1 bg-white" />
      )}
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
          <span className="text-lg shrink-0" aria-hidden>🖼️</span>
          <span className={['text-sm font-semibold truncate', sel ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>{item.nombre}</span>
        </div>
      )}
      renderDetail={(item) => (
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">{item.nombre}</h3>
            <div className="flex gap-2"><BtnSecondary onClick={() => openEdit(item)}>Editar</BtnSecondary><BtnDanger onClick={() => remove(item.id)}>Eliminar</BtnDanger></div>
          </div>
          <div className="bg-white border rounded-xl p-2 w-max mt-2">
             <img src={item.logo_url} alt="Logo" className="h-24 w-auto object-contain" />
          </div>
          <p className="text-xs text-slate-400">Orden: {item.orden}</p>
        </div>
      )}
      renderForm={formBody}
    />
  )
}
