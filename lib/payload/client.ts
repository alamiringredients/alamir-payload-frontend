import type {CatalogLabels} from '@/lib/catalog/types'
import {richText} from '@/lib/editor/lexical'
export {richText} from '@/lib/editor/lexical'
import 'server-only'
import { cache } from 'react'
import {publishedSummary,publishedIdentities,publishedDocuments,publishedGlobal,publishedPage,type IdentityResource} from './public-site'
import templates from './templates.json'
import sections from './sections.json'
import recordSections from './record-sections.json'
import { textContent, type ContentNode, type ContentDocument } from '@/lib/editor/document'

type Value = string | number | boolean | null | Value[] | { [key: string]: Value }
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
export const globalContent = cache(async <T>(slug: keyof typeof templates.globals,view?:'meta'): Promise<T> => {
  if(slug==='interface-text')return hydrate(templates.globals[slug] as unknown as Value,await translationContent()) as T
  const page=slug==='website-settings'||slug==='navigation'?undefined:await pageBySourceKey(slug==='catalog-settings'?'products-page':slug)
  const doc=page?sourceDocument(page):await publishedGlobal(slug)
  const [interfaceText,media]=await Promise.all([translationContent(),mediaDocuments()])
  doc.interface=interfaceText;doc.mediaRefs=media
  if(slug==='navigation'){
    const links=new Map((await pageIdentities()).map(page=>[page.id,page]))
    const resolve=(value:unknown):unknown=>Array.isArray(value)?value.map(resolve):value && typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,key==='page' && typeof item==='number'?links.get(item)??null:resolve(item)])):value
    doc.page=resolve(doc.page)
  }
  const template=templates.globals[slug] as unknown as Record<string,Value>
  const result=hydrate(view==='meta'?{seo:template.seo,sections:[]}:template,doc) as Record<string,unknown>
  if(slug==='catalog-settings'){
    const [applications,concentrations]=await Promise.all([publishedDocuments('product-applications'),publishedDocuments('product-concentrations')])
    const options=(docs:Document[])=>docs.map(doc=>({id:doc.key,label:doc.name}))
    result.applications=options(applications);result.concentrations=options(concentrations)
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
export const recordDocuments=cache(async(slug:keyof typeof templates.collections):Promise<Document[]>=>{
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
function articleBody(value:unknown,locale:string,introStyle:unknown):ContentDocument {
 const document=richText(value,undefined,locale)
 const first=document.content[0]
 if(first?.type==='paragraph' && introStyle==='lead')first.attrs={...first.attrs,variant:'lead'}
 return document
}
export function presentRecord<T>(slug:keyof typeof templates.collections,doc:Document,view?:'card'|'meta'):T{
 const layouts=templates.collections[slug] as unknown as Record<string,Value>
  let template = layouts[String(doc.sourceId)] ?? Object.values(layouts)[0]
  if(view && (slug==='news'||slug==='sustainability')){
   const content=(template as Record<string,Value>).content as Record<string,Value>
   const locales=content.locales as Record<string,Value>
   const fields=view==='meta'
    ? ['seoTitle','seoDescription',slug==='news'?'hero':'gallery']
    : slug==='news'
     ? ['title','summary','cardTitle','cardSummary','hero','heroAlt']
     : ['title','summary','cardTitle','cardSummary','badge','gallery']
   template={
    ...(template as Record<string,Value>),
    content:{
     ...(view==='card'?content:{}),
     locales:{...locales,$localeTree:Object.fromEntries(Object.entries(locales.$localeTree as Record<string,Value>).filter(([key])=>fields.includes(key)))},
    },
   }
  } else if(view && slug==='jobs'){
   const content=(template as Record<string,Value>).content as Record<string,Value>
   const fields=view==='meta'?['title','summary']:['title','summary','department','location','contract','experience']
   template={...(template as Record<string,Value>),content:{$localeTree:Object.fromEntries(Object.entries(content.$localeTree as Record<string,Value>).filter(([key])=>fields.includes(key)))}}
  } else if(view==='card' && slug==='events'){
   const content=(template as Record<string,Value>).content as Record<string,Value>
   template={...(template as Record<string,Value>),content:Object.fromEntries(Object.entries(content).filter(([key])=>key!=='body'))}
  } else if(view==='meta' && slug==='events'){
   const content=(template as Record<string,Value>).content as Record<string,Value>
   template={...(template as Record<string,Value>),content:{seo:content.seo}}
  } else if(view==='card' && template && typeof template==='object' && !Array.isArray(template)){
   const fields=new Set(['name','description','artwork','applications','concentrations','gallery','seo','icon','tds'])
   template={...template,content:Object.fromEntries(Object.entries(template.content as Record<string,Value>).filter(([key])=>fields.has(key)))}
  }
  const result = hydrate(template, doc) as Record<string, unknown>
  // Component contracts use the historical reference IDs; submissions use Payload IDs.
  result.id=doc.sourceId ?? doc.id
  if (slug === 'categories') (result.content as Record<string,unknown>).appearance=doc.appearance ?? 'standard'
  if (slug === 'products' && typeof doc.category === 'object' && doc.category) result.category_id=(doc.category as { sourceId?: number; id: number }).sourceId ?? (doc.category as {id:number}).id
  if (slug === 'certifications' && typeof doc.certificationType === 'object' && doc.certificationType) result.type_id=(doc.certificationType as {sourceId?:number;id:number}).sourceId ?? (doc.certificationType as {id:number}).id
  if (slug === 'jobs') {
    result.status=doc.availability
    const localized=result.content as Record<string,Record<string,unknown>>
    for(const language of ['en','ar','fr']){localized[language].title=(doc.name as Record<string,string>)?.[language]??'';if(!view)localized[language].heading=richText((doc.title as Record<string,unknown>)?.[language],undefined,language)}
  }
  if(slug==='sustainability'){
    const images=doc.heroImage as Record<string,{url?:string}|undefined>|undefined
    const localized=(result.content as {locales:Record<string,Record<string,unknown>>}).locales
    for(const language of ['en','ar','fr']){const image=images?.[language];localized[language].gallery=image?.url?[{src:image.url,alt:(doc.heroAlt as Record<string,string>)?.[language]??'',caption:(doc.heroCaption as Record<string,string>)?.[language]??''}]:[]}
  }
  if (['products','categories','sustainability'].includes(slug)) {
    const content=result.content as Record<string,unknown>
    if(slug==='products' || slug==='categories'){
      const images=(doc.page as {artwork?:{images?:{image:{url?:string};alt?:Record<string,string>}[]}})?.artwork?.images
      const artwork=content.artwork as {assets:unknown[]}
      artwork.assets=(images??[]).map((item,index)=>({id:String(index),kind:'image',label:'Image',source:'',value:publicMediaURL(item.image,doc)}))
    }
    const photos=doc.gallery as {image:{url?:string};caption:Record<string,string>;alt:Record<string,string>}[]|undefined
    if(Array.isArray(photos)) {
    if(slug === 'sustainability') {
      const localized=content.locales as Record<string,Record<string,unknown>>
      for(const language of ['en','ar','fr'])localized[language].gallery=photos.map(photo=>({src:publicMediaURL(photo.image,doc),alt:photo.alt?.[language]??'',caption:photo.caption?.[language]??''}))
    } else content.gallery=photos.map(photo=>({image:publicMediaURL(photo.image,doc),caption:photo.caption,alt:photo.alt}))
    }
    if(slug === 'products' || slug === 'categories') {
    const gallery=doc.gallery as typeof photos
    const blocks=(content.page as {blocks?: {key:string;assets:unknown[];texts:unknown[]}[]}|undefined)?.blocks
    const block=blocks?.find(block=>block.key==='section-2')
    if(block && Array.isArray(gallery)) {
      block.assets=gallery.map((photo,index)=>({id:String(index),kind:'image',label:'Image',source:'',alt:photo.alt,value:publicMediaURL(photo.image,doc)}))
      block.texts=[...block.texts.slice(0,5),...gallery.map((photo,index)=>({id:`caption-${index}`,label:'Caption',source:'',values:photo.caption}))]
    }
    }
  }
  if(slug==='events' && !view){
   const localized=(result.content as {body:Record<string,unknown>}).body
   for(const language of ['en','ar','fr'])localized[language]=articleBody((doc.body as Record<string,unknown>)?.[language],language,doc.introStyle)
  }
  if (slug === 'news' || slug === 'sustainability') {
    const content=result.content as Record<string, unknown>
    const localized=content.locales as Record<string,Record<string,unknown>>
    for(const language of ['en','ar','fr']) {
    if(slug==='news' && view!=='meta'){
      const cardTitle=(doc.cardTitle as Record<string,unknown>|undefined)?.[language]
      const cardSummary=(doc.cardSummary as Record<string,string>|undefined)?.[language]
      if(cardTitle)localized[language].cardTitle=richText(cardTitle,undefined,language)
      if(cardSummary)localized[language].cardSummary=cardSummary
    }
    const body=(doc.body as Record<string,{root?:{children?:unknown[]}}> | undefined)?.[language]
    if(!view && body?.root?.children?.length){
      const document=articleBody(body,language,doc.introStyle)
      if(slug==='sustainability'){
        const content:ContentNode[]=[]
        let section:ContentNode|undefined
        for(const node of document.content){
          if(node.type==='heading' && node.attrs?.level===2){section={type:'contentSection',attrs:{id:node.attrs.id},content:[]};content.push(section)}
          if(section)section.content!.push(node)
          else {if(node.type==='paragraph')node.attrs={...node.attrs,variant:'lead'};content.push(node)}
        }
        document.content=content
      }
      localized[language].body=document
    }
    }
    result.published=content.locales
    result.availableLocales=['en','ar','fr']
  }
  return result as T
}
export const records=cache(async<T>(slug:keyof typeof templates.collections,view?:'card'|'meta'):Promise<T[]> => (await recordDocuments(slug)).map(doc=>presentRecord<T>(slug,recordSource(doc),view)))
export const record=cache(async<T>(collection:keyof typeof templates.collections,slug:string,view?:'card'|'meta'):Promise<T|null>=>{
 const doc=(await recordDocuments(collection)).find(doc=>doc.slug===slug)
 return doc?presentRecord<T>(collection,recordSource(doc),view):null
})
export function recordSource(doc:Document,selected?:PageBlock):Document{
 const blocks=doc.layout as PageBlock[]|undefined
 let result={...doc,page:{...(doc.page as Record<string,unknown>)}}
 for(const block of [...(blocks??[]),...(selected?[selected]:[])]){
  const section=recordSections.find(section=>section.slug===block.blockType)
  if(!section || !block.data)continue
  const data=block.data as Record<string,unknown>
  const page=Object.fromEntries(section.page.map(key=>[key,{...(data[key] as Record<string,unknown>),enabled:block.enabled!==false}]))
  const root=Object.fromEntries(Object.keys(section.root??{}).map(key=>[key,data[key==='body' && section.collection==='events'?'bodyCopy':key]]))
  result={...result,...root,page:{...result.page,...page}}
 }
 return result
}

function fieldValue(doc: Document, path: string): unknown {
  return path.split('.').reduce<unknown>((value,key) => value && typeof value === 'object' ? (value as Record<string,unknown>)[key] : undefined,doc)
}

export type PageBlock={id:string;blockType:string;enabled?:boolean;mediaPosition?:'original'|'left'|'right';content?:Record<string,unknown>;[key:string]:unknown}
export type CmsPage=Document & {title:Record<string,string>;sourceKey?:string;layout:PageBlock[];page:Record<string,unknown>}
export const pageIdentities=cache(async ():Promise<(Document & Pick<CmsPage,'title'|'sourceKey'>)[]> => await publishedSummary('pages') as (Document & Pick<CmsPage,'title'|'sourceKey'>)[])
const resolvePage=cache(async(doc:Document):Promise<CmsPage>=>{
 const [interfaceText,media]=await Promise.all([translationContent(),mediaDocuments()])
 const page=resolveMediaReferences(doc,media) as CmsPage
 const goals=(page.relationships as {goals?:number[]}|undefined)?.goals
 if(goals?.length){const references=new Map((await publishedDocuments('sustainability-goals')).map(doc=>[doc.id,resolveMediaReferences(doc,media)]));page.relationships={...(page.relationships as Record<string,unknown>),goals:goals.map(id=>references.get(id)).filter(Boolean)}}
 return {...page,interface:interfaceText,mediaRefs:media}
})
const pageByID=cache(async(id:number):Promise<CmsPage|undefined>=>{
 const doc=await publishedPage(id)
 return doc?resolvePage(doc):undefined
})
export const pageBySlug=cache(async(slug:string):Promise<CmsPage|undefined>=> {
 const page=(await pageIdentities()).find(page=>page.slug===slug)
 return page?await pageByID(page.id):undefined
})
export const pageBySourceKey=cache(async(key:string):Promise<CmsPage|undefined>=>{
 const page=(await pageIdentities()).find(page=>page.sourceKey===key)
 return page?pageByID(page.id):undefined
})
export const pageLinks=cache(async ():Promise<{slug:string}[]> => (await pageIdentities()).map(page=>({slug:page.slug!})))
function sourceDocument(page:CmsPage,selected?:PageBlock):Document {
 const fields:Record<string,unknown>={...page.page,sectionVisibility:{hero:true,body:true,news:true,jobs:true,apply:true,company:true,products:true,product:true,related:true,events:true,contact:true}}
 for(const block of page.layout){
  const section=sections.find(section=>section.slug===block.blockType)
  if(section){fields[section.sourceName]={...(fields[section.sourceName] as Record<string,unknown>),...block.content,enabled:block.enabled!==false};if(section.pageSlug==='news' && section.name==='hero')fields.heroImage=block.content?.heroImage}
 }
 if(selected){
  const section=sections.find(section=>section.slug===selected.blockType)
  if(section){fields[section.sourceName]={...(fields[section.sourceName] as Record<string,unknown>),...selected.content,enabled:true};if(section.pageSlug==='news' && section.name==='hero')fields.heroImage=selected.content?.heroImage}
 }
 return {...page,page:fields}
}
const sharedSectionContent=cache((page:CmsPage,key:keyof typeof templates.globals)=>hydrate(templates.globals[key] as unknown as Value,sourceDocument(page)))
export function sectionContent<T>(page:CmsPage,block:PageBlock):T {
 const definition=sections.find(section=>section.slug===block.blockType)
 const own=page.layout.some(item=>item.id===block.id)
 if(own&&page.layout.filter(item=>item.blockType===block.blockType).length===1)return sharedSectionContent(page,definition!.pageKey as keyof typeof templates.globals) as T
 const template=templates.globals[definition!.pageKey as keyof typeof templates.globals] as unknown as Record<string,Value>
 const selected=definition?.pageSlug==='home'?{...template,sections:(template.sections as {key:string}[]).filter(section=>section.key===definition.name)}:template
 return hydrate(selected,sourceDocument(page,block)) as T
}

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
