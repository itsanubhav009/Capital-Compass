import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern formats; the brief targets 85+ mobile Lighthouse.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add your S3/R2/Cloudflare bucket host here once media storage is live.
      // { protocol: 'https', hostname: 'media.capitalcompass.com' },
    ],
  },
  experimental: { reactCompiler: false },
}

export default withPayload(nextConfig)
