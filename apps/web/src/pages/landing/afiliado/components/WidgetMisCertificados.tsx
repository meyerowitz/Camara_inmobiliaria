import React, { useEffect, useState } from 'react'
import { Award, Copy, ExternalLink } from 'lucide-react'
import DashboardCard from '@/pages/landing/afiliado/components/DashboardCard'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/config/env'

interface CertRow {
  id_certificado: number
  codigo_validacion: string
  fecha_emision: string
  programa_codigo: string | null
  tipo_inscripcion: string | null
  inscripcion_estatus: string
  completado: number
  curso_nombre: string | null
}

function tituloCertificado(r: CertRow): string {
  return r.curso_nombre || (r.programa_codigo ? `Programa ${r.programa_codigo}` : 'Formación académica')
}

function esVigente(r: CertRow): boolean {
  return Number(r.completado) === 1 && r.inscripcion_estatus === 'Inscrito'
}

const WidgetMisCertificados: React.FC = () => {
  const { token } = useAuth()
  const [rows, setRows] = useState<CertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    setFetchError(null)
    fetch(`${API_URL}/api/afiliados/me/certificados`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setRows(j.data)
        else setFetchError(typeof j.message === 'string' ? j.message : 'No se pudieron cargar los certificados.')
      })
      .catch(() => setFetchError('Error de conexión al cargar certificados.'))
      .finally(() => setLoading(false))
  }, [token])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const copiar = (text: string) => {
    void navigator.clipboard.writeText(text).catch(() => {})
  }

  const abrirPublico = (codigo: string) => {
    window.open(`${origin}/comprobante/${encodeURIComponent(codigo)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <DashboardCard title="Mis certificados y comprobantes" icon={Award}>
      {fetchError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{fetchError}</p>
      )}
      {loading ? (
        <p className="text-center text-sm font-medium text-slate-400 py-10">Cargando…</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-10 max-w-md mx-auto leading-relaxed">
          Cuando completes un programa o curso aprobado por la institución, aquí aparecerá tu comprobante de
          aprobación digital con enlace público de verificación y opción de exportar a PDF.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const url = `${origin}/comprobante/${encodeURIComponent(r.codigo_validacion)}`
            const vigente = esVigente(r)
            return (
              <li
                key={r.id_certificado}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                      {tituloCertificado(r)}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Código:{' '}
                      <span className="font-mono font-semibold text-slate-700">{r.codigo_validacion}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Emitido: {new Date(r.fecha_emision).toLocaleDateString('es-VE')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          vigente
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                        }`}
                      >
                        {vigente ? 'Vigente' : 'No vigente'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => abrirPublico(r.codigo_validacion)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-emerald-700"
                    >
                      <ExternalLink size={14} />
                      Abrir comprobante
                    </button>
                    <button
                      type="button"
                      onClick={() => copiar(url)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50"
                    >
                      <Copy size={14} />
                      Copiar enlace
                    </button>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white/80 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Enlace de verificación pública
                  </p>
                  <p className="text-xs font-medium text-emerald-800 break-all leading-snug">{url}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}

export default WidgetMisCertificados
