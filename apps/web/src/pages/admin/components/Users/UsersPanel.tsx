import React, { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type MemberStatus = 'Activo' | 'Suspendido' | 'Pendiente'
type DebtStatus = 'Al día' | 'En mora' | 'Crítico'
type Plan = 'Básico' | 'Profesional' | 'Institucional'

interface Deuda {
  concepto: string
  monto: number
  vencimiento: string
}

interface Afiliado {
  id: string
  nombre: string
  cedula: string
  email: string
  telefono: string
  empresa: string
  cargo: string
  fechaAfiliacion: string
  status: MemberStatus
  deudaStatus: DebtStatus
  deudas: Deuda[]
  cursos: string[]
  cibirStatus: 'N/A' | 'Aprobado' | 'Pendiente' | 'Rechazado'
  avatar: string
  plan: Plan
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const AFILIADOS: Afiliado[] = [
  { id: '1', nombre: 'Francisco Piñango', cedula: 'V-12.340.100', email: 'fpiñango@ciebo.com', telefono: '0414-8001234', empresa: 'Inmobiliaria Orinoco', cargo: 'Director Comercial', fechaAfiliacion: 'Mar 15, 2019', status: 'Activo', deudaStatus: 'Al día', deudas: [], cursos: ['Diplomado Derecho Inmobiliario', 'Neuroventas para Corredores'], cibirStatus: 'Aprobado', avatar: 'bg-violet-400', plan: 'Institucional' },
  { id: '2', nombre: 'Zulay Amaya', cedula: 'V-18.221.456', email: 'zamaya@mail.com', telefono: '0412-5556789', empresa: 'Grupo Guayana Realty', cargo: 'Corredora Independiente', fechaAfiliacion: 'Jun 02, 2021', status: 'Activo', deudaStatus: 'En mora', deudas: [{ concepto: 'Cuota anual 2025', monto: 120, vencimiento: 'Feb 01, 2026' }], cursos: ['Marketing Digital Real Estate'], cibirStatus: 'Pendiente', avatar: 'bg-blue-400', plan: 'Profesional' },
  { id: '3', nombre: 'Carlos Medina', cedula: 'V-20.100.892', email: 'cmedina@corp.ve', telefono: '0424-3219876', empresa: 'Constructora Guayana', cargo: 'Gerente de Ventas', fechaAfiliacion: 'Jan 10, 2022', status: 'Activo', deudaStatus: 'Al día', deudas: [], cursos: ['Tasación de Inmuebles Urbanos', 'Diplomado Derecho Inmobiliario'], cibirStatus: 'Aprobado', avatar: 'bg-emerald-400', plan: 'Profesional' },
  { id: '4', nombre: 'María Bermúdez', cedula: 'V-22.334.567', email: 'mbermudez@gmail.com', telefono: '0416-7770045', empresa: 'Independiente', cargo: 'Asesora Inmobiliaria', fechaAfiliacion: 'Sep 20, 2023', status: 'Suspendido', deudaStatus: 'Crítico', deudas: [{ concepto: 'Cuota anual 2024', monto: 120, vencimiento: 'Mar 01, 2025' }, { concepto: 'Cuota anual 2025', monto: 120, vencimiento: 'Mar 01, 2026' }, { concepto: 'Inscripción curso: Tasación', monto: 35, vencimiento: 'Oct 15, 2025' }], cursos: [], cibirStatus: 'Rechazado', avatar: 'bg-rose-400', plan: 'Básico' },
  { id: '5', nombre: 'Andrés Páez', cedula: 'V-19.887.003', email: 'apaez@realty.ve', telefono: '0426-4448801', empresa: 'Bienes Raíces Bolívar', cargo: 'Asesor Senior', fechaAfiliacion: 'Apr 11, 2020', status: 'Activo', deudaStatus: 'Al día', deudas: [], cursos: ['Neuroventas para Corredores'], cibirStatus: 'Aprobado', avatar: 'bg-amber-400', plan: 'Profesional' },
  { id: '6', nombre: 'Génesis Salazar', cedula: 'V-25.112.334', email: 'gsalazar@inmopremium.com', telefono: '0412-1100223', empresa: 'InmoPremium', cargo: 'Analista Inmobiliaria', fechaAfiliacion: 'Nov 05, 2024', status: 'Pendiente', deudaStatus: 'En mora', deudas: [{ concepto: 'Inscripción inicial', monto: 60, vencimiento: 'Dec 05, 2025' }], cursos: [], cibirStatus: 'Pendiente', avatar: 'bg-cyan-400', plan: 'Básico' },
  { id: '7', nombre: 'Pedro Vallenilla', cedula: 'V-15.567.789', email: 'pvallenilla@ciebo.com', telefono: '0414-6661112', empresa: 'CIEBO', cargo: 'Dir. Comunicaciones', fechaAfiliacion: 'Feb 20, 2018', status: 'Activo', deudaStatus: 'Al día', deudas: [], cursos: ['Marketing Digital Real Estate', 'Diplomado Derecho Inmobiliario'], cibirStatus: 'Aprobado', avatar: 'bg-indigo-400', plan: 'Institucional' },
  { id: '8', nombre: 'Romelina Rodríguez', cedula: 'V-17.445.220', email: 'rrodriguez@finanzas.ve', telefono: '0424-9994567', empresa: 'Consultora Financiera', cargo: 'Directora de Finanzas', fechaAfiliacion: 'Jul 07, 2017', status: 'Activo', deudaStatus: 'Al día', deudas: [], cursos: ['Tasación de Inmuebles Urbanos'], cibirStatus: 'Aprobado', avatar: 'bg-pink-400', plan: 'Institucional' },
]

// ─── Style maps ───────────────────────────────────────────────────────────────
const MEMBER_STATUS_STYLES: Record<MemberStatus, string> = {
  Activo: 'bg-emerald-50 text-emerald-600',
  Suspendido: 'bg-red-50 text-red-500',
  Pendiente: 'bg-amber-50 text-amber-600',
}

const DEBT_STATUS_STYLES: Record<DebtStatus, { pill: string; bar: string }> = {
  'Al día': { pill: 'bg-emerald-50 text-emerald-600', bar: '#00D084' },
  'En mora': { pill: 'bg-amber-50 text-amber-600', bar: '#F59E0B' },
  'Crítico': { pill: 'bg-red-50 text-red-500', bar: '#F87171' },
}

const CIBIR_STYLES: Record<Afiliado['cibirStatus'], string> = {
  'N/A': 'bg-slate-100 text-slate-400',
  'Aprobado': 'bg-emerald-50 text-emerald-600',
  'Pendiente': 'bg-amber-50 text-amber-600',
  'Rechazado': 'bg-red-50 text-red-500',
}

const PLAN_STYLES: Record<Plan, string> = {
  'Básico': 'bg-slate-100 text-slate-600',
  'Profesional': 'bg-blue-50 text-blue-600',
  'Institucional': 'bg-violet-50 text-violet-600',
}

// ─── Info row helper ──────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className='flex flex-col gap-0.5'>
    <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wide'>{label}</span>
    <span className='text-sm text-slate-800 font-medium break-all'>{value}</span>
  </div>
)

// ─── Profile panel ────────────────────────────────────────────────────────────
const ProfilePanel = ({
  afiliado,
  onBack,
}: {
  afiliado: Afiliado
  onBack?: () => void
}) => {
  const totalDeuda = afiliado.deudas.reduce((a, d) => a + d.monto, 0)

  return (
    <div className='flex-1 min-w-0 overflow-y-auto bg-gray-50 p-4 sm:p-5 flex flex-col gap-4'>
      {/* Back button — mobile only */}
      {onBack && (
        <button
          onClick={onBack}
          className='sm:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors self-start'
        >
          <svg viewBox='0 0 24 24' className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
            <polyline points='15 18 9 12 15 6' />
          </svg>
          Volver a la lista
        </button>
      )}

      {/* Header card */}
      <div className='bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 flex-wrap'>
        <div className={`w-12 h-12 rounded-2xl ${afiliado.avatar} flex items-center justify-center text-white text-lg font-black flex-shrink-0`}>
          {afiliado.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-base font-bold text-slate-900 leading-tight'>{afiliado.nombre}</h3>
          <p className='text-xs text-slate-400 mt-0.5 truncate'>{afiliado.cargo} · {afiliado.empresa}</p>
          <p className='text-[10px] text-slate-300 mt-0.5'>{afiliado.cedula}</p>
        </div>
        <div className='flex flex-col items-end gap-1.5 flex-shrink-0'>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${MEMBER_STATUS_STYLES[afiliado.status]}`}>
            {afiliado.status}
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${PLAN_STYLES[afiliado.plan]}`}>
            {afiliado.plan}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className='bg-white rounded-2xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <InfoRow label='Email' value={afiliado.email} />
        <InfoRow label='Teléfono' value={afiliado.telefono} />
        <InfoRow label='Empresa' value={afiliado.empresa} />
        <InfoRow label='Cargo' value={afiliado.cargo} />
        <InfoRow label='Fecha de afiliación' value={afiliado.fechaAfiliacion} />
      </div>

      {/* Deuda section */}
      <div className={`rounded-2xl p-4 border ${afiliado.deudaStatus === 'Al día' ? 'bg-white border-gray-100' : 'bg-white border-red-100'}`}>
        <div className='flex items-center justify-between mb-3 gap-2 flex-wrap'>
          <div>
            <h4 className='text-sm font-semibold text-slate-800'>Estado Financiero</h4>
            <p className='text-[10px] text-slate-400 mt-0.5'>Deudas y pagos pendientes</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${DEBT_STATUS_STYLES[afiliado.deudaStatus].pill}`}>
            {afiliado.deudaStatus}
          </span>
        </div>

        {afiliado.deudas.length === 0 ? (
          <div className='flex items-center gap-2 py-2'>
            <svg viewBox='0 0 24 24' className='w-5 h-5 text-emerald-400 flex-shrink-0' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
              <polyline points='20 6 9 17 4 12' />
            </svg>
            <span className='text-sm text-slate-500'>Sin deudas pendientes</span>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            {afiliado.deudas.map((d, i) => (
              <div key={i} className='flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0'>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium text-slate-700 truncate'>{d.concepto}</p>
                  <p className='text-[10px] text-slate-400 mt-0.5'>Vence: {d.vencimiento}</p>
                </div>
                <span className='flex-shrink-0 text-sm font-bold text-red-500 tabular-nums'>${d.monto}</span>
              </div>
            ))}
            <div className='flex items-center justify-between pt-2 mt-1 border-t border-gray-100'>
              <span className='text-xs font-semibold text-slate-500'>Total adeudado</span>
              <span className='text-base font-black text-red-500 tabular-nums'>${totalDeuda}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actividad gremial */}
      <div className='bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-3'>
        <h4 className='text-sm font-semibold text-slate-800'>Actividad Gremial</h4>
        <div className='flex items-center justify-between'>
          <span className='text-xs text-slate-500'>CIBIR</span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${CIBIR_STYLES[afiliado.cibirStatus]}`}>
            {afiliado.cibirStatus}
          </span>
        </div>
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs text-slate-500'>Cursos inscritos</span>
          {afiliado.cursos.length === 0 ? (
            <span className='text-xs text-slate-300 italic'>Sin cursos registrados</span>
          ) : (
            <div className='flex flex-wrap gap-1.5'>
              {afiliado.cursos.map((c, i) => (
                <span key={i} className='text-[10px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full'>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <button className='flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors'>
          Editar Perfil
        </button>
        {afiliado.status === 'Activo' ? (
          <button className='flex-1 py-2.5 rounded-xl border border-red-100 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors'>
            Suspender
          </button>
        ) : (
          <button className='flex-1 py-2.5 rounded-xl bg-[#00D084] text-white text-xs font-semibold hover:bg-[#00B870] transition-colors'>
            Activar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
type FilterType = 'Todos' | MemberStatus | DebtStatus

const UsersPanel = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('Todos')
  const [selected, setSelected] = useState<Afiliado | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return AFILIADOS.filter(a => {
      const matchSearch = (
        a.nombre.toLowerCase().includes(q) ||
        a.cedula.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.empresa.toLowerCase().includes(q)
      )
      const matchFilter =
        filter === 'Todos' ? true :
          (a.status === filter || a.deudaStatus === filter)
      return matchSearch && matchFilter
    })
  }, [search, filter])

  const counts = {
    Todos: AFILIADOS.length,
    Activo: AFILIADOS.filter(a => a.status === 'Activo').length,
    Suspendido: AFILIADOS.filter(a => a.status === 'Suspendido').length,
    Pendiente: AFILIADOS.filter(a => a.status === 'Pendiente').length,
    'En mora': AFILIADOS.filter(a => a.deudaStatus === 'En mora').length,
    'Crítico': AFILIADOS.filter(a => a.deudaStatus === 'Crítico').length,
  }

  const FILTERS: { id: FilterType; label: string; dot?: string }[] = [
    { id: 'Todos', label: 'Todos' },
    { id: 'Activo', label: 'Activos', dot: 'bg-emerald-400' },
    { id: 'Suspendido', label: 'Suspendidos', dot: 'bg-red-400' },
    { id: 'Pendiente', label: 'Pendientes', dot: 'bg-amber-400' },
    { id: 'En mora', label: 'En mora', dot: 'bg-amber-400' },
    { id: 'Crítico', label: 'Crítico', dot: 'bg-red-500' },
  ]

  return (
    <div className='flex h-full overflow-hidden'>

      {/* ── Left: search + list ── */}
      <div className={[
        'flex flex-col bg-white border-r border-gray-100 overflow-hidden',
        'w-full sm:w-[280px] md:w-[300px] flex-shrink-0',
        // On mobile: hide list when a profile is selected
        selected ? 'hidden sm:flex' : 'flex',
      ].join(' ')}>

        {/* Search */}
        <div className='px-4 pt-4 pb-2'>
          <div className='relative'>
            <svg viewBox='0 0 24 24' className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
              <circle cx='11' cy='11' r='8' /><line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Buscar afiliado…'
              className='w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-100 placeholder-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00D084]/40 focus:border-[#00D084] transition-all'
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className='px-4 pb-3 flex flex-wrap gap-1'>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={[
                'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors',
                filter === f.id ? 'bg-[#00D084] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200',
              ].join(' ')}
            >
              {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${filter === f.id ? 'bg-white' : f.dot}`} />}
              {f.label}
              <span className={['text-[9px] px-1 rounded-full font-bold', filter === f.id ? 'bg-white/20' : 'bg-white text-slate-400'].join(' ')}>
                {counts[f.id as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Affiliate list */}
        <div className='flex-1 overflow-y-auto divide-y divide-gray-50'>
          {filtered.length === 0 ? (
            <p className='text-xs text-slate-400 text-center py-10'>Sin resultados</p>
          ) : filtered.map(a => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={[
                'w-full text-left px-4 py-3 transition-colors flex items-center gap-3',
                selected?.id === a.id ? 'bg-[#E9FAF4]' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              <div className={`w-9 h-9 rounded-xl ${a.avatar} flex items-center justify-center text-white text-sm font-black flex-shrink-0`}>
                {a.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className='flex-1 min-w-0'>
                <p className={['text-sm font-semibold truncate', selected?.id === a.id ? 'text-[#00B870]' : 'text-slate-800'].join(' ')}>
                  {a.nombre}
                </p>
                <p className='text-[10px] text-slate-400 truncate'>{a.empresa}</p>
              </div>
              <div className='flex flex-col items-end gap-1 flex-shrink-0'>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${MEMBER_STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${DEBT_STATUS_STYLES[a.deudaStatus].pill}`}>
                  {a.deudaStatus}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer count */}
        <div className='border-t border-gray-100 px-4 py-2.5'>
          <p className='text-[10px] text-slate-400'>{filtered.length} de {AFILIADOS.length} afiliados</p>
        </div>
      </div>

      {/* ── Right: profile panel ── */}
      <div className={[
        'flex-1 min-w-0',
        selected ? 'flex flex-col' : 'hidden sm:flex sm:flex-col',
      ].join(' ')}>
        {selected ? (
          <ProfilePanel
            afiliado={selected}
            onBack={() => setSelected(null)}
          />
        ) : (
          <div className='flex flex-col items-center justify-center h-full gap-3 text-slate-300'>
            <svg viewBox='0 0 24 24' className='w-12 h-12' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
            <p className='text-sm font-medium'>Selecciona un afiliado</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default UsersPanel
