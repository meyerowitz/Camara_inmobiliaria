import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import ComprobanteVerificacionView from '@/components/ComprobanteVerificacionView'
import { API_URL } from '@/config/env'

type ApiData = {
  codigo_validacion: string
  fecha_emision: string
  titular_nombre: string
  programa_o_curso: string
  vigente: boolean
}

const ComprobantePublicoPage: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>()
  const [data, setData] = useState<ApiData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const urlVerificacion = codigo ? `${origin}/comprobante/${encodeURIComponent(codigo)}` : origin

  useEffect(() => {
    if (!codigo?.trim()) {
      setError('Enlace incompleto')
      setLoading(false)
      return
    }
    fetch(`${API_URL}/api/public/comprobantes/${encodeURIComponent(codigo)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          setData(j.data as ApiData)
        } else {
          setError(j.message || 'No se pudo cargar el comprobante')
        }
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [codigo])

  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <header className="no-print border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verificación pública</p>
            <h2 className="text-sm font-bold text-slate-800">Comprobante de aprobación digital</h2>
          </div>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:bg-emerald-700"
          >
            <Printer size={16} />
            Exportar PDF
          </button>
        </div>
        <p className="mx-auto max-w-3xl px-4 pb-3 text-[11px] text-slate-500">
          Use la impresión del navegador y elija <strong>Guardar como PDF</strong> como destino.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 print:py-6">
        {loading && (
          <p className="text-center text-sm font-medium text-slate-400">Cargando comprobante…</p>
        )}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
            {error}
          </div>
        )}
        {!loading && data && (
          <ComprobanteVerificacionView
            codigo={data.codigo_validacion}
            fechaEmisionIso={data.fecha_emision}
            titularNombre={data.titular_nombre}
            programaOCurso={data.programa_o_curso}
            urlVerificacion={urlVerificacion}
            vigente={data.vigente}
          />
        )}
      </main>
    </div>
  )
}

export default ComprobantePublicoPage
