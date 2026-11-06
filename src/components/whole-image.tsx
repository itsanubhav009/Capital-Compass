import Image from 'next/image'

/**
 * A picture shown whole, in a box of whatever shape the layout wants.
 *
 * `object-cover` fills the box by cutting off whatever does not fit, which is
 * harmless for a photograph and ruinous for the graphics most articles here
 * use as their main image: a 16:9 card with the headline and the fund's logo
 * set into it, cropped into a near-square hero, lost both edges and read as
 * "…neyExpress" and "OSKAR OIL".
 *
 * So the picture is contained, and the space it leaves is filled with a
 * blurred, darkened copy of itself — no bars, and the box still reads as one
 * image. Both layers use the same src and sizes, so the browser downloads it
 * once.
 *
 * `className` goes on the sharp layer. Pass `object-top` where a headline is
 * laid over the bottom of the box, so the picture sits above the words
 * rather than under them.
 */
export function WholeImage({
  src,
  sizes,
  priority,
  className = '',
}: {
  src: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        priority={priority}
        className="scale-125 object-cover blur-2xl brightness-[0.55]"
      />
      <Image src={src} alt="" fill sizes={sizes} priority={priority} className={`object-contain ${className}`} />
    </>
  )
}
