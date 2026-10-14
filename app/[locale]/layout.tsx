import {FormsProvider} from '@/components/forms/forms-provider'
import {fontStylesheets, fontPreloads} from '@/lib/site-font-delivery'
import {JsonLd} from '@/components/site/json-ld'
import {websiteSchema} from '@/lib/seo/structured-data'
import type {Metadata} from 'next'
import {hasLocale, NextIntlClientProvider} from 'next-intl'
import {getTranslations} from 'next-intl/server'
import {notFound} from 'next/navigation'
import type {ReactNode} from 'react'
import {routing} from '@/i18n/routing'
import {LocaleSwitcher} from '@/components/site/locale-switcher'
import {getLayoutPayload} from '@/lib/api/public'
import {arabicDisplay, arabicSans, sans} from '@/lib/site-fonts'
import appConfig from '@/config/app'
import '../site.css'
import '../shell.css'
import '@/styles/serif-font.css'

export const dynamicParams = true
export const revalidate = 300
async function getLayoutData(params: Promise<{locale: string}>) {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const {settings} = await getLayoutPayload(locale)
  return {locale, settings}
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale, settings} = await getLayoutData(params)

  return {
    metadataBase: new URL(appConfig.url),
    title: settings.defaultSeoTitle[locale],
    description: settings.defaultSeoDescription[locale],
    applicationName: settings.siteName[locale],
    openGraph: {siteName: settings.siteName[locale], images: settings.socialImage ? [settings.socialImage] : []},
    icons: {icon: settings.icon ? [settings.icon] : []},
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export default async function SiteLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [{settings},translate]=await Promise.all([getLayoutPayload(locale),getTranslations()])
  const isArabic = locale === 'ar'
  const arabicFonts = isArabic ? ` ${arabicDisplay.variable} ${arabicSans.variable}` : ''
  const preloads = fontPreloads[isArabic ? 'arabic' : 'latin']

  return <html lang={locale} dir={isArabic ? 'rtl' : 'ltr'} className={`js ${sans.variable}${arabicFonts}`} data-scroll-behavior="smooth">
    <head>
      {preloads.map(href => <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous"/>)}
      <link rel="stylesheet" href={fontStylesheets[isArabic ? 'arabic' : 'latin']}/>
    </head>
    <body>
      <JsonLd data={websiteSchema(settings, locale)}/>
      <NextIntlClientProvider messages={null}>
        <LocaleSwitcher label={translate('language')} />
        <FormsProvider forms={[]} countries={[]} locale={locale}>{children}</FormsProvider>
      </NextIntlClientProvider>
    </body>
  </html>
}
