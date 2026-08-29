import type { MetadataRoute } from 'next'

/**
 * Web app manifest. Next serves this at /manifest.webmanifest and links it
 * automatically — no <link rel="manifest"> needed in the layout.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Capital Compass',
    short_name: 'Compass',
    description:
      'Institutional flow analysis for HNI and NRI investors. Where the money actually went.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBFAF8',
    theme_color: '#123A2E',
    categories: ['news', 'finance', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Capital Flow – India', url: '/capital-flow-india' },
      { name: 'Global Macro', url: '/global-macro' },
      { name: 'Sectoral Trends', url: '/sectoral-trends' },
    ],
  }
}
