import Image from 'next/image'

/**
 * A reserved advertising position.
 *
 * Nothing here calls an ad network. The slot renders at the exact size the
 * creative will occupy so the page does not reflow the day an ad is dropped
 * in — an empty div that collapses to zero height is how a page ends up
 * jumping under the reader once advertising goes live.
 *
 * To fill one, pass `image` + `href` (a house ad or a directly sold banner),
 * or replace the placeholder body with the network's script tag. Until then
 * it is labelled as reserved space rather than pretending to be an advert.
 */
export function AdSlot({
  variant = 'leaderboard',
  label = 'Advertisement',
  note,
  image,
  href,
  alt = '',
  className = '',
}: {
  /** leaderboard: the top banner. rail: the sidebar rectangle. */
  variant?: 'leaderboard' | 'rail'
  label?: string
  note?: string
  image?: string | null
  href?: string
  alt?: string
  className?: string
}) {
  const box =
    variant === 'leaderboard'
      ? 'h-[100px] min-w-0'
      : 'aspect-[4/3] w-full'

  const body = image ? (
    <Image
      src={image}
      alt={alt}
      fill
      sizes={variant === 'leaderboard' ? '(max-width: 1024px) 100vw, 728px' : '400px'}
      className="object-cover"
    />
  ) : (
    <span className="flex flex-col items-center justify-center gap-1 text-center">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <span className="text-[12px] text-ink-faint/80">
        {note ??
          (variant === 'leaderboard'
            ? 'Banner · 728 × 90 on desktop'
            : 'Sidebar · 300 × 250')}
      </span>
    </span>
  )

  const shell = `relative flex items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-rule-strong bg-sunken ${box} ${className}`

  if (href) {
    return (
      <a
        href={href}
        rel="sponsored noopener"
        aria-label={label}
        className={`${shell} transition-colors hover:border-accent`}
      >
        {body}
      </a>
    )
  }

  return (
    <div className={shell} role="complementary" aria-label={label}>
      {body}
    </div>
  )
}
