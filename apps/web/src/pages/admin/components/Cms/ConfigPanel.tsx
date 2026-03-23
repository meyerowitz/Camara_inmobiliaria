import React, { useState, useEffect, useCallback } from 'react'
import { api, Input, Textarea, BtnPrimary, Loading } from './CmsShared'

const CONFIG_GROUPS = [
  {
    label: '🦸 Hero',
    keys: [
      { clave: 'hero_titulo',       descripcion: 'Título principal' },
      { clave: 'hero_subtitulo',    descripcion: 'Subtítulo' },
      { clave: 'hero_boton',        descripcion: 'Texto botón principal' },
    ],
  },
  {
    label: '🏛️ Nosotros',
    keys: [
      { clave: 'nosotros_titulo',       descripcion: 'Título sección' },
      { clave: 'nosotros_descripcion',  descripcion: 'Descripción principal' },
      { clave: 'nosotros_card1_titulo', descripcion: 'Tarjeta 1 — Título' },
      { clave: 'nosotros_card1_desc',   descripcion: 'Tarjeta 1 — Descripción' },
      { clave: 'nosotros_card1_img',    descripcion: 'Tarjeta 1 — URL imagen' },
      { clave: 'nosotros_card2_titulo', descripcion: 'Tarjeta 2 — Título' },
      { clave: 'nosotros_card2_desc',   descripcion: 'Tarjeta 2 — Descripción' },
      { clave: 'nosotros_card2_img',    descripcion: 'Tarjeta 2 — URL imagen' },
      { clave: 'nosotros_card3_titulo', descripcion: 'Tarjeta 3 — Título' },
      { clave: 'nosotros_card3_desc',   descripcion: 'Tarjeta 3 — Descripción' },
      { clave: 'nosotros_card3_img',    descripcion: 'Tarjeta 3 — URL imagen' },
      { clave: 'nosotros_boton',        descripcion: 'Texto botón de contacto' },
    ],
  },
  {
    label: '👥 Afiliados',
    keys: [
      { clave: 'afiliados_titulo',       descripcion: 'Título sección' },
      { clave: 'afiliados_descripcion',  descripcion: 'Descripción' },
      { clave: 'afiliados_contador',     descripcion: 'N° de afiliados (número)' },
      { clave: 'afiliados_anos',         descripcion: 'Años de historia (número)' },
      { clave: 'afiliados_respaldo',     descripcion: 'Frase resaltada en tarjeta' },
      { clave: 'afiliados_beneficio1',   descripcion: 'Beneficio 1' },
      { clave: 'afiliados_beneficio2',   descripcion: 'Beneficio 2' },
      { clave: 'afiliados_beneficio3',   descripcion: 'Beneficio 3' },
      { clave: 'afiliados_beneficio4',   descripcion: 'Beneficio 4' },
    ],
  },
  {
    label: '🎓 Formación',
    keys: [
      { clave: 'formacion_supertitulo', descripcion: 'Supra-título' },
      { clave: 'formacion_titulo',      descripcion: 'Título' },
      { clave: 'formacion_boton',       descripcion: 'Texto botón detalles' },
    ],
  },
  {
    label: '🤝 Convenios',
    keys: [
      { clave: 'convenios_supertitulo',  descripcion: 'Supra-título' },
      { clave: 'convenios_titulo',       descripcion: 'Título' },
      { clave: 'convenios_descripcion',  descripcion: 'Descripción' },
      { clave: 'convenios_link',         descripcion: 'Texto enlace a formación' },
    ],
  },
  {
    label: '📰 Noticias',
    keys: [
      { clave: 'noticias_titulo',    descripcion: 'Título sección' },
      { clave: 'noticias_subtitulo', descripcion: 'Subtítulo' },
      { clave: 'noticias_boton',     descripcion: 'Texto botón "Ver todas"' },
    ],
  },
  {
    label: '🏅 Junta Directiva',
    keys: [
      { clave: 'directiva_supertitulo', descripcion: 'Supra-título' },
      { clave: 'directiva_titulo',      descripcion: 'Título' },
      { clave: 'directiva_boton',       descripcion: 'Texto botón de acceso' },
      { clave: 'directiva_cta',         descripcion: 'Texto sobre imagen interactiva' },
    ],
  },
  {
    label: '🌐 Redes Sociales & Footer',
    keys: [
      { clave: 'footer_descripcion', descripcion: 'Descripción pie de página' },
      { clave: 'footer_direccion',   descripcion: 'Dirección en el footer' },
      { clave: 'footer_copyright',   descripcion: 'Texto de copyright' },
      { clave: 'redes_instagram',    descripcion: 'URL Instagram' },
      { clave: 'redes_facebook',     descripcion: 'URL Facebook' },
      { clave: 'redes_linkedin',     descripcion: 'URL LinkedIn' },
    ],
  },
  {
    label: '📋 Institucional',
    keys: [
      { clave: 'mision',              descripcion: 'Misión' },
      { clave: 'vision',              descripcion: 'Visión' },
      { clave: 'proposito',           descripcion: 'Propósito' },
      { clave: 'contacto_email',      descripcion: 'Email de contacto' },
      { clave: 'contacto_telefono',   descripcion: 'Teléfono de contacto' },
      { clave: 'rif',                 descripcion: 'RIF de la cámara' },
    ],
  },
]

