import type {Document} from './types'
import 'server-only'
import {cache} from 'react'
import {locale as rootLocale} from 'next/root-params'

type Row=Record<string,unknown>
type Collection<T extends Document=Document>={docs:T[];[key:string]:unknown}
const site=cache(async(query:string):Promise<Record<string,Row|Collection>>=>{
 const origin=process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/,'')
 if(!origin)throw new Error('NEXT_PUBLIC_BACKEND_URL is required.')
 const response=await fetch(`${origin}/api/public/site?${query}`,{next:{revalidate:60,tags:['payload-content']}})
 if(!response.ok)throw new Error(`Published website content failed (${response.status}).`)
 return response.json()
})
const requestLocale=cache(async()=>{try{return await rootLocale()??'all'}catch{return 'all'}})
const shared=cache(async()=>site(`scope=shared&locale=${await requestLocale()}`))
const identities=cache(()=>site('scope=identities&locale=all'))
const loaded=cache(()=>new Map<string,Promise<Row|Collection>>())
const groups:Record<string,string[]>={
 home:['pages','certifications','certification-types','events'],
 catalog:['pages','products','categories','product-applications','product-concentrations','certifications','certification-types'],
 quality:['pages','certifications','certification-types'],
 news:['pages','news','news-taxonomies'],
 careers:['pages','jobs','news','news-taxonomies'],
 events:['pages','events'],
 booking:['pages','events','meeting-slots'],
 sustainability:['pages','sustainability','sustainability-goals'],
 page:['pages'],
}
const groupFor=(key:string)=>key==='home-page'?'home':key==='products-page'||key==='downloads-page'?'catalog':key==='quality-page'?'quality':key==='careers-page'?'careers':key==='events-page'?'events':key==='booking-page'?'booking':key==='news-page'?'news':key==='sustainability-page'?'sustainability':'page'
async function preparePublicContent(group:string,pending:ReturnType<typeof loaded>){
 const resources=groups[group]
 const missing=resources.filter(resource=>!pending.has(resource))
 if(missing.length){
  const result=requestLocale().then(locale=>site(`scope=content&resources=${missing.sort().join(',')}&locale=${locale}`))
  for(const resource of missing)pending.set(resource,result.then(content=>{
   if(!content[resource])throw new Error(`Missing public resource: ${resource}`)
   return content[resource]
  }))
 }
 await Promise.all(resources.map(resource=>pending.get(resource)!))
}
const summaryFields:Record<string,string[]>={pages:['slug','sourceKey','title'],products:['name','slug','sourceId','category','gallery'],categories:['name','slug','sourceId','icon','description','page.artwork'],media:['url','width','height','mimeType','filename','prefix','alt'],translations:['key','text']}
async function resourceContent(resource:string,params:URLSearchParams){
 if(params.get('view')==='identity')return (await identities())[resource]
 const metadata=await shared()
 const fields=[...params.keys()].filter(key=>key.startsWith('select[')).map(key=>[...key.matchAll(/\[([^\]]+)\]/g)].map(match=>match[1]).join('.'))
 if(resource.startsWith('globals/')||fields.length&&fields.every(field=>summaryFields[resource]?.includes(field)))return metadata[resource]
 if(resource==='forms'){
  const query=new URLSearchParams({scope:'content',resources:'forms',locale:params.get('locale')??await requestLocale()})
  for(const [path,key] of [['owner.relationTo','owner'],['owner.value','ownerId'],['purpose','purpose']]){const value=params.get(`where[${path}][equals]`);if(value)query.set(key,value)}
  return (await site(query.toString())).forms
 }
 const pending=loaded()
 if(!pending.has(resource)){
  let group=({products:'catalog',categories:'catalog',jobs:'careers',news:'news','news-taxonomies':'news',events:'events','meeting-slots':'booking',sustainability:'sustainability','sustainability-goals':'sustainability','certifications':'quality','certification-types':'quality','product-applications':'catalog','product-concentrations':'catalog'} as Record<string,string>)[resource]??'page'
  if(resource==='pages'){
   const id=params.get('where[id][equals]'),sourceKey=params.get('where[sourceKey][equals]')
   const page=(metadata.pages as Collection).docs.find(page=>id?String(page.id)===id:page.sourceKey===sourceKey)
   group=groupFor(String(page?.sourceKey??''))
  }
  await preparePublicContent(group,pending)
 }
 return pending.get(resource)!
}

function valueAt(value:unknown,path:string):unknown{
 return path.split('.').reduce<unknown>((value,key)=>value&&typeof value==='object'?(value as Row)[key]:undefined,value)
}
function localized(value:unknown,locale:string):unknown{
 if(Array.isArray(value))return value.map(item=>localized(item,locale))
 if(!value||typeof value!=='object')return value
 const row=value as Row
 if('en' in row && Object.keys(row).every(key=>['en','ar','fr'].includes(key)))return row[locale]??row.en
 return Object.fromEntries(Object.entries(row).map(([key,value])=>[key,localized(value,locale)]))
}
function selected(row:Row,fields:Row):Row{
 return Object.fromEntries(Object.entries(row).filter(([key])=>key==='id'||key in fields).map(([key,value])=>[
  key,fields[key]&&typeof fields[key]==='object'&&value&&typeof value==='object'?selected(value as Row,fields[key] as Row):value,
 ]))
}

// The published projection contains native Payload documents. Apply only the read shapes used by this frontend.
function read(path:`globals/${string}`):Promise<Document>
function read<T extends Document=Document>(path:string):Promise<Collection<T>>
async function read(path:string):Promise<Row|Collection>{
 const [resource,search]=path.split('?'),params=new URLSearchParams(search)
 const content=await resourceContent(resource,params)
 if(!content)throw new Error(`Unknown public resource: ${resource}`)
 const locale=params.get('locale')??'all'
 if(resource.startsWith('globals/'))return (locale==='all'?content:localized(content,locale)) as Document
 let docs=(content as Collection).docs
 const fields:Row={}
 for(const [key,value] of params){
  const where=key.match(/^where\[([^\]]+)\]\[equals\]$/)
  if(where)docs=docs.filter(doc=>String(valueAt(doc,where[1]))===value)
  if(key.startsWith('where[')&&!where)throw new Error(`Unsupported public filter: ${key}`)
  if(key.startsWith('select[')&&value==='true'){
   const parts=[...key.matchAll(/\[([^\]]+)\]/g)].map(match=>match[1]);let parent=fields
   for(const part of parts.slice(0,-1)){parent[part]??={};parent=parent[part] as Row}
   parent[parts.at(-1)!]=true
  }
 }
 const sort=params.get('sort')
 if(sort){const descending=sort.startsWith('-'),key=sort.replace(/^-/,'');docs=[...docs].sort((a,b)=>String(valueAt(a,key)??'').localeCompare(String(valueAt(b,key)??''),undefined,{numeric:true})*(descending?-1:1))}
 const limit=Number(params.get('limit')??0)
 if(limit>0)docs=docs.slice(0,limit)
 if(Object.keys(fields).length)docs=docs.map(doc=>selected(doc,fields) as Document)
 if(locale!=='all')docs=docs.map(doc=>localized(doc,locale) as Document)
 return {docs,totalDocs:docs.length,hasNextPage:false,hasPrevPage:false,page:1,totalPages:1}
}
export const publicRequest=cache(read) as typeof read
