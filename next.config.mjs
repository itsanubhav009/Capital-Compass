import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  iimages: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: 'https://pub-78cd2f72feb743b7bc8c1f93d93b0446.r2.dev' },
  ],
},
  experimental: { reactCompiler: false },
}

export default withPayload(nextConfig)
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: 'pub-xxxx.r2.dev' },
  ],
},