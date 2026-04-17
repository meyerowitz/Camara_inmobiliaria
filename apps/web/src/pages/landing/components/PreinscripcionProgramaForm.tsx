import React, { useState } from 'react'
import { User, IdCard, Mail, Phone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { API_URL } from '@/config/env'

type ProgramaCodigo = 'PADI' | 'PEGI' | 'PREANI' | 'CIBIR' | 'AFILIACION'

interface Props {
  programaCodigo: ProgramaCodigo
  ctaLabel?: string
}

const FIELDS = [
  { name: 'nombreCompleto', label: 'Nombre Completo', type: 'text', placeholder: 'Ej. Carlos Mendoza', icon: User },
  { name: 'cedulaRif', label: 'Cédula de Identidad o RIF', type: 'text', placeholder: 'V-00.000.000', icon: IdCard },
  { name: 'email', label: 'Correo Electrónico', type: 'email', placeholder: 'usuario@ejemplo.com', icon: Mail },
  { name: 'telefono', label: 'Teléfono de Contacto', type: 'tel', placeholder: '+58 4XX 0000000', icon: Phone },
] as const

export default function PreinscripcionProgramaForm({ programaCodigo, ctaLabel }: Props) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    cedulaRif: '',
    email: '',
    telefono: '',
    nivelProfesional: '',
    esCorredorInmobiliario: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch(`${API_URL}/api/public/preinscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programaCodigo,
          nombreCompleto: formData.nombreCompleto,
          cedulaRif: formData.cedulaRif,
          email: formData.email,
          telefono: formData.telefono,
          nivelProfesional: formData.nivelProfesional,
          esCorredorInmobiliario: formData.esCorredorInmobiliario === 'si',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'No se pudo registrar la preinscripción')
      }
      setSubmitted(true)
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-10 flex flex-col items-center text-center space-y-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-50">
          <CheckCircle2 size={34} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black text-white">¡Revisa tu correo!</h3>
        <p className="text-sm max-w-md leading-relaxed text-emerald-100/85">
          Te enviamos un enlace de confirmación para validar tu email y completar la preinscripción al programa <span className="font-bold">{programaCodigo}</span>.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-bold underline transition-colors text-emerald-300 hover:text-emerald-200"
        >
          Enviar otra solicitud
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FIELDS.map(({ name, label, type, placeholder, icon: Icon }) => (
          <div key={name} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-emerald-100/90">
              {label}
            </label>
            <div className="relative">
              <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={type}
                name={name}
                required={name === 'cedulaRif' ? false : true}
                value={(formData as any)[name] as string}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-12 pr-5 py-4 bg-white rounded-xl outline-none transition-all placeholder:text-slate-300 font-medium text-sm border border-slate-200 text-slate-800 focus:border-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-emerald-100/90">
            Nivel Profesional
          </label>
          <div className="relative">
            <select
              name="nivelProfesional"
              required
              value={formData.nivelProfesional}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white rounded-xl outline-none transition-all font-medium text-sm border border-slate-200 text-slate-800 focus:border-emerald-500 appearance-none"
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              <option value="Bachiller">Bachiller</option>
              <option value="Universitario">Universitario</option>
              <option value="Postgrado">Postgrado</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-emerald-100/90">
            ¿Ya eres corredor inmobiliario?
          </label>
          <div className="rounded-xl border border-slate-200 bg-white p-1">
            <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label="¿Ya eres corredor inmobiliario?">
              {[
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' },
              ].map(option => {
                const selected = formData.esCorredorInmobiliario === option.value
                return (
                  <label
                    key={option.value}
                    className={[
                      'h-[50px] rounded-lg cursor-pointer text-sm font-semibold flex items-center justify-center transition-all',
                      selected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="esCorredorInmobiliario"
                      value={option.value}
                      checked={selected}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span>{option.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full font-black py-5 rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-xl bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-[#022c22]"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : (ctaLabel ?? 'Preinscribirme')}
      </button>

      {errorMsg && (
        <div className="flex items-center gap-2 text-red-100 bg-red-500/20 border border-red-400/40 p-3 rounded-xl text-xs font-bold justify-center">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      <p className="text-[10px] text-center uppercase tracking-[0.15em] font-bold text-emerald-100/80">
        Esta solicitud no habilita módulos de estudio; solo registra la preinscripción y la futura certificación.
      </p>
    </form>
  )
}

