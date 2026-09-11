import type { Metadata } from 'next'
import { Inter_Tight, IBM_Plex_Mono } from 'next/font/google'
import { getSettings, isPreview } from '@/lib/queries'
import { getNavData } from '@/lib/nav-data'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter, RouteProgress, ScrollTop } from '@/components/site-footer'
import { NewsletterForm, ExitIntent } from '@/components/site'
import { Analytics, ConsentBanner } from '@/components/analytics'
import { AdSlot } from '@/components/ad-slot'
import { EmailAlertsButton } from '@/components/email-alerts'
import { DisclaimerGate } from '@/components/legal-gate'
import { ServiceWorker, InstallPrompt } from '@/components/pwa'
import { PreviewBridge } from '@/components/preview-bridge'
import { PreviewBar } from '@/components/preview-bar'
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
  const [settings, nav, preview] = await Promise.all([getSettings(), getNavData(), isPreview()])
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

        {/* Only mounted while previewing: it opens a message channel to the
            admin panel, which idle readers have no use for. */}
        {preview && <PreviewBridge serverURL={SITE} />}

        <SiteHeader
          siteName={s.siteName}
          nav={navTree}
          headlines={headlines}
          previews={previews}
          tags={tags}
          promo={
            /* The top banner: advertising across the width of the masthead,
               with the email-alert signup pinned to its right-hand corner.
               Both are 100px tall so the row keeps one clean baseline. */
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:gap-4">
              <AdSlot variant="leaderboard" className="flex-1" />
              <EmailAlertsButton
                heading={s.newsletterHeading}
                body={s.newsletterBody}
                cta={s.newsletterCta}
                finePrint={s.newsletterFinePrint}
                className="w-full sm:w-auto sm:max-w-[280px]"
              />
            </div>
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

        {preview && <PreviewBar />}

        {/* Has to be accepted before the reader goes any further. Mounted
            last so it sits above everything else on the page. */}
        <DisclaimerGate siteName={s.siteName} disclaimer={s.articleDisclaimer} />

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
