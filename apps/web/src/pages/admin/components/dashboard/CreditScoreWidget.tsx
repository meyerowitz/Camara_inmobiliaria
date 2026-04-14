import React from 'react'

interface CreditScoreWidgetProps {
  score?: number
  maxScore?: number
  label?: string
  badges?: { text: string; positive: boolean }[]
}

/**
 * Circular arc credit‑score gauge matching the Figma design.
 * The arc sweeps from bottom‑left to bottom‑right (270° total).
 */
const CreditScoreWidget = ({
  score = 85,
  maxScore = 100,
  label = 'Puntaje de Crédito',
  badges = [
    { text: 'Historial conocido es óptimo', positive: true },
    { text: 'Acercando límites', positive: false },
  ],
}: CreditScoreWidgetProps) => {
  // SVG arc parameters
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const R = 46
  const strokeW = 8
  // Arc: 240° sweep starting from 150° (bottom-left)
  const START_DEG = 150
  const SWEEP_DEG = 240
  const pct = Math.min(Math.max(score / maxScore, 0), 1)

  function polarToXY(deg: number, r: number) {
    const rad = ((deg - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  function arcPath(startDeg: number, endDeg: number, r: number) {
    const start = polarToXY(startDeg, r)
    const end = polarToXY(endDeg, r)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
  }

  const trackStart = START_DEG
  const trackEnd = START_DEG + SWEEP_DEG
  const fillEnd = START_DEG + SWEEP_DEG * pct

  // Colour: green for high score, amber for mid, red for low
  const fillColor =
    pct >= 0.7 ? 'var(--color-admin-accent)' : pct >= 0.4 ? 'var(--color-warning)' : 'var(--color-danger)'

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
        <span className="text-xs text-slate-400 font-medium">Mar 2026</span>
      </div>

      {/* Gauge + score */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Track arc */}
            <path
              d={arcPath(trackStart, trackEnd, R)}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
            {/* Filled arc */}
            {pct > 0 && (
              <path
                d={arcPath(trackStart, fillEnd, R)}
                fill="none"
                stroke={fillColor}
                strokeWidth={strokeW}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Score label in centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-extrabold leading-none"
              style={{ color: fillColor }}
            >
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              / {maxScore}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2 flex-1">
          {badges.map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span
                className={[
                  'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center',
                  b.positive
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-500',
                ].join(' ')}
              >
                {b.positive ? (
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-slate-500 leading-tight">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CreditScoreWidget
