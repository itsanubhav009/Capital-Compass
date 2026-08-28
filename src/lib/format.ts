export type FlowDirection = 'inflow' | 'outflow' | 'flat'

export const direction = (n?: number | null): FlowDirection => {
  if (n === null || n === undefined || Math.abs(n) < 3) return 'flat'
  return n > 0 ? 'inflow' : 'outflow'
}

/** "+42" / "-17" / "—". The sign carries the meaning, so never drop it. */
export const signed = (n?: number | null): string => {
  if (n === null || n === undefined) return '—'
  return n > 0 ? `+${n}` : `${n}`
}

export const flowWord = (n?: number | null): string => {
  const d = direction(n)
  if (d === 'flat') return 'Flat'
  const m = Math.abs(n as number)
  const strength = m >= 60 ? 'Heavy net' : m >= 25 ? 'Net' : 'Light net'
  return `${strength} ${d === 'inflow' ? 'buying' : 'selling'}`
}

export const crore = (n?: number | null): string => {
  if (!n && n !== 0) return '—'
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} lakh cr`
  return `₹${n.toLocaleString('en-IN')} cr`
}

export const shortDate = (iso?: string | null): string =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

export const dayMonth = (iso?: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''

export const readingTime = (words: number): number => Math.max(1, Math.round(words / 230))

export const KIND_LABEL: Record<string, string> = {
  'smart-money-reports': 'Smart Money Report',
  'macro-notes': 'Macro Note',
  'theme-reports': 'Theme Report',
  'wealth-articles': 'Analysis',
}
