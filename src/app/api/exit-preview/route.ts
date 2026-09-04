import { draftMode } from 'next/headers'

export const dynamic = 'force-dynamic'

/** Leaves draft mode and returns to the published site. */
export async function GET() {
  ;(await draftMode()).disable()
  return new Response(null, { status: 307, headers: { Location: '/' } })
}
