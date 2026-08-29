import type { Metadata } from 'next'
import { Inter_Tight, IBM_Plex_Mono } from 'next/font/google'
import { getSettings } from '@/lib/queries'
import { getNavData } from '@/lib/nav-data'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter, RouteProgress, ScrollTop } from '@/components/site-footer'
import { NewsletterForm, ExitIntent } from '@/components/site'
import { Analytics, ConsentBanner } from '@/components/analytics'
import { ServiceWorker, InstallPrompt } from '@/components/pwa'
import './globals.css'

const sans = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
  fallback: ['system-ui', 'sans-serif'],
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
  fallback: ['ui-monospace', 'monospace'],
})

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// themeColor must be a separate viewport export in the App Router. Inside
// generateMetadata it is deprecated and silently ignored.
export const viewport = {
  themeColor: '#101012',
}

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
    appleWebApp: {
      capable: true,
      title: 'Compass',
      statusBarStyle: 'default' as const,
    },
    icons: {
      icon: '/icons/favicon-32.png',
      apple: '/icons/apple-touch-icon.png',
    },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav] = await Promise.all([getSettings(), getNavData()])
  const s: any = settings
  const { sections, nav: navTree, previews, recent, headlines, tags } = nav

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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <RouteProgress />

        <SiteHeader
          siteName={s.siteName}
          nav={navTree}
          headlines={headlines}
          previews={previews}
          tags={tags}
          promo={
            <a
              href="/#newsletter"
              className="flex h-[100px] w-full items-center justify-between gap-6 rounded-[10px] bg-bar px-8 text-white transition-colors hover:bg-bar-2"
            >
              <span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-dot">
                  Free every Sunday
                </span>
                <span className="mt-0.5 block text-[16px] font-bold leading-snug">
                  The Weekly Capital Flow Report
                </span>
              </span>
              <span className="shrink-0 rounded-[4px] bg-accent px-4 py-2 text-[13px] font-semibold">
                Subscribe
              </span>
            </a>
          }
        />

        <main id="main">{children}</main>

        <SiteFooter
          siteName={s.siteName}
          legalName={s.footerLegalName}
          disclaimer={s.articleDisclaimer}
          sections={sections as any}
          recent={recent}
          tags={tags.map((t) => t.title)}
        />

        <ScrollTop />

        {s.exitIntentEnabled && (
          <ExitIntent>
            <NewsletterForm {...newsletterProps} variant="block" />
          </ExitIntent>
        )}

        <Analytics />
        <ConsentBanner />
        <ServiceWorker />
        <InstallPrompt />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </body>
    </html>
  )
}
