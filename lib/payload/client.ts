import {presentEditorialPage} from '../cms/editorial-page'
import {object,localizedText} from '../cms/fields'
import {presentSustainabilityPage} from '../cms/sustainability-page'
import {presentNativeRecord} from './record-presentation'
import {presentManagedPage} from '../cms/managed-page'
import {presentCatalogRecord} from '@/lib/catalog/presentation'
import type {CatalogLabels} from '@/lib/catalog/types'
import {richText} from '@/lib/editor/lexical'
export {richText} from '@/lib/editor/lexical'
import 'server-only'
import { cache } from 'react'
import {publishedSummary,publishedIdentities,publishedDocuments,publishedGlobal,publishedPage,type IdentityResource} from './public-site'
import templates from './templates.json'
import {presentCareersPage, presentDownloadsPage, presentNewsPage, pageSeo} from '../cms/page-content'
import {applyRecordSection, recordPresentationSource, type TemplateValue} from './section-projection'
import { textContent, type ContentNode, type ContentDocument } from '@/lib/editor/document'

type RecordCollection = 'products' | 'categories' | 'certification-types' | 'certifications' | 'news-taxonomies' | 'news' | 'sustainability' | 'jobs' | 'events'
const nativePages = {'about-page': presentEditorialPage, 'quality-page': presentEditorialPage, 'products-page': presentManagedPage, 'sustainability-page': presentSustainabilityPage, 'contact-page': presentManagedPage, 'search-page': presentManagedPage, 'privacy-page': presentManagedPage, 'terms-page': presentManagedPage, 'cookies-page': presentManagedPage, 'thank-you-page': presentManagedPage, 'not-found-page': presentManagedPage, 'events-page': presentManagedPage, 'booking-page': presentManagedPage, 'home-page': (page: CmsPage, origin: string) => ({seo: pageSeo(page, origin), sections: []}), 'careers-page': presentCareersPage, 'downloads-page': presentDownloadsPage, 'news-page': presentNewsPage}
type Value = TemplateValue
import type {Document} from './types'
import type {SiteLocale} from '@/i18n/navigation'
export type {Document} from './types'

export function backendOrigin() {
  const origin = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!origin) throw new Error('NEXT_PUBLIC_BACKEND_URL is required.')
  return origin.replace(/\/$/, '')
}
export const mediaDimensions = cache(async (): Promise<Map<string, {width: number; height: number}>> => {
  const docs = await publishedSummary('media')
  return new Map(docs.filter((doc) => doc.url && doc.width && doc.height)
    .map(doc => [new URL(String(doc.url), backendOrigin()).href, {width: Number(doc.width), height: Number(doc.height)}]))
})

