import type {MetadataRoute} from 'next'
import appConfig from '@/config/app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent: '*', allow: '/', disallow: ['/admin/', '/login']},
    sitemap: new URL('/sitemap.xml', appConfig.url).href,
  }
}
