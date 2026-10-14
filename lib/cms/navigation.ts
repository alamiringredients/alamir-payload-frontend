import type {NavigationItem} from './types'
import type {SiteLocale} from '@/i18n/navigation'
export const navigationHref=(item:NavigationItem)=>item.linkType==='url'?item.url:item.page?.slug==='home'?'/':item.page?.slug?`/${item.page.slug}`:undefined
export const navigationLabel=(item:NavigationItem,locale:SiteLocale)=>item.label?.[locale] || item.page?.title?.[locale] || item.page?.title?.en
