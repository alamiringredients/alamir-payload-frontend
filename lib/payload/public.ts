import 'server-only'
import { cache } from 'react'
import {preparePublicContent} from './public-site'
import {globalContent as global, records, recordDocuments, payloadDocuments,request,translationContent,presentRecord,recordSource,catalogInterfaceLabels,mediaDocuments,localizedMedia,resolveMediaReferences} from './client'
import type {SiteLocale} from '@/i18n/navigation'
import type {HomeCmsData, ManagedPageContent, WebsiteSettings, QualityPageContent} from '@/lib/cms/types'
import type {Catalog, Category, Product,NavigationCatalog,CategoryCard} from '@/lib/catalog/types'
import type {LocalizedValue} from '@/lib/cms/types'
import type {CertificationData, CertificationInterfaceLabels, CertificationType, Certification} from '@/lib/certifications/types'
import type {EventRecord, PublicEventSlot} from '@/lib/events/types'
import type {NewsPageContent, NewsRecord, NewsTaxonomy} from '@/lib/news/types'
import type {SustainabilityRecord, SustainabilityPageContent} from '@/lib/sustainability/types'
import type {AboutContent, CareersContent, JobRecord} from '@/lib/careers/types'
import type {SearchResult} from '@/lib/search/match'

type Interface = {
    certification:Record<SiteLocale,CertificationInterfaceLabels>
  countries:Record<SiteLocale,{value:string;label:string}[]>
  news:Record<SiteLocale,Record<string,string>>
  sustainability:Record<SiteLocale,Record<string,string>>
  careers:Record<SiteLocale,Record<string,string>>
  events:Record<SiteLocale,Record<string,string>>
  search:Record<SiteLocale,Record<string,string>>
  notFoundTranslations:unknown[]
  messages:Record<SiteLocale,Record<string,unknown>>
}
export const getInterface = cache(() => global<Interface>('interface-text'))
const catalog = cache(async (path=''):Promise<Catalog> => {
  const [categoryDocs,productDocs,settings] = await Promise.all([recordDocuments('categories'),recordDocuments('products'),global<Catalog['settings']>('catalog-settings')])
  const [,categorySlug,productSlug]=path.split('/')
  const selectedCategory=categoryDocs.find(doc=>doc.slug===categorySlug)
  const children=productDocs.filter(doc=>Number((doc.category as {id:number}|undefined)?.id)===selectedCategory?.id)
  const selectedProduct=children.find(doc=>doc.slug===productSlug)??(!productSlug&&children.length===1?children[0]:undefined)
  const categories=categoryDocs.map(doc=>presentRecord<Category>('categories',recordSource(doc),doc.id===selectedCategory?.id?undefined:'card'))
  const products=productDocs.map(doc=>presentRecord<Product>('products',recordSource(doc),doc.id===selectedProduct?.id?undefined:'card'))
  const categoryIds=new Set(categories.map(category=>category.id))
  return {categories,products:products.filter(product=>categoryIds.has(product.category_id)),settings}
})
const navigationCatalog = cache(async ():Promise<NavigationCatalog & {categories:CategoryCard[]}> => {
  const [categoryRows,productRows,mediaRows]=await Promise.all([
    request('categories?locale=all&depth=0&pagination=false&sort=_order&select[name]=true&select[slug]=true&select[sourceId]=true&select[icon]=true&select[description]=true&select[page][artwork]=true'),
    request('products?locale=all&depth=0&pagination=false&sort=_order&select[name]=true&select[slug]=true&select[sourceId]=true&select[category]=true&select[gallery]=true'),
    payloadDocuments('media','&select[url]=true&select[width]=true&select[height]=true&select[mimeType]=true&select[filename]=true&select[prefix]=true&select[alt]=true',0),
  ])
  const media=new Map(mediaRows.map(doc=>[doc.id,doc]))
  const values=(value:unknown):LocalizedValue=>Object.fromEntries(['en','ar','fr'].map(locale=>[locale,(value as Partial<LocalizedValue>|undefined)?.[locale as SiteLocale]??''])) as LocalizedValue
  const categories=categoryRows.docs.map((doc: import('./client').Document)=>{
    const page=doc.page as {artwork?:{enabled?:boolean;images?:{image:number}[]}}
    return {id:doc.sourceId??doc.id,slug:doc.slug!,content:{name:values(doc.name),description:values(doc.description),icon:String(media.get(Number(doc.icon))?.url??''),artwork:{key:'artwork',label:'',enabled:Boolean(page?.artwork?.enabled),texts:[],links:[],assets:(page?.artwork?.images??[]).map((photo,index)=>({id:String(index),kind:'image' as const,label:'',source:'',value:String(media.get(photo.image)?.url??'')}))}}} as CategoryCard
  })
  const categoryIds=new Map(categoryRows.docs.map((doc: import('./client').Document)=>[doc.id,doc.sourceId??doc.id]))
  const products=productRows.docs.map((doc: import('./client').Document)=>({id:doc.sourceId??doc.id,slug:doc.slug!,category_id:Number(categoryIds.get(Number(doc.category))),content:{name:values(doc.name),gallery:(doc.gallery as {image:number;caption:LocalizedValue;alt?:LocalizedValue}[]??[]).slice(0,1).map(photo=>({...photo,image:String(media.get(photo.image)?.url??'')}))}}))
  return {categories,products,settings:{labels:await catalogInterfaceLabels() as Catalog['settings']['labels']}}
})
const certifications = cache(async ():Promise<CertificationData> => {
  const [typeDocs,certDocs,media,interfaceText]=await Promise.all([payloadDocuments('certification-types','',0),payloadDocuments('certifications','',0),mediaDocuments(),translationContent()])
  const typeIds=new Map(typeDocs.map(doc=>[doc.id,doc]))
  return {
    types:typeDocs.map(doc=>presentRecord<CertificationType>('certification-types',{...doc,logo:localizedMedia(doc.logo,media),interface:interfaceText})),
    certifications:certDocs.map(doc=>presentRecord<Certification>('certifications',{...doc,certificationType:typeIds.get(Number(doc.certificationType)),document:localizedMedia(doc.document,media),interface:interfaceText})),
  }
})
export async function loadPayload(endpoint:string,locale:SiteLocale,params:Record<string,string|number|boolean|undefined>) {
 const group=({'homepage':'home','catalog/payload':'catalog','pages/quality/payload':'quality','downloads/payload':'catalog','news/payload':'news','careers/payload':'careers','events/payload':'events','sustainability/payload':'sustainability'} as Record<string,string>)[endpoint]
 const prepared=group?preparePublicContent(group):undefined
  const ui=await getInterface()
 if(prepared)await prepared
  switch(endpoint) {
    case 'layout': {
      const [settings,home,c]=await Promise.all([global<WebsiteSettings>('website-settings'),global<HomeCmsData>('navigation'),navigationCatalog()])
      return {settings,home,catalog:c,notFoundTranslations:ui.notFoundTranslations}
    }
    case 'homepage': {
      const [home,certs,events,media]=await Promise.all([global<HomeCmsData>('home-page','meta'),certifications(),payloadDocuments('events','&sort=_order&select[sourceId]=true&select[slug]=true&select[kind]=true&select[startsAt]=true&select[endsAt]=true&select[timezone]=true&select[title]=true&select[venue]=true&select[stand]=true&select[layout]=true',0),mediaDocuments()])
      return {home,certifications:certs,certificationLabels:ui.certification[locale],countries:ui.countries[locale],meetingEvent:events.map(doc=>presentRecord<EventRecord>('events',recordSource(resolveMediaReferences({...doc,interface:undefined},media) as import('./client').Document))).find(event => event.kind==='event' && new Date(event.ends_at)>new Date()) ?? null}
    }
    case 'catalog/home': {
      const [nav,labels]=await Promise.all([navigationCatalog(),catalogInterfaceLabels()])
      return {categories:nav.categories,products:nav.products,settings:{labels}}
    }
    case 'catalog/payload': {
      const [c,certs,managedContent]=await Promise.all([catalog(String(params.page??'')),certifications(),global<ManagedPageContent>('products-page')])
      return {catalog:c,certifications:certs,certificationLabels:ui.certification[locale],managedContent}
    }
    case 'pages/about/payload':return global<AboutContent>('about-page')
    case 'pages/quality/payload':return {content:await global<QualityPageContent>('quality-page'),certifications:await certifications(),labels:ui.certification[locale],translations:[]}
    case 'downloads/payload':return {content:await global('downloads-page'),catalog:await catalog(),certifications:await certifications(),labels:ui.certification[locale],fileSizes:{}}
    case 'news/payload': {
      const [articles,page,taxonomies]=await Promise.all([records<NewsRecord>('news'),global<NewsPageContent>('news-page'),records<NewsTaxonomy>('news-taxonomies')])
      return {cards:articles,source:articles.find(article=>article.slug===params.slug)??null,page,taxonomies,labels:ui.news[locale]}
    }
    case 'sustainability/payload': {
      const [articles,page]=await Promise.all([records<SustainabilityRecord>('sustainability'),global<SustainabilityPageContent>('sustainability-page')])
      return {articles,record:articles.find(article=>article.slug===params.slug)??null,page,labels:ui.sustainability[locale]}
    }
    case 'careers/payload': {
      const [jobs,content,news]=await Promise.all([records<JobRecord>('jobs'),global<CareersContent>('careers-page'),records<NewsRecord>('news')])
      return {jobs:jobs.filter(job=>job.status==='open'),job:jobs.find(job=>job.slug===params.slug)??null,content,news,labels:ui.careers[locale]}
    }
    case 'events/payload': {
      const [events,slotDocs,managedContent,eventDocs]=await Promise.all([records<EventRecord>('events'),payloadDocuments('meeting-slots','',0),global<ManagedPageContent>(params.page==='book-a-meeting'?'booking-page':'events-page'),recordDocuments('events')])
      const eventIds=new Map(eventDocs.map(event=>[event.id,event.sourceId??event.id]))
      const slots:PublicEventSlot[]=slotDocs.filter(slot=>eventIds.has(Number(slot.event))).map(slot=>({id:slot.id,eventId:eventIds.get(Number(slot.event))!,startsAt:String(slot.startsAt),endsAt:String(slot.endsAt),status:slot.reserved?'reserved':'available'}))
      return {events,event:events.find(event=>event.slug===params.slug)??null,slots,managedContent,translations:[],labels:ui.events[locale]}
    }
    case 'search/payload': {
      if(!String(params.query??'').trim())return {content:await global<ManagedPageContent>('search-page'),labels:ui.search[locale],results:[]}
      const [c,news,jobs,events,sustainability,content]=await Promise.all([catalog(),records<NewsRecord>('news'),records<JobRecord>('jobs'),records<EventRecord>('events'),records<SustainabilityRecord>('sustainability'),global<ManagedPageContent>('search-page')])
      const results:SearchResult[]=[]
      for(const product of c.products){const category=c.categories.find(x=>x.id===product.category_id);if(category)results.push({href:`/products/${category.slug}/${product.slug}`,title:product.content.name[locale],description:product.content.description[locale],section:ui.search[locale].products??'',text:''})}
      for(const [items,base] of [[news,'news'],[sustainability,'sustainability']] as const)for(const item of items){const v=item.published[locale];if(v)results.push({href:`/${base}/${item.slug}`,title:plain(v.title),description:v.summary,section:ui.search[locale][base]??'',text:''})}
      for(const job of jobs)if(job.status==='open')results.push({href:`/careers/${job.slug}`,title:job.content[locale].title,description:job.content[locale].summary,section:ui.search[locale].careers??'',text:''})
      for(const event of events)results.push({href:`/events/${event.slug}`,title:plain(event.content.title[locale]),description:event.content.summary[locale],section:ui.search[locale].events??'',text:''})
      const query=String(params.query??'').trim().toLocaleLowerCase(locale)
      return {content,labels:ui.search[locale],results:query?results.filter(result=>`${result.title} ${result.description}`.toLocaleLowerCase(locale).includes(query)):[]}
    }
    default:{
      const key=endpoint.match(/^pages\/(.+)\/payload$/)?.[1]
      if(!key)throw new Error(`Unknown content resource: ${endpoint}`)
      return {content:await global(`${key==='404'?'not-found':key}-page` as Parameters<typeof global>[0]),translations:[]}
    }
  }
}
function plain(node:{text?:string;content?:unknown[]}):string {
  return node.text??(node.content??[]).map(child=>plain(child as Parameters<typeof plain>[0])).join('')
}
