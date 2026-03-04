import React from 'react'

// Simple SVG sparkline / area chart — no external deps needed
interface DataPoint {
  month: string
  income: number
  expense: number
}

const DATA: DataPoint[] = [
  { month: 'Ene', income: 85000, expense: 60000 },
  { month: 'Feb', income: 92000, expense: 72000 },
  { month: 'Mar', income: 78000, expense: 58000 },
  { month: 'Abr', income: 110000, expense: 80000 },
  { month: 'May', income: 124500, expense: 90000 },
  { month: 'Jun', income: 105000, expense: 95000 },
  { month: 'Jul', income: 118000, expense: 88000 },
]

const W = 600
const H = 180
const PAD = { top: 12, right: 16, bottom: 28, left: 16 }

function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min)
}

function buildPath(points: [number, number][]): string {
  if (points.length === 0) return ''
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

const CashFlowChart = () => {
  const allValues = DATA.flatMap((d) => [d.income, d.expense])
  const minV = Math.min(...allValues) * 0.9
  const maxV = Math.max(...allValues) * 1.05

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const xOf = (i: number) => PAD.left + (i / (DATA.length - 1)) * innerW
  const yOf = (v: number) => PAD.top + (1 - normalize(v, minV, maxV)) * innerH

  const incomePoints: [number, number][] = DATA.map((d, i) => [xOf(i), yOf(d.income)])
  const expensePoints: [number, number][] = DATA.map((d, i) => [xOf(i), yOf(d.expense)])

  const areaIncome = buildPath(incomePoints) + ` L ${xOf(DATA.length - 1)} ${PAD.top + innerH} L ${xOf(0)} ${PAD.top + innerH} Z`
  const areaExpense = buildPath(expensePoints) + ` L ${xOf(DATA.length - 1)} ${PAD.top + innerH} L ${xOf(0)} ${PAD.top + innerH} Z`

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Análisis de Flujo de Caja</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ingresos vs. Gastos — últimos 7 meses</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300 inline-block" />
            Gastos
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
        <defs>
          <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D084" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00D084" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F87171" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F87171" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fills */}
        <path d={areaIncome} fill="url(#gradIncome)" />
        <path d={areaExpense} fill="url(#gradExpense)" />

        {/* Lines */}
        <path d={buildPath(incomePoints)} fill="none" stroke="#00D084" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={buildPath(expensePoints)} fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />

        {/* X-axis labels */}
        {DATA.map((d, i) => (
          <text
            key={d.month}
            x={xOf(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {d.month}
          </text>
        ))}

        {/* Tooltip dot on last point */}
        <circle cx={incomePoints[4][0]} cy={incomePoints[4][1]} r="5" fill="#00D084" />
        <rect x={incomePoints[4][0] - 28} y={incomePoints[4][1] - 28} width="56" height="20" rx="6" fill="#00D084" />
        <text x={incomePoints[4][0]} y={incomePoints[4][1] - 14} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
          $124.5k
        </text>
      </svg>
    </div>
  )
}

export default CashFlowChart
