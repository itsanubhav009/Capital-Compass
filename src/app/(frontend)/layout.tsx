import type { Metadata } from 'next'
import { Newsreader, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google'
import { getSections, getSettings } from '@/lib/queries'
import { SiteHeader, SiteFooter, NewsletterForm, ExitIntent } from '@/components/site'
import { Analytics, ConsentBanner } from '@/components/analytics'
import './globals.css'

const display = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-newsreader',
})
const sans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-instrument',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
})

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const s: any = await getSettings()
  return {
    metadataBase: new URL(SITE),
    title: {
      default: `${s.siteName} — ${s.tagline}`,
      template: `%s · ${s.siteName}`,
    },
    description: s.defaultMetaDescription,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: s.siteName,
      title: `${s.siteName} — ${s.tagline}`,
      description: s.defaultMetaDescription,
      images: s.ogImage?.url ? [{ url: s.ogImage.url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${s.siteName} — ${s.tagline}`,
      description: s.defaultMetaDescription,
    },
    robots: { index: true, follow: true },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, sections] = await Promise.all([getSettings(), getSections()])
  const s: any = settings

  const newsletterProps = {
    heading: s.newsletterHeading,
    body: s.newsletterBody,
    cta: s.newsletterCta,
    finePrint: s.newsletterFinePrint,
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.siteName,
    url: SITE,
    description: s.defaultMetaDescription,
    ...(s.ogImage?.url ? { logo: `${SITE}${s.ogImage.url}` } : {}),
  }

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-deep focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>

        <SiteHeader siteName={s.siteName} sections={sections as any} />
        <main id="main">{children}</main>
        <SiteFooter
          siteName={s.siteName}
          legalName={s.footerLegalName}
          disclaimer={s.articleDisclaimer}
          sections={sections as any}
          newsletter={<NewsletterForm {...newsletterProps} variant="footer" />}
        />

        {s.exitIntentEnabled && (
          <ExitIntent>
            <NewsletterForm {...newsletterProps} variant="block" />
          </ExitIntent>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <Analytics />
        <ConsentBanner />
      </body>
    </html>
  )
}
