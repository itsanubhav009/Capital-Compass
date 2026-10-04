import 'server-only'

export type Weather = { temperature: number; place: string }

/**
 * Los Angeles, not "California".
 *
 * A state 1,200km long does not have a temperature. The old coordinates were
 * the geographic centre of California — open country in the Central Valley,
 * inland and hot — so the header would read "California 33.8°C" on a day the
 * coast was in the low twenties. The number was real and looked wrong, which
 * is worse than no number at all, because there is nothing a reader can check
 * it against.
 *
 * So it names a city now. Los Angeles is the state's largest, and anyone who
 * doubts the figure can look it up and get the same one.
 */
const LAT = 34.0522
const LON = -118.2437
const PLACE = 'Los Angeles'

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
  // timezone=auto so "current" means the current hour where the reading is
  // taken, rather than the current hour in UTC.
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m&temperature_unit=celsius&timezone=auto`

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null

    const json = await res.json()
    const t = json?.current?.temperature_2m
    if (typeof t !== 'number' || Number.isNaN(t)) return null

    // Rounded here rather than at the call site: one decimal place is a
    // precision the reading does not have, and it reads like instrumentation
    // in a slot that is a glance, not a measurement.
    return { temperature: Math.round(t), place: PLACE }
  } catch {
    return null
  }
}
