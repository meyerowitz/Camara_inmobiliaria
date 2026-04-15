import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react'
import { API_URL } from '@/config/env'

export default function VerificarPreinscripcionProgramaPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Confirmando tu preinscripción...')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No se encontró el token de verificación en la URL.')
      return
    }

    const confirmar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/preinscripciones/confirmar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          setStatus('success')
          setMessage(json.message || 'Preinscripción confirmada correctamente.')
        } else {
          setStatus('error')
          setMessage(json.message || 'No se pudo confirmar la preinscripción.')
        }
      } catch {
        setStatus('error')
        setMessage('Ocurrió un error de conexión con el servidor. Intenta nuevamente.')
      }
    }

    confirmar()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-emerald-900/5 text-center space-y-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-emerald-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Procesando...</h2>
            <p className="text-slate-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-50 mb-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-[#022c22]">¡Confirmación Exitosa!</h2>
            <p className="text-slate-500 mt-2 leading-relaxed">{message}</p>
            <Link
              to="/cursos"
              className="mt-8 px-6 py-3 w-full rounded-xl bg-emerald-600 text-white font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
            >
              <Home size={18} />
              Ver programas y cursos
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-50 mb-4">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-red-900">Confirmación Fallida</h2>
            <p className="text-slate-500 mt-2 leading-relaxed">{message}</p>
            <Link
              to="/cursos"
              className="mt-8 px-6 py-3 w-full rounded-xl bg-slate-100 text-slate-700 font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-slate-200 transition"
            >
              <Home size={18} />
              Volver
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
