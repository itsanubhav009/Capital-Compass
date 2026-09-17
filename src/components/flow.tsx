import Link from 'next/link'
import { crore, dayMonth, direction, flowWord, signed } from '@/lib/format'
import { Head } from '@/components/sections'

const TONE = {
  inflow: { bar: 'bg-inflow', text: 'text-inflow' },
  outflow: { bar: 'bg-outflow', text: 'text-outflow' },
  flat: { bar: 'bg-flat', text: 'text-ink-faint' },
} as const

/**
 * The site's signature element.
 *
 * A centre-zero axis: the bar grows right from the midpoint for net buying and
 * left for net selling. Deliberately not a 0–10 progress bar — a filled bar
 * next to a ticker reads as a rating, and the brief forbids anything that looks
 * like a recommendation. Direction and magnitude, nothing more.
 */
export function FlowBar({
  label,
  value,
  compact = false,
  showValue = true,
}: {
  label: string
  value?: number | null
  compact?: boolean
  showValue?: boolean
}) {
  const dir = direction(value)
  const tone = TONE[dir]
  const magnitude = Math.min(Math.abs(value ?? 0), 100) / 2 // half-width axis

  return (
    <div className={compact ? '' : 'py-2.5'}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="text-[13px] font-medium text-ink-soft">{label}</span>}
          {showValue && (
            <span className={`tnum text-[13px] font-semibold ${tone.text}`}>{signed(value)}</span>
          )}
        </div>
      )}

      <div
        className="relative mt-1.5 h-[6px] w-full bg-sunken"
        role="img"
        aria-label={`${label || 'Flow'}: ${signed(value)} out of 100. ${flowWord(value)}.`}
      >
        <span className="absolute left-1/2 top-[-3px] h-3 w-px -translate-x-1/2 bg-rule-strong" />
        <span
          className={`absolute top-0 h-full transition-all duration-500 ${tone.bar}`}
          style={
            dir === 'outflow'
              ? { right: '50%', width: `${magnitude}%` }
              : { left: '50%', width: `${magnitude}%` }
          }
        />
      </div>

      {!compact && <p className="mt-1 text-[11px] text-ink-faint">{flowWord(value)}</p>}
    </div>
  )
}

const IMPACT = {
  positive: { mark: '▲', tone: 'text-inflow', word: 'Supportive' },
  neutral: { mark: '■', tone: 'text-ink-faint', word: 'Neutral' },
  negative: { mark: '▼', tone: 'text-outflow', word: 'Headwind' },
} as const

export function ImpactMark({ impact }: { impact?: keyof typeof IMPACT | null }) {
  const i = IMPACT[impact ?? 'neutral'] ?? IMPACT.neutral
  return (
    <span
      className={`flex items-center gap-1.5 text-[12.5px] font-medium ${i.tone}`}
      aria-label={`${i.word} for Indian assets`}
    >
      <span aria-hidden className="text-[10px]">
        {i.mark}
      </span>
      {i.word}
    </span>
  )
}

const TREND = {
  accelerating: { tone: 'text-inflow', word: 'Accelerating' },
  steady: { tone: 'text-ink-soft', word: 'Steady' },
  cooling: { tone: 'text-brass', word: 'Cooling' },
  reversing: { tone: 'text-outflow', word: 'Reversing' },
} as const

export function TrendMark({ trend }: { trend?: keyof typeof TREND | null }) {
  const t = TREND[trend ?? 'steady'] ?? TREND.steady
  return (
    <span
      className={`text-[11.5px] font-bold uppercase tracking-wider ${t.tone}`}
    >
      {t.word}
    </span>
  )
}
