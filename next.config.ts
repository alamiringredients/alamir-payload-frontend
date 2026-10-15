import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')
const appImageSource = new URL('/**', backendUrl)
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, '')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {'/*':['./styles/pages/*.css','./styles/home.css']},
  experimental: {
    globalNotFound: true,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 50,
    staleTimes: {dynamic: 60, static: 300},
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [appImageSource, ...(mediaUrl ? [new URL(`${mediaUrl}/**`)] : [])],
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development'
      && ['localhost', '127.0.0.1', '[::1]'].includes(appImageSource.hostname),
  },
  async headers() {
    return [{source: '/fonts/delivery/:path*', headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]}, {source: '/fonts/cormorant-garamond/:file', headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}]}]
  },
  async rewrites() {
    return [{source:'/storage/:path*',destination:`${backendUrl}/storage/:path*`}]
  },
}

export default withNextIntl(nextConfig)
