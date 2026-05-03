import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Home, FileText, ChevronDown, ShieldCheck, ArrowRight, GraduationCap, School, Award, Briefcase, Check } from 'lucide-react'
import { API_URL } from '@/config/env'
import FileUpload from '@/components/common/FileUpload'
import Navbar from '@/pages/landing/components/navbar/Navbar4'

const NIVELES = [
  { value: 'Bachiller', label: 'Bachiller', icon: School },
  { value: 'TSU', label: 'Técnico Superior (TSU)', icon: Briefcase },
  { value: 'Universitario', label: 'Universitario', icon: GraduationCap },
  { value: 'Postgrado', label: 'Postgrado / Especialización', icon: Award },
]

const INPUT_H = "h-[62px]" // Altura unificada

export default function VerificarPreinscripcionProgramaPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'verifying' | 'form' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando tu enlace...')
  const [userData, setUserData] = useState<any>(null)
  const [showNivelDropdown, setShowNivelDropdown] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    url_cedula: '',
    url_titulo: '',
  })
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No se encontró el token de verificación en la URL.')
      return
    }
    const verificarToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/preinscripciones/token/${token}`)
        const json = await res.json()
        if (res.ok && json.success) {
          setUserData(json.data)
          setFormData(prev => ({
            url_cedula: json.data.url_cedula || '',
            url_titulo: json.data.url_titulo || '',
          }))
          setStatus('form')
        } else {
          setStatus('error')
          setMessage(json.message || 'Token inválido.')
        }
      } catch {
        setStatus('error')
        setMessage('Error de conexión.')
      }
    }
    verificarToken()
  }, [token])

  const isAfiliacion = userData?.programaCodigo === 'AFILIACION'
  const isJuridico = isAfiliacion && userData?.tipoAfiliado === 'Juridico'

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!formData.url_cedula || !formData.url_titulo) {
      alert('Por favor, carga ambos documentos.')
      return
    }
    setSubmitLoading(true)
    setStatus('verifying')
    try {
      const res = await fetch(`${API_URL}/api/public/preinscripciones/confirmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          url_cedula: formData.url_cedula,
          url_titulo: formData.url_titulo,
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) setStatus('success')
      else { setStatus('error'); setMessage(json.message); }
    } catch { setStatus('error'); setMessage('Error de conexión.'); }
    finally { setSubmitLoading(false); }
  }

  const selectedNivel = NIVELES.find(n => n.value === formData.nivelProfesional)
  const programaLabel = userData?.programaCodigo === 'AFILIACION' ? 'la Cámara Inmobiliaria' : (userData?.programaCodigo || 'CIEBO')
  const tituloLabel = userData?.programaCodigo === 'AFILIACION' ? 'Solicitud de Afiliación' : `Programa ${userData?.programaCodigo}`

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <section className="relative bg-[#022c22] pt-28 pb-16 overflow-hidden text-center">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white"><CheckCircle2 size={16} /></div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Paso 1</span></div>
            <div className="w-12 h-px bg-emerald-500/30" />
            <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'success' ? 'bg-emerald-500' : 'bg-emerald-500/20 border border-emerald-500/40'}`}>{status === 'success' ? <CheckCircle2 size={16} className="text-white" /> : <span className="text-emerald-400 text-xs font-black">2</span>}</div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">Paso 2</span></div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-3">
            {status === 'success' ? '¡Todo Listo!' : (isAfiliacion ? 'Validación de Afiliado' : 'Completa tu Perfil')}
          </h1>
          <p className="text-white/90 text-sm max-w-lg mx-auto">
            {status === 'form' && userData 
              ? <>Hola <span className="text-white font-bold">{userData.nombreCompleto}</span>, falta poco para finalizar tu <span className="text-emerald-400 font-bold">{isAfiliacion ? 'solicitud de afiliación' : `inscripción al programa ${programaLabel}`}</span>.</> 
              : message
            }
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {status === 'form' && userData && (
            <form onSubmit={handleConfirmar} className="space-y-10">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0"><ShieldCheck size={22} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#022c22] truncate">{userData.nombreCompleto} · {userData.email}</p></div>
              </div>



              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2"><div className="w-1 h-6 rounded-full bg-emerald-600" /><div><h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#022c22]">Documentación Digital</h3></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload label={isJuridico ? 'RIF Empresa' : 'Cédula'} accept="image/*,.pdf" folder="cedulas" required onUploadSuccess={(url) => setFormData(prev => ({ ...prev, url_cedula: url }))} onClear={() => setFormData(prev => ({ ...prev, url_cedula: '' }))} />
                  <FileUpload label={isJuridico ? 'RIF Representante' : 'Título'} accept="image/*,.pdf" folder="titulos" required onUploadSuccess={(url) => setFormData(prev => ({ ...prev, url_titulo: url }))} onClear={() => setFormData(prev => ({ ...prev, url_titulo: '' }))} />
                </div>
              </div>

              <button type="submit" disabled={submitLoading || !formData.url_cedula || !formData.url_titulo} className={`w-full font-black rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-xl bg-emerald-600 text-white disabled:opacity-60 uppercase tracking-widest text-xs ${INPUT_H}`}>
                {submitLoading ? <Loader2 size={20} className="animate-spin" /> : <>Finalizar Registro<ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center py-16 text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center bg-emerald-50 text-emerald-500 shadow-xl shadow-emerald-500/10"><CheckCircle2 size={52} strokeWidth={1.5} /></div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-[#022c22] uppercase tracking-tighter">
                  {isAfiliacion ? 'Solicitud Enviada' : '¡Preinscripción Exitosa!'}
                </h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isAfiliacion 
                    ? 'Tus documentos han sido cargados correctamente. La Cámara revisará tu perfil y se pondrá en contacto contigo para los siguientes pasos de tu afiliación.'
                    : 'Hemos recibido tus documentos. Te enviaremos un correo con los detalles de la entrevista y el proceso de admisión al programa.'
                  }
                </p>
              </div>
              <Link to="/" className={`px-8 flex items-center gap-2 rounded-xl bg-[#022c22] text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:-translate-y-1 transition-all ${INPUT_H}`}><Home size={16} />Volver al Inicio</Link>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-[#011a14] py-12 text-center border-t border-white/5"><p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">CÁMARA INMOBILIARIA • 2026</p></footer>
    </div>
  )
}