function hydrate(template: Value, doc: Document, locale?: string): unknown {
  if (Array.isArray(template)) return template.flatMap(item => {
    const result=hydrate(item, doc, locale)
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      if(item.$nodes) return (result as ContentDocument).content
      if(item.$spread) return (result as unknown[]).flat()
    }
    return [result]
  })
  if (!template || typeof template !== 'object') return template
  if (template.$literalLocales) return (template.$literalLocales as Record<string,Value>)[locale ?? 'en']
  if (typeof template.$rows === 'string') {
    const rows=fieldValue(doc,template.$rows) as Document[] | undefined
    return (rows ?? []).map((row,index) => hydrate(Array.isArray(template.$templates) ? template.$templates[index] ?? template.$template : template.$template,{...row,mediaRefs:doc.mediaRefs},locale))
  }
  if (template.$localeTree) return {
    ...Object.fromEntries(['en','ar','fr'].map(language => [language, hydrate(template.$localeTree, doc, language)])),
    ...Object.fromEntries(Object.entries(template).filter(([key])=>key!=='$localeTree').map(([key,value])=>[key,hydrate(value,doc,locale)])),
  }
  if(typeof template.$translation==='string'){
    const value=fieldValue(doc.interface as Document ?? doc,template.$translation) as Record<string,string>|undefined
    const resolve=(language:string)=>template.$rich?{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:value?.[language]??''}]}]}:value?.[language]??''
    return locale?resolve(locale):Object.fromEntries(['en','ar','fr'].map(language=>[language,resolve(language)]))
  }
  if (typeof template.$field === 'string') {
    const value = fieldValue(doc,template.$field)
    if(typeof template.$relationship==='string'){
      const key=template.$relationship
      const resolve=(value:unknown)=>{
        const related=typeof value==='number'&&key==='url'?(doc.mediaRefs as Map<number,Document>|undefined)?.get(value):value
        return related && typeof related==='object'?(key==='sourceId'?(related as Record<string,unknown>).sourceId??(related as Record<string,unknown>).id:(related as Record<string,unknown>)[key]):undefined
      }
      const selected=template.$localized && locale && value && typeof value==='object' && locale in value?(value as Record<string,unknown>)[locale]:value
      return template.$many?(Array.isArray(selected)?selected:[]).map(resolve).filter(value=>value!==undefined):resolve(value)??''
    }
    const resolve = (v: unknown, language=locale) => {
      if (template.$rich) return richText(resolveEditorMedia(v,doc.mediaRefs as Map<number,Document>|undefined), template.$attributes as unknown as ContentNode,language)
      if (template.$plain) return textContent(richText(v))
      if (template.$media) {
        return publicMediaURL(v,doc)
      }
      return v ?? (template.$field === 'id' ? doc.id : '')
    }
    const localizedValue=(language:string)=>value && typeof value === 'object' && ('en' in value || 'ar' in value || 'fr' in value) ? (value as Record<string,unknown>)[language] : value
    if (template.$localized && locale) return resolve(localizedValue(locale))
    return template.$localized
      ? Object.fromEntries(['en','ar','fr'].map(locale => [locale, resolve(localizedValue(locale),locale)]))
      : resolve(value && typeof value === 'object' && 'en' in value ? (value as Record<string, unknown>).en : value)
  }
  return Object.fromEntries(Object.entries(template).map(([key,value]) => [key,hydrate(value,doc,locale)]))
}
export const globalContent = cache(async <T>(slug: keyof typeof templates.globals | keyof typeof nativePages,view?:'meta'): Promise<T> => {
  if(slug==='interface-text')return hydrate(templates.globals[slug] as unknown as Value,await translationContent()) as T
  const page=slug==='website-settings'||slug==='navigation'?undefined:await pageBySourceKey(slug==='catalog-settings'?'products-page':slug,view!=='meta' && slug!=='catalog-settings')
  if (page && Object.hasOwn(nativePages, slug)) {
    if (view === 'meta') return {seo: pageSeo(page, backendOrigin()), sections: []} as T
    return nativePages[slug as keyof typeof nativePages](page, backendOrigin()) as T
  }
  const doc=page??await publishedGlobal(slug)
  const [interfaceText,media]=await Promise.all([translationContent(),mediaDocuments()])
  doc.interface=interfaceText;doc.mediaRefs=media
  if(slug==='navigation'){
    const links=new Map((await pageIdentities()).map(page=>[page.id,page]))
    const resolve=(value:unknown):unknown=>Array.isArray(value)?value.map(resolve):value && typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,key==='page' && typeof item==='number'?links.get(item)??null:resolve(item)])):value
    doc.page=resolve(doc.page)
  }
  const template=templates.globals[slug as keyof typeof templates.globals] as unknown as Record<string,Value>
  const result=hydrate(view==='meta'?{seo:template.seo,sections:[]}:template,doc) as Record<string,unknown>
  if(slug==='catalog-settings'){
    const [applications,concentrations]=await Promise.all([publishedDocuments('product-applications'),publishedDocuments('product-concentrations')])
    const options=(docs:Document[])=>docs.map(doc=>({id:doc.key,label:doc.name}))
    result.applications=options(applications);result.concentrations=options(concentrations)
    const collection=page?.layout.filter(block=>block.blockType==='products-collection').at(-1)
    result.emptyMessage=localizedText(object(collection?.content?.text10).values)
  }
  if(slug==='navigation'){const page=doc.page as {headerLeft?:unknown[];headerRight?:unknown[];footerExplore?:unknown[];footerCompany?:unknown[];footerLegal?:unknown[]};result.menus={left:page.headerLeft??[],right:page.headerRight??[]};result.footerMenus={explore:page.footerExplore??[],company:page.footerCompany??[],legal:page.footerLegal??[]}}
  return result as T
})
export const translationContent=cache(async ():Promise<Document> => {
  const docs=await publishedSummary('translations')
  const result:Document={id:0}
  for(const record of docs as (Document & {key:string;text:unknown})[]) {
    const keys=record.key.split('.')
    let parent:Record<string,unknown>=result
    for(let index=0;index<keys.length-1;index++) {
      const key=keys[index]
      parent[key]??=/^\d+$/.test(keys[index+1])?[]:{}
      parent=parent[key] as Record<string,unknown>
    }
    parent[keys.at(-1)!]=record.text
  }
  return result
})
export async function interfaceLabels(path: string, locale: SiteLocale): Promise<Record<string, string>> {
  const labels = fieldValue(await translationContent(), path) as Record<string, Record<string, string>> | undefined
  return Object.fromEntries(Object.entries(labels ?? {}).map(([key, value]) => [key, value[locale] ?? '']))
}
export const recordIdentities=cache(async(slug:IdentityResource):Promise<Document[]>=>{
 const docs=await publishedIdentities(slug)
 return slug==='jobs'?docs.filter(doc=>doc.availability==='open'):docs
})
export const recordDocuments=cache(async(slug:RecordCollection):Promise<Document[]>=>{
 const [documents,interfaceText,media]=await Promise.all([publishedDocuments(slug),translationContent(),mediaDocuments()])
 let docs=documents.map((doc:Document)=>resolveMediaReferences(doc,media)) as Document[]
 const own=new Map(docs.map(doc=>[doc.id,doc]))
 if(slug==='products'){
  const [categories,applications,concentrations]=await Promise.all([recordDocuments('categories'),publishedDocuments('product-applications'),publishedDocuments('product-concentrations')])
  const categoriesById=new Map(categories.map(doc=>[doc.id,doc]))
  const applicationsById=new Map(applications.map(doc=>[doc.id,doc])),concentrationsById=new Map(concentrations.map(doc=>[doc.id,doc]))
  docs=docs.map(doc=>{const relations=doc.relationships as {applications?:number[];concentrations?:number[]}|undefined;return {...doc,category:categoriesById.get(Number(doc.category)),relationships:{...relations,applications:relations?.applications?.map(id=>applicationsById.get(id)),concentrations:relations?.concentrations?.map(id=>concentrationsById.get(id))}}})
 }
 if(slug==='news'||slug==='sustainability'){
  const references=slug==='news'?await recordDocuments('news-taxonomies'):await publishedDocuments('sustainability-goals')
  const related=new Map(references.map(doc=>[doc.id,doc]))
  const keys:Record<string,Map<number,Document>>=slug==='news'?{category:related,tags:related,previousArticle:own,nextArticle:own,relatedArticles:own}:{goals:related,primaryGoal:related,relatedArticles:own}
  docs=docs.map(doc=>({...doc,relationships:Object.fromEntries(Object.entries(doc.relationships as Record<string,unknown>??{}).map(([key,value])=>{
   const lookup=keys[key]
   return [key,!lookup?value:Array.isArray(value)?value.map(id=>lookup.get(Number(id))).filter(Boolean):lookup.get(Number(value))]
  }))}))
 }
 return docs.map(doc=>({...doc,interface:interfaceText,mediaRefs:media}))
})
export function presentRecord<T>(slug:RecordCollection,doc:Document,view?:'card'|'meta'):T{
 return slug==='products'||slug==='categories'
  ? presentCatalogRecord(slug,doc,undefined,view) as T
  : presentNativeRecord<T>(slug,doc,backendOrigin(),view)
}
export const records=cache(async<T>(slug:RecordCollection,view?:'card'|'meta'):Promise<T[]> => (await recordDocuments(slug)).map(doc=>presentRecord<T>(slug,slug==='products'||slug==='categories'?doc:recordSource(doc),view)))
export const record=cache(async<T>(collection:RecordCollection,slug:string,view?:'card'|'meta'):Promise<T|null>=>{
 const doc=(await recordDocuments(collection)).find(doc=>doc.slug===slug)
 return doc?presentRecord<T>(collection,collection==='products'||collection==='categories'?doc:recordSource(doc),view):null
})
const recordPresentation = cache(recordPresentationSource)
export function recordSource(doc:Document,selected?:PageBlock):Document {
 const source=recordPresentation(doc)
 return selected?applyRecordSection(source,selected):source
}
const recordContent=cache((collection:RecordCollection,doc:Document)=>presentRecord(collection,collection==='products'||collection==='categories'?doc:recordSource(doc)))
const recordSectionCounts=cache((doc:Document)=>{
 const counts=new Map<string,number>()
 for(const block of (doc.layout??[]) as PageBlock[])counts.set(block.blockType,(counts.get(block.blockType)??0)+1)
 return counts
})
export const recordSectionContent=cache(<T>(collection:RecordCollection,doc:Document,block:PageBlock):T=>
 collection==='products'||collection==='categories'?recordSectionCounts(doc).get(block.blockType)===1?recordContent(collection,doc) as T:presentCatalogRecord(collection,doc,block) as T:
 recordSectionCounts(doc).get(block.blockType)===1?recordContent(collection,doc) as T:presentRecord<T>(collection,recordSource(doc,block)))

