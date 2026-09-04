import Link from 'next/link'

/**
 * Fixed notice that this render includes unpublished work.
 *
 * Without it, a draft opened in a normal tab is indistinguishable from the
 * live site — which is how people end up reporting bugs about copy no reader
 * can see. Hidden inside the live-preview iframe, where the surrounding admin
 * panel already makes the context obvious.
 */
export function PreviewBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 print:hidden">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-[13px] text-white shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-dot" />
        Draft preview — includes unpublished changes
        <Link
          href="/api/exit-preview"
          prefetch={false}
          className="rounded-full bg-white/15 px-2.5 py-1 font-medium transition-colors hover:bg-white/25"
        >
          Exit
        </Link>
      </div>
    </div>
  )
}
