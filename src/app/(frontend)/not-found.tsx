import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8">
      <span className="eyebrow">404</span>
      <h1 className="mt-3 text-[32px]">That page is not here.</h1>
      <p className="mt-3 text-[16px] text-ink-soft">
        It may have been renamed, or the link may be mistyped.
      </p>
      <Link
        href="/"
        className="mt-7 inline-block bg-deep px-5 py-2.5 text-[14px] font-medium text-paper hover:bg-deep-soft"
      >
        Back to the homepage
      </Link>
    </div>
  )
}
