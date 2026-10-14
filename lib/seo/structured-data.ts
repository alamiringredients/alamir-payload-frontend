import appConfig from '@/config/app'
import type {WebsiteSettings} from '@/lib/cms/types'
import {localePath,type SiteLocale} from '@/i18n/navigation'

export type SchemaNode = Record<string,unknown>
export const siteUrl=(path='/')=>new URL(path,appConfig.url).href
export const serializeJsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c')

export function websiteSchema(settings:WebsiteSettings,locale:SiteLocale):SchemaNode {
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':siteUrl('/#organization'),url:siteUrl(),name:settings.siteName[locale],description:settings.defaultSeoDescription[locale],...(settings.logo?{logo:siteUrl(settings.logo)}:{})},
    {'@type':'WebSite','@id':siteUrl('/#website'),url:siteUrl(),name:settings.siteName[locale],inLanguage:['en','ar','fr'],publisher:{'@id':siteUrl('/#organization')}},
  ]}
}

export function pageSchema(path:string,locale:SiteLocale,name:string,description?:string,entity?:SchemaNode):SchemaNode {
  const url=siteUrl(path)
  return {'@context':'https://schema.org','@graph':[
    {'@type':'WebPage','@id':`${url}#webpage`,url,name,description,inLanguage:locale,isPartOf:{'@id':siteUrl('/#website')},...(entity?{mainEntity:{'@id':`${url}#entity`}}:{})},
    ...(entity?[{'@id':`${url}#entity`,url,...entity}]:[]),
  ]}
}

export function breadcrumbsSchema(items:{name:string;path:string}[],locale:SiteLocale):SchemaNode {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:siteUrl(localePath(item.path,locale))}))}
}
