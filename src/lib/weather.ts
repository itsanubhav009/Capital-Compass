import 'server-only'

export type Weather = { temperature: number; place: string }

/** Geographic centre of California. */
const LAT = 36.7783
const LON = -119.4179
const PLACE = 'California'

/**
 * Current temperature, from Open-Meteo.
 *
 * Chosen because it needs no API key and no account, so the widget cannot
 * quietly break the day a free tier ends or a key rotates.
 *
 * Cached for fifteen minutes. The reading barely moves inside that window,
 * and without it every uncached page render would make an outbound call
 * before it could return the header.
 *
 * Returns null rather than throwing on any failure. A missing readout hides
 * the widget; a throw here would take the whole site's header down over a
 * decorative number.
 */
export async function getWeather(): Promise<Weather | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m&temperature_unit=celsius`

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null

    const json = await res.json()
    const t = json?.current?.temperature_2m
    if (typeof t !== 'number' || Number.isNaN(t)) return null

    return { temperature: t, place: PLACE }
  } catch {
    return null
  }
}
