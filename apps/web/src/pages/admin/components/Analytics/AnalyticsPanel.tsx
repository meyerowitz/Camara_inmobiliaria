import React from 'react'

// ─── SVG mini-helpers ─────────────────────────────────────────────────────────
function buildSmoothedPath(points: [number, number][]): string {
  if (points.length < 2) return ''
  const [sx, sy] = points[0]
  let d = `M ${sx} ${sy}`
  for (let i = 1; i < points.length; i++) {
    const [cx, cy] = points[i - 1]
    const [nx, ny] = points[i]
    const mx = (cx + nx) / 2
    d += ` C ${mx} ${cy} ${mx} ${ny} ${nx} ${ny}`
  }
  return d
}

// ─── Shared KPI card ──────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  change?: string
  positive?: boolean
  accent?: string
  icon: React.ReactNode
}

const KpiCard = ({ label, value, sub, change, positive = true, accent = 'bg-emerald-50', icon }: KpiCardProps) => (
  <div className='bg-white rounded-2xl p-3 sm:p-5 border border-gray-100 flex flex-col gap-2 sm:gap-3 w-full'>
    <div className='flex items-center justify-between gap-1'>
      <span className='text-xs font-medium text-slate-400 truncate'>{label}</span>
      <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${accent} flex items-center justify-center`}>{icon}</div>
    </div>
    {/* Value stacks vertically on mobile, side-by-side on sm+ */}
    <div className='flex flex-col items-start gap-1'>
      <p className='text-xl sm:text-2xl font-bold text-slate-900 leading-none'>{value}</p>
      {sub && <p className='text-[10px] text-slate-400'>{sub}</p>}
      {change && (
        <span className={[
          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5',
          positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
        ].join(' ')}>
          {positive ? '▲' : '▼'} {change}
        </span>
      )}
    </div>
  </div>
)

// ─── Sparkline area chart ─────────────────────────────────────────────────────
interface SparklineProps {
  data: number[]
  labels?: string[]
  color?: string
  fill?: string
  height?: number
  label?: string
  sub?: string
}

const SparklineChart = ({ data, labels, color = '#00D084', fill = 'url(#gSpark)', height = 120, label, sub }: SparklineProps) => {
  const W = 440; const H = height
  const PAD = { top: 10, right: 8, bottom: 22, left: 8 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const min = Math.min(...data) * 0.9
  const max = Math.max(...data) * 1.05
  const norm = (v: number) => (v - min) / (max - min)
  const xOf = (i: number) => PAD.left + (i / (data.length - 1)) * innerW
  const yOf = (v: number) => PAD.top + (1 - norm(v)) * innerH
  const pts: [number, number][] = data.map((v, i) => [xOf(i), yOf(v)])
  const line = buildSmoothedPath(pts)
  const area = line + ` L ${xOf(data.length - 1)} ${PAD.top + innerH} L ${xOf(0)} ${PAD.top + innerH} Z`

  return (
    <div className='bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3'>
      {label && (
        <div>
          <h3 className='text-sm font-semibold text-slate-800'>{label}</h3>
          {sub && <p className='text-xs text-slate-400 mt-0.5'>{sub}</p>}
        </div>
      )}
      {/* width/height as HTML attrs + preserveAspectRatio ensures proper responsive scaling */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id='gSpark' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color} stopOpacity='0.2' />
            <stop offset='100%' stopColor={color} stopOpacity='0.02' />
          </linearGradient>
          <linearGradient id='gSpark2' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#6366f1' stopOpacity='0.15' />
            <stop offset='100%' stopColor='#6366f1' stopOpacity='0.02' />
          </linearGradient>
        </defs>
        <path d={area} fill={fill} />
        <path d={line} fill='none' stroke={color} strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
        {/* Last dot + tooltip */}
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r='4' fill={color} />
        {labels && labels.map((l, i) => (
          <text key={l} x={xOf(i)} y={H - 4} textAnchor='middle' fontSize='9' fill='#94a3b8'>{l}</text>
        ))}
      </svg>
    </div>
  )
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
interface DonutSlice { label: string; value: number; color: string }

const DonutChart = ({ slices, title, sub }: { slices: DonutSlice[]; title: string; sub?: string }) => {
  const total = slices.reduce((a, s) => a + s.value, 0)
  const R = 40; const cx = 60; const cy = 60; const STROKE = 14
  let cumulative = 0

  const arcs = slices.map(s => {
    const pct = s.value / total
    const start = cumulative
    cumulative += pct
    return { ...s, pct, start }
  })

  function arcD(start: number, pct: number) {
    const r = R
    const startAngle = start * 2 * Math.PI - Math.PI / 2
    const endAngle = (start + pct) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const large = pct > 0.5 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  return (
    <div className='bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col gap-3'>
      <div>
        <h3 className='text-sm font-semibold text-slate-800'>{title}</h3>
        {sub && <p className='text-xs text-slate-400 mt-0.5'>{sub}</p>}
      </div>
      <div className='flex items-center gap-3 sm:gap-5'>
        <svg width='120' height='120' viewBox='0 0 120 120' className='flex-shrink-0'>
          <circle cx={cx} cy={cy} r={R} fill='none' stroke='#f1f5f9' strokeWidth={STROKE} />
          {arcs.map((a, i) => (
            <path
              key={i}
              d={arcD(a.start, a.pct)}
              fill='none'
              stroke={a.color}
              strokeWidth={STROKE}
              strokeLinecap='round'
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor='middle' fontSize='16' fontWeight='700' fill='#0f172a'>{total}</text>
          <text x={cx} y={cy + 12} textAnchor='middle' fontSize='8' fill='#94a3b8'>Total</text>
        </svg>
        <div className='flex flex-col gap-2 flex-1'>
          {arcs.map((a, i) => (
            <div key={i} className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full flex-shrink-0' style={{ background: a.color }} />
                <span className='text-xs text-slate-600'>{a.label}</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                  <div className='h-full rounded-full' style={{ width: `${a.pct * 100}%`, background: a.color }} />
                </div>
                <span className='text-xs font-semibold text-slate-700 tabular-nums w-6 text-right'>{a.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────
interface BarItem { label: string; value: number; max: number; color?: string }

const HorizontalBars = ({ items, title, sub }: { items: BarItem[]; title: string; sub?: string }) => (
  <div className='bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-4'>
    <div>
      <h3 className='text-sm font-semibold text-slate-800'>{title}</h3>
      {sub && <p className='text-xs text-slate-400 mt-0.5'>{sub}</p>}
    </div>
    <div className='flex flex-col gap-3'>
      {items.map((item, i) => (
        <div key={i} className='flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-slate-600 truncate max-w-[180px]'>{item.label}</span>
            <span className='text-xs font-semibold text-slate-800 tabular-nums ml-2'>{item.value}/{item.max}</span>
          </div>
          <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
            <div
              className='h-full rounded-full transition-all duration-700'
              style={{ width: `${(item.value / item.max) * 100}%`, background: item.color ?? '#00D084' }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ─── Recent activity feed ─────────────────────────────────────────────────────
interface Activity { time: string; text: string; type: 'cibir' | 'curso' | 'cms' | 'finance' }

const ACTIVITIES: Activity[] = [
  { time: 'Hace 8 min', text: 'Daniela Rojas aprobada en CIBIR', type: 'cibir' },
  { time: 'Hace 22 min', text: 'Artículo "Penthouse City Views" publicado', type: 'cms' },
  { time: 'Hace 1h', text: 'Transacción $2,450 — Rental Income registrada', type: 'finance' },
  { time: 'Hace 2h', text: 'Andrés Páez aprobado en CIBIR', type: 'cibir' },
  { time: 'Hace 3h', text: 'Nuevo inscrito: Diplomado Derecho Inmobiliario', type: 'curso' },
  { time: 'Hace 5h', text: 'Artículo "Mercado Q4" enviado a revisión', type: 'cms' },
  { time: 'Hoy 09:00', text: 'Transferencia $6,500 — Commercial Lease Payment', type: 'finance' },
]

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  cibir: 'bg-emerald-400',
  cms: 'bg-violet-400',
  finance: 'bg-blue-400',
  curso: 'bg-amber-400',
}
const ACTIVITY_LABELS: Record<Activity['type'], string> = {
  cibir: 'CIBIR',
  cms: 'CMS',
  finance: 'Finanzas',
  curso: 'Formación',
}

// ─── Analytics Data ───────────────────────────────────────────────────────────
const VISITS_DATA = [820, 940, 880, 1100, 1250, 1080, 1320, 1180, 1400, 1350, 1520, 1650]
const VISITS_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const CIBIR_SLICES: DonutSlice[] = [
  { label: 'Aprobados', value: 18, color: '#00D084' },
  { label: 'Pendientes', value: 3, color: '#F59E0B' },
  { label: 'Rechazados', value: 4, color: '#F87171' },
]

const ARTICLE_SLICES: DonutSlice[] = [
  { label: 'Publicados', value: 24, color: '#6366f1' },
  { label: 'Borradores', value: 7, color: '#94a3b8' },
  { label: 'Revisión', value: 3, color: '#F59E0B' },
]

const CURSO_BARS: BarItem[] = [
  { label: 'Diplomado Derecho Inmobiliario', value: 18, max: 25, color: '#6366f1' },
  { label: 'Marketing Digital Real Estate', value: 30, max: 30, color: '#00D084' },
  { label: 'Tasación de Inmuebles Urbanos', value: 12, max: 20, color: '#F59E0B' },
  { label: 'Neuroventas para Corredores', value: 25, max: 25, color: '#F87171' },
]

const INCOME_DATA = [85000, 92000, 78000, 110000, 124500, 105000, 118000, 101000, 130000, 112000, 140000, 128400]

// ─── Main panel ───────────────────────────────────────────────────────────────
const AnalyticsPanel = () => (
  <div className='flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 overflow-y-auto h-full w-full'>

    {/* ── KPI Row ─────────────────────────────────────────── */}
    <div className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4'>
      <KpiCard
        label='Afiliados Activos'
        value='347'
        change='+12'
        positive
        accent='bg-emerald-50'
        icon={<svg viewBox='0 0 24 24' className='w-5 h-5 text-emerald-500' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' /><circle cx='9' cy='7' r='4' /><path d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' /></svg>}
      />
      <KpiCard
        label='Visitas este mes'
        value='1,650'
        change='+8.6%'
        positive
        accent='bg-blue-50'
        icon={<svg viewBox='0 0 24 24' className='w-5 h-5 text-blue-400' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' /><circle cx='12' cy='12' r='3' /></svg>}
      />
      <KpiCard
        label='Balance Total'
        value='$124,500'
        change='+4.6%'
        positive
        accent='bg-emerald-50'
        icon={<svg viewBox='0 0 24 24' className='w-5 h-5 text-emerald-500' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='1' x2='12' y2='23' /><path d='M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' /></svg>}
      />
      <KpiCard
        label='Ingreso Mensual'
        value='$28,400'
        change='+9%'
        positive
        accent='bg-blue-50'
        icon={<svg viewBox='0 0 24 24' className='w-5 h-5 text-blue-400' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='23 6 13.5 15.5 8.5 10.5 1 18' /><polyline points='17 6 23 6 23 12' /></svg>}
      />
      <KpiCard
        label='Artículos'
        value='34'
        sub='24 publicados · 10 en proceso'
        accent='bg-violet-50'
        icon={<svg viewBox='0 0 24 24' className='w-5 h-5 text-violet-500' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' /><polyline points='14 2 14 8 20 8' /></svg>}
      />
      <KpiCard
        label='CIBIR Pendientes'
        value='3'
        sub='18 aprobados · 4 rechazados'
        positive={false}
        accent='bg-amber-50'
        icon={<svg viewBox='0 0 24 24' className='w-5 h-5 text-amber-500' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 10v6M2 10l10-5 10 5-10 5z' /><path d='M6 12v5c3 3 9 3 12 0v-5' /></svg>}
      />
    </div>

    {/* ── Charts row 1 ────────────────────────────────────── */}
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <div className='lg:col-span-2'>
        <SparklineChart
          data={VISITS_DATA}
          labels={VISITS_LABELS}
          color='#6366f1'
          fill='url(#gSpark2)'
          height={130}
          label='Visitas al sitio web'
          sub='Tráfico mensual — Ene a Dic 2025'
        />
      </div>
      <DonutChart
        slices={CIBIR_SLICES}
        title='Solicitudes CIBIR'
        sub='Estado actual del programa'
      />
    </div>

    {/* ── Charts row 2 ────────────────────────────────────── */}
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <div className='lg:col-span-2'>
        <SparklineChart
          data={INCOME_DATA}
          labels={VISITS_LABELS}
          color='#00D084'
          fill='url(#gSpark)'
          height={130}
          label='Flujo de Ingresos'
          sub='Ingresos mensuales en USD — 2025'
        />
      </div>
      <DonutChart
        slices={ARTICLE_SLICES}
        title='Estado de Artículos'
        sub='CMS — contenido publicado'
      />
    </div>

    {/* ── Charts row 3 ────────────────────────────────────── */}
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <HorizontalBars
        items={CURSO_BARS}
        title='Inscripción por Curso'
        sub='Cupos ocupados sobre total disponible'
      />

      {/* Activity feed */}
      <div className='bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-4'>
        <div>
          <h3 className='text-sm font-semibold text-slate-800'>Actividad Reciente</h3>
          <p className='text-xs text-slate-400 mt-0.5'>Últimos eventos de todos los módulos</p>
        </div>
        <div className='flex flex-col gap-0'>
          {ACTIVITIES.map((a, i) => (
            <div key={i} className='flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0'>
              <span className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${ACTIVITY_COLORS[a.type]}`} />
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-slate-700 leading-snug'>{a.text}</p>
                <p className='text-[10px] text-slate-400 mt-0.5'>{a.time}</p>
              </div>
              <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${ACTIVITY_COLORS[a.type]}`}>
                {ACTIVITY_LABELS[a.type]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Summary stats ────────────────────────────────────── */}
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
      {[
        { label: 'Cursos Activos', value: '2', icon: '📚' },
        { label: 'Próximos Cursos', value: '1', icon: '📅' },
        { label: 'Gastos del Mes', value: '$12,150', icon: '📉' },
        { label: 'Ganancia Neta', value: '$16,250', icon: '💹' },
      ].map(s => (
        <div key={s.label} className='bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3'>
          <span className='text-2xl'>{s.icon}</span>
          <div>
            <p className='text-xs text-slate-400 font-medium'>{s.label}</p>
            <p className='text-base font-bold text-slate-900'>{s.value}</p>
          </div>
        </div>
      ))}
    </div>

  </div>
)

export default AnalyticsPanel
