import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPageBySlug, getSettings } from '@/lib/queries'
import { ContactForm } from '@/components/contact-form'

// Rendered on first request rather than at build time, so a slow or sleeping
// database can never fail a deploy.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Capital Compass — corrections, enquiries and partnerships.',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPageBySlug('contact'), getSettings()])
  const p: any = page
  const s: any = settings

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <header className="border-b border-rule py-12 sm:py-16">
        <h1 className="text-[36px] sm:text-[46px]">{p?.title ?? 'Contact'}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          {p?.standfirst ??
            'Corrections, questions about our method, media enquiries. We read everything.'}
        </p>
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0">
          <ContactForm />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {p?.body && (
            <div className="prose-cc mb-6 border border-rule bg-surface p-5 text-[15px]">
              <RichText data={p.body} />
            </div>
          )}

          <div className="border border-rule bg-surface p-5">
            <h2 className="eyebrow !text-deep">Corrections</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              If we have a number wrong, tell us. Pick "Correction or factual dispute" and include
              the article and the figure. We publish corrections on the article itself.
            </p>
          </div>

          {s?.contactEmail && (
            <p className="mt-4 text-[13px] text-ink-faint">
              Prefer email?{' '}
              <a
                href={`mailto:${s.contactEmail}`}
                className="text-deep underline decoration-brass-soft underline-offset-4"
              >
                {s.contactEmail}
              </a>
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
