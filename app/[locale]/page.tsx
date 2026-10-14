import {FormScopeProvider} from '@/components/forms/forms-provider'
import {getForms,getFormCountries} from '@/lib/forms/server'
import {pageBySlug} from '@/lib/payload/client'
import {PageBody} from '@/components/pages/page-body'
import {getLayoutPayload, getHomepagePayload} from '@/lib/api/public'
import {JsonLd} from '@/components/site/json-ld'
import {pageSchema} from '@/lib/seo/structured-data'
import {localePath} from '@/i18n/navigation'
import {EventAnnouncement,PageOverlays} from '@/components/site/page-overlays'
import {SiteFooter} from '@/components/site/site-footer'
import {SiteHeader} from '@/components/site/site-header'
import {SiteInteractions} from '@/components/site-interactions'
import type {Metadata} from 'next'
import {renderManagedSection, renderWebsiteBrand} from '@/lib/cms/render'
import {localizedPageMetadata} from '@/lib/cms/metadata'
import type {ReactNode} from 'react'
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'
import {routing} from '@/i18n/routing'

export const dynamic = 'error'
export const revalidate = 300

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const {home: {seo}} = await getHomepagePayload(locale)
  return localizedPageMetadata(seo, locale, '/')
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [layout, homepage,cmsPage,forms] = await Promise.all([getLayoutPayload(locale), getHomepagePayload(locale),pageBySlug('home'),getForms(locale,{purpose:'home',collection:'pages',slug:'home'})])
  const {settings, catalog} = layout
  const {home: {seo}, meetingEvent} = homepage
  const sections = [...layout.home.sections, ...homepage.home.sections]
  const byKey = new Map(sections.map((section) => [section.key, section]))
  const show = (key: string, node: ReactNode, options: {preserveUnknownText?: boolean} = {}) => {
    const section = byKey.get(key)
    if (!section || !section.enabled) return null
    const hasContent = section.texts.some((field) => field.values[locale]?.trim()) || section.assets.some((field) => field.value.trim()) || section.videos?.some((video) => video.trim())
    return hasContent ? renderManagedSection(node, section, locale, {...options,preserveUnknownText:key==='header'||key==='footer'||options.preserveUnknownText}) : null
  }
  if(!cmsPage)notFound()
  return <div className="site-page">
    <JsonLd data={pageSchema(localePath('/',locale),locale,seo.title[locale],seo.description[locale])}/>
    {renderWebsiteBrand(show('header', <><a className="skip" href="#main">Skip to content</a>{SiteHeader({catalog,locale,menus:layout.home.menus})}</>), settings, locale)}
    {meetingEvent&&show('overlays', EventAnnouncement({event:meetingEvent,locale}), {preserveUnknownText:true})} <PageOverlays locale={locale}/>
    <FormScopeProvider forms={forms} countries={getFormCountries(forms,locale)}><PageBody page={cmsPage} locale={locale}/></FormScopeProvider>
    {renderWebsiteBrand(show('footer', SiteFooter({company:settings.company,locale,menus:layout.home.footerMenus})), settings, locale)}
    <SiteInteractions />
  </div>
}