function fieldValue(doc: Document, path: string): unknown {
  return path.split('.').reduce<unknown>((value,key) => value && typeof value === 'object' ? (value as Record<string,unknown>)[key] : undefined,doc)
}

export type PageBlock={id:string;blockType:string;enabled?:boolean;mediaPosition?:'original'|'left'|'right';content?:Record<string,unknown>;[key:string]:unknown}
export type CmsPage=Document & {title:Record<string,string>;sourceKey?:string;layout:PageBlock[];page:Record<string,unknown>}
export const pageIdentities=cache(async ():Promise<(Document & Pick<CmsPage,'title'|'sourceKey'>)[]> => await publishedSummary('pages') as (Document & Pick<CmsPage,'title'|'sourceKey'>)[])
export const preparePage=cache(async(doc:Document):Promise<CmsPage>=>{
 const [interfaceText,media]=await Promise.all([translationContent(),mediaDocuments()])
 const page=resolveMediaReferences(doc,media) as CmsPage
 const goals=(page.relationships as {goals?:number[]}|undefined)?.goals
 if(goals?.length){const references=new Map((await publishedDocuments('sustainability-goals')).map(doc=>[doc.id,resolveMediaReferences(doc,media)]));page.relationships={...(page.relationships as Record<string,unknown>),goals:goals.map(id=>references.get(id)).filter(Boolean)}}
 return {...page,interface:interfaceText,mediaRefs:media}
})
const pageByID=cache(async(id:number,prepareSections=true):Promise<CmsPage|undefined>=>{
 const doc=await publishedPage(id,prepareSections)
 return doc?preparePage(doc):undefined
})
export const pageBySlug=cache(async(slug:string):Promise<CmsPage|undefined>=> {
 const page=(await pageIdentities()).find(page=>page.slug===slug)
 return page?await pageByID(page.id):undefined
})
export const pageBySourceKey=cache(async(key:string,prepareSections=true):Promise<CmsPage|undefined>=>{
 const page=(await pageIdentities()).find(page=>page.sourceKey===key)
 return page?pageByID(page.id,prepareSections):undefined
})
export const pageLinks=cache(async ():Promise<{slug:string}[]> => (await pageIdentities()).map(page=>({slug:page.slug!})))
export const catalogInterfaceLabels=cache(async()=>hydrate(templates.globals['catalog-settings'].labels as unknown as Value,{id:0,interface:await translationContent()}) as CatalogLabels)