// Flat list for save/init operations
const ALL_CONFIG_KEYS = CONFIG_GROUPS.flatMap(g => g.keys)

const CONFIG_LONG_KEYS = new Set([
  'nosotros_descripcion', 'nosotros_card1_desc', 'nosotros_card2_desc', 'nosotros_card3_desc',
  'afiliados_descripcion', 'mision', 'vision', 'proposito',
  'footer_descripcion', 'footer_direccion', 'footer_copyright',
])

export const ConfigPanel = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [localForms, setLocalForms] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const data = await api.get('/api/cms/config')
    if (data.success) {
      const initial: Record<string, string> = {}
      ALL_CONFIG_KEYS.forEach(k => { initial[k.clave] = data.config?.[k.clave] ?? '' })
      setLocalForms(initial)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveAll = async () => {
    setSaving(true)
    const entries = ALL_CONFIG_KEYS.map(k => ({ clave: k.clave, valor: localForms[k.clave] || '', descripcion: k.descripcion }))
    await api.post('/api/cms/config/batch', entries)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <Loading />

  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5 sticky top-0 bg-gray-50 py-3 z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Configuración General</h3>
          <p className="text-xs text-slate-400 mt-0.5">Edita todos los textos e imágenes de la landing</p>
        </div>
        <BtnPrimary onClick={saveAll} disabled={saving}>
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar todo'}
        </BtnPrimary>
      </div>

      <div className="flex flex-col gap-6">
        {CONFIG_GROUPS.map(group => (
          <div key={group.label} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-gray-100">
              <h4 className="text-xs font-bold text-slate-600">{group.label}</h4>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {group.keys.map(k => (
                <div key={k.clave} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{k.descripcion}</label>
                  {/* Preview for image URLs */}
                  {k.clave.endsWith('_img') && localForms[k.clave] && (
                    <img src={localForms[k.clave]} alt="preview" className="w-full h-32 object-cover rounded-xl mb-1" />
                  )}
                  {CONFIG_LONG_KEYS.has(k.clave) ? (
                    <Textarea
                      value={localForms[k.clave] ?? ''}
                      onChange={e => setLocalForms(p => ({ ...p, [k.clave]: e.target.value }))}
                      placeholder={k.descripcion}
                    />
                  ) : (
                    <Input
                      value={localForms[k.clave] ?? ''}
                      onChange={e => setLocalForms(p => ({ ...p, [k.clave]: e.target.value }))}
                      placeholder={k.descripcion}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="py-5 flex justify-end">
        <BtnPrimary onClick={saveAll} disabled={saving}>
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar todo'}
        </BtnPrimary>
      </div>
    </div>
  )
}
