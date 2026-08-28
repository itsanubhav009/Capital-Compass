import Link from 'next/link'
import { crore, dayMonth, direction, flowWord, signed } from '@/lib/format'

const TONE = {
  inflow: { bar: 'bg-inflow', text: 'text-inflow' },
  outflow: { bar: 'bg-outflow', text: 'text-outflow' },
  flat: { bar: 'bg-flat', text: 'text-ink-faint' },
} as const

/**
 * The site's signature element.
 *
 * A centre-zero axis: the bar grows right from the midpoint for net buying and
 * left for net selling. This is deliberately not a 0–10 progress bar — a filled
 * bar next to a ticker reads as a rating, and the brief forbids anything that
 * looks like a recommendation. Direction and magnitude, nothing more.
 */
export function FlowBar({
  label,
  value,
  compact = false,
}: {
  label: string
  value?: number | null
  compact?: boolean
}) {
  const dir = direction(value)
  const tone = TONE[dir]
  const magnitude = Math.min(Math.abs(value ?? 0), 100) / 2 // half-width axis

  return (
    <div className={compact ? '' : 'py-2.5'}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink-soft">{label}</span>
        <span className={`tnum text-[13px] font-medium ${tone.text}`}>{signed(value)}</span>
      </div>

      <div
        className="relative mt-1.5 h-[6px] w-full bg-sunken"
        role="img"
        aria-label={`${label}: ${signed(value)} out of 100. ${flowWord(value)}.`}
      >
        {/* zero line */}
        <span className="absolute left-1/2 top-[-3px] h-3 w-px -translate-x-1/2 bg-rule-strong" />
        <span
          className={`absolute top-0 h-full ${tone.bar}`}
          style={
            dir === 'outflow'
              ? { right: '50%', width: `${magnitude}%` }
              : { left: '50%', width: `${magnitude}%` }
          }
        />
      </div>

      {!compact && (
        <p className="mt-1 text-[11px] text-ink-faint">{flowWord(value)}</p>
      )}
    </div>
  )
}

/** The full five-indicator panel on a Smart Money Report. */
export function FlowPanel({
  flows,
  explainer,
}: {
  flows?: Record<string, any> | null
  explainer: string
}) {
  if (!flows) return null
  const rows = [
    ['FII flow', flows.fii],
    ['DII flow', flows.dii],
    ['Promoter flow', flows.promoter],
    ['Technical trend', flows.technical],
    ['Fundamental trend', flows.fundamental],
  ] as const

  return (
    <aside className="border border-rule bg-surface p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
        <h2 className="eyebrow !text-deep">Flow indicators</h2>
        {flows.asOf && (
          <span className="tnum text-[11px] text-ink-faint">as of {dayMonth(flows.asOf)}</span>
        )}
      </div>

      <div className="divide-y divide-rule">
        {rows.map(([label, value]) => (
          <FlowBar key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-rule pt-3">
        <span className="text-[11px] text-ink-faint">Net selling</span>
        <span className="text-[11px] text-ink-faint">Net buying</span>
      </div>

      {flows.basis && (
        <p className="mt-3 text-[12px] text-ink-soft">
          Measured over: <span className="tnum">{flows.basis}</span>
        </p>
      )}

      <p className="mt-3 border-t border-rule pt-3 text-[12px] leading-relaxed text-ink-faint">
        {explainer}
      </p>
    </aside>
  )
}

/**
 * Homepage strip of latest institutional activity.
 *
 * Static grid, not an auto-scrolling ticker. The brief bans tickers outright,
 * and a moving strip is also the single worst thing you can do to a Cumulative
 * Layout Shift score.
 */
export function FlowTape({ heading, rows }: { heading: string; rows: any[] }) {
  if (!rows?.length) return null

  return (
    <section aria-labelledby="flow-tape" className="border-y border-rule bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="flow-tape" className="eyebrow">
            {heading}
          </h2>
          <Link
            href="/capital-flow-india"
            className="text-[13px] text-deep underline decoration-brass-soft underline-offset-4"
          >
            All reports
          </Link>
        </div>

        <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const net = r.flows?.fii ?? 0
            const tone = TONE[direction(net)]
            return (
              <li key={r.id} className="border-t border-rule pt-3">
                <Link href={`/insight/${r.slug}`} className="group block">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="tnum text-[13px] font-medium tracking-wide text-ink">
                      {r.ticker || r.stockName}
                    </span>
                    <span className={`tnum text-[13px] font-semibold ${tone.text}`}>
                      {signed(net)}
                    </span>
                  </div>
                  <FlowBar label="" value={net} compact />
                  <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[12px] text-ink-faint group-hover:text-deep">
                      {flowWord(net)}
                    </span>
                    <span className="tnum text-[11px] text-ink-faint">
                      {r.marketCapCr ? crore(r.marketCapCr) : r.marketCapBand}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
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
    <span className={`tnum text-[11px] ${i.tone}`} aria-label={`${i.word} for Indian assets`}>
      <span aria-hidden>{i.mark}</span> {i.word}
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
  return <span className={`eyebrow !text-inherit ${t.tone}`}>{t.word}</span>
}