export const mediaDocuments=cache(async()=>new Map((await publishedSummary('media')).map(doc=>[doc.id,doc])))
export function localizedMedia(value:unknown,media:Map<number,Document>):unknown {
 if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).map(([locale,id])=>[locale,media.get(Number(id))??null]))
 return media.get(Number(value))??null
}

function resolveEditorMedia(value:unknown,media?:Map<number,Document>):unknown {
 if(!media || !value || typeof value!=='object')return value
 if(Array.isArray(value))return value.map(item=>resolveEditorMedia(item,media))
 const node=value as Record<string,unknown>
 if(node.type==='upload' && node.relationTo==='media' && typeof node.value==='number')return {...node,value:media.get(node.value)??null}
 return Object.fromEntries(Object.entries(node).map(([key,item])=>[key,['image','media'].includes(key) && typeof item==='number'?media.get(item)??null:resolveEditorMedia(item,media)]))
}

function publicMediaURL(value:unknown,doc:Document):string {
 const image=typeof value==='number'?(doc.mediaRefs as Map<number,Document>|undefined)?.get(value):value
 const url=image && typeof image==='object'?(image as {url?:string}).url:undefined
 return url?new URL(url,backendOrigin()).href:''
}

const mediaFields=new Set(['image','media','hero','heroImage','video','poster','socialImage','logo','icon','groupLogo','companyProfile','tds','document'])
export function resolveMediaReferences(value:unknown,media:Map<number,Document>):unknown {
 if(!value || typeof value!=='object')return value
 if(Array.isArray(value))return value.map(item=>resolveMediaReferences(item,media))
 const node=value as Record<string,unknown>
 const upload=(item:unknown):unknown=>typeof item==='number'?media.get(item)??null:item && typeof item==='object' && ('en' in item || 'ar' in item || 'fr' in item)?Object.fromEntries(Object.entries(item).map(([key,value])=>[key,typeof value==='number'?media.get(value)??null:value])):resolveMediaReferences(item,media)
 return Object.fromEntries(Object.entries(node).map(([key,item])=>[key,mediaFields.has(key)||(node.type==='upload'&&node.relationTo==='media'&&key==='value')?upload(item):resolveMediaReferences(item,media)]))
}
