import {navigationHref,navigationLabel} from '@/lib/cms/navigation'
import {Fragment} from 'react'
import {CatalogNavigation} from '@/components/catalog/catalog-navigation'
import type {NavigationCatalog} from '@/lib/catalog/types'
import type {NavigationItem} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
import {ContentImage} from './content-image'
import {SmartLink} from './smart-link'

export function SiteHeader({catalog,locale,page='',menus}: {catalog:NavigationCatalog;locale:SiteLocale;page?:string;menus?:{left:NavigationItem[];right:NavigationItem[]}}) {
  const navigationProps = (href:string, desktop=false) => {
    const path = `/${page}`
    const exact = path === href
    const active = exact || (href !== '/' && path.startsWith(`${href}/`))
    return {
      className: [desktop && 'nav-link', active && 'current'].filter(Boolean).join(' ') || undefined,
      'aria-current': active ? (exact ? 'page' as const : 'location' as const) : undefined,
    }
  }
  const link=(item:NavigationItem,desktop:boolean)=>{
    const href=navigationHref(item)
    if(!href)return null
    const label=navigationLabel(item,locale)
    const node=<SmartLink href={href} {...navigationProps(href,desktop)}>{label}</SmartLink>
    if(item.page?.slug!=='products')return <Fragment key={item.id}>{node}</Fragment>
    return desktop?<div className="nav-drop" key={item.id}><SmartLink href={href} {...navigationProps(href,true)}>{label} <svg className="nav-drop-caret" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></SmartLink><div className="nav-drop-panel"><div className="nav-drop-card"><CatalogNavigation catalog={catalog} locale={locale}/></div></div></div>:<Fragment key={item.id}>{node}<div className="mobile-sub"><CatalogNavigation catalog={catalog} locale={locale} mobile/></div></Fragment>
  }
  return (<><header className="site-header" id="header">
  <div className="wrap header-inner">
    <nav className="nav-left" aria-label="Primary navigation">
      {menus?.left.map(item=>link(item,true))}
    </nav>
    <SmartLink className="brand" href="/" aria-label="Alamir Ingredients home">
      <ContentImage src="/assets/logo-full.svg" alt="Alamir Ingredients" />
    </SmartLink>
    <nav className="nav-right" aria-label="Secondary navigation">
      {menus?.right.map(item=>link(item,true))}
      <SmartLink className="header-action" href="/contact" data-quote>Get in touch</SmartLink>
    </nav>
    <button className="menu-button" id="menu-open" type="button" aria-label="Open navigation" aria-expanded="false">
      <span /><span />
    </button>
  </div>
</header>
<div className="mobile-menu" id="mobile-menu" aria-hidden="true">
  <div className="mobile-top">
    <SmartLink className="brand" href="/"><ContentImage src="/assets/logo-full.svg" alt="Alamir Ingredients" /></SmartLink>
    <button className="mobile-close" id="menu-close" type="button" aria-label="Close navigation">×</button>
  </div>
  <nav className="mobile-links" aria-label="Mobile navigation">
    {[...(menus?.left??[]),...(menus?.right??[])].map(item=>link(item,false))}
  </nav>
  <div className="mobile-meta"><span>Sadat City, Egypt</span><span>Est. 1970</span></div>
</div>
</>)}
