import {sectionText} from '@/lib/cms/section-text'
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
import {renderWebsiteBrand} from '@/lib/cms/render'
import {localizedPageMetadata} from '@/lib/cms/metadata'
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
  const sections = new Map(layout.home.sections.map(section => [section.key, section]))
  if(!cmsPage)notFound()
  return <div className="site-page">
    <JsonLd data={pageSchema(localePath('/',locale),locale,seo.title[locale],seo.description[locale])}/>
    {sections.get('header')?.enabled && renderWebsiteBrand(<><a className="skip" href="#main">{sectionText(sections.get('header')!, 'Skip to content', locale)}</a>{SiteHeader({catalog,locale,menus:layout.home.menus,section:sections.get('header')!})}</>, settings, locale)}
    {meetingEvent && <EventAnnouncement event={meetingEvent} locale={locale}/>} <PageOverlays locale={locale}/>
    <FormScopeProvider forms={forms} countries={await getFormCountries(forms,locale)}><PageBody page={cmsPage} locale={locale}/></FormScopeProvider>
    {sections.get('footer')?.enabled && renderWebsiteBrand(SiteFooter({company:settings.company,locale,menus:layout.home.footerMenus,section:sections.get('footer')!}), settings, locale)}
    <SiteInteractions />
  </div>
}
