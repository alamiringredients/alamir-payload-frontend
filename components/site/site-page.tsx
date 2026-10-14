import {JsonLd} from '@/components/site/json-ld'
import {PageOverlays} from '@/components/site/page-overlays'
import {SiteFooter} from '@/components/site/site-footer'
import {SiteHeader} from '@/components/site/site-header'
import {SiteInteractions} from '@/components/site-interactions'
import {getCatalog} from '@/lib/api/public'
import {renderManagedSection, renderWebsiteBrand} from '@/lib/cms/render'
import type {HomeCmsData, WebsiteSettings} from '@/lib/cms/types'
import type {SchemaNode} from '@/lib/seo/structured-data'
import type {SiteLocale} from '@/i18n/navigation'
import type {ReactNode} from 'react'

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
  const show = (key: string, node: ReactNode) => {
    const section = sections.get(key)
    return section?.enabled ? renderManagedSection(node, section, locale,{preserveUnknownText:key==='header'||key==='footer'}) : null
  }

  return <div className="site-page" data-page={page} data-catalog-style={catalogStyle}>
    {renderWebsiteBrand(show('header', <><a className="skip" href="#main">Skip to content</a>{SiteHeader({catalog, locale, page,menus:home.menus})}</>), settings, locale)}
    <PageOverlays locale={locale}/>
    {structuredData && <JsonLd data={structuredData}/>} 
    {children}
    {renderWebsiteBrand(show('footer', SiteFooter({company:settings.company,locale,menus:home.footerMenus})), settings, locale)}
    <SiteInteractions/>
  </div>
}
