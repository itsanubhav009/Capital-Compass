export const dynamic = 'force-dynamic'
export async function GET() {
  const u = process.env.DATABASE_URI
  return Response.json({
    present: Boolean(u),
    length: u?.length ?? 0,
    host: u?.split('@')[1]?.split('/')[0] ?? null,
  })
}
