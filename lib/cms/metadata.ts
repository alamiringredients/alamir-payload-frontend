import type {Metadata} from 'next'
import type {HomeSeoContent} from './types'
import {locales, localePath, type SiteLocale} from '@/i18n/navigation'

export function localizedAlternates(path: string, locale: SiteLocale) {
  return {
    canonical: localePath(path, locale),
    languages: Object.fromEntries(
      locales.map((language) => [language, localePath(path, language)]),
    ),
  }
}

export function localizedPageMetadata(
  seo: HomeSeoContent,
  locale: SiteLocale,
  path: string,
): Metadata {
  return {
    ...(['/search', '/thank-you', '/404'].includes(path) ? {robots: {index: false, follow: true}} : {}),
    title: seo.title[locale],
    description: seo.description[locale],
    openGraph: {
      title: seo.socialTitle[locale],
      description: seo.socialDescription[locale],
      images: seo.socialImage ? [seo.socialImage] : [],
    },
    alternates: localizedAlternates(path, locale),
  }
}
