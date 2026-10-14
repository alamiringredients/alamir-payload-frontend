import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ar', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
  // Page metadata and the sitemap use the canonical site URL and CMS locales.
  alternateLinks: false,
})
