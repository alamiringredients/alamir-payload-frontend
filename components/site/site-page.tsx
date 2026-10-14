import type {ReactNode} from 'react'
import {sectionText} from '@/lib/cms/section-text'
import {JsonLd} from '@/components/site/json-ld'
import {PageOverlays} from '@/components/site/page-overlays'
import {SiteFooter} from '@/components/site/site-footer'
import {SiteHeader} from '@/components/site/site-header'
import {SiteInteractions} from '@/components/site-interactions'
import {getCatalog} from '@/lib/api/public'
import {renderWebsiteBrand} from '@/lib/cms/render'
import type {HomeCmsData, WebsiteSettings} from '@/lib/cms/types'
import type {SchemaNode} from '@/lib/seo/structured-data'
import type {SiteLocale} from '@/i18n/navigation'

export async function SitePage({children, page, locale, home, settings, catalogStyle, structuredData}: {
  children: ReactNode
  page: string
  locale: SiteLocale
  home: HomeCmsData
  settings: WebsiteSettings
  catalogStyle?: 'product-category' | 'tomato-category' | 'product-detail'
  structuredData?: SchemaNode
}) {
  const catalog=await getCatalog(false,locale,'navigation')
  const sections = new Map(home.sections.map(section => [section.key, section]))

  return <div className="site-page" data-page={page} data-catalog-style={catalogStyle}>
    {sections.get('header')?.enabled && renderWebsiteBrand(<><a className="skip" href="#main">{sectionText(sections.get('header')!, 'Skip to content', locale)}</a>{SiteHeader({catalog, locale, page,menus:home.menus,section:sections.get('header')!})}</>, settings, locale)}
    <PageOverlays locale={locale}/>
    {structuredData && <JsonLd data={structuredData}/>} 
    {children}
    {sections.get('footer')?.enabled && renderWebsiteBrand(SiteFooter({company:settings.company,locale,menus:home.footerMenus,section:sections.get('footer')!}), settings, locale)}
    <SiteInteractions/>
  </div>
}
