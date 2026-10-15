import {placeRecordMedia} from '@/lib/editor/media-position'
import type {ReactNode} from 'react'
import {recordDocuments,recordSource,presentRecord,type Document} from '@/lib/payload/client'
import type {SiteLocale} from '@/i18n/navigation'
import {SectionLayout} from './section-layout'
import recordSections from '@/lib/payload/record-sections.json'
import type {PageBlock} from '@/lib/payload/client'
import './page-sections.css'

type Collection='products'|'categories'|'news'|'sustainability'|'jobs'|'events'
export async function RecordLayout<T>({collection,slug,recordId,locale,renderSection,children}:{collection:Collection;slug:string;recordId?:number;locale:SiteLocale;renderSection:(record:T,section:string)=>ReactNode;children?:ReactNode}){
 const doc=(await recordDocuments(collection)).find(doc=>recordId===undefined?doc.slug===slug:(doc.sourceId??doc.id)===recordId)
 if(!doc)throw new Error(`Missing ${collection} record: ${slug}`)
 const layout=(doc.layout??[]) as PageBlock[]
 const counts=new Map<string,number>()
 for(const block of layout)counts.set(block.blockType,(counts.get(block.blockType)??0)+1)
 const record=presentRecord<T>(collection,recordSource(doc as Document))
 const content=<SectionLayout layout={layout} locale={locale} renderSection={block=>{
  const section=recordSections.find(section=>section.slug===block.blockType)
  if(!section)return null
  return renderSection(placeRecordMedia(counts.get(block.blockType)===1?record:presentRecord<T>(collection,recordSource(doc as Document,block)),block.mediaPosition),section.name)
 }}/>
 return <main id="main" data-no-translate>{['news','sustainability','events'].includes(collection)?<article className={collection==='sustainability'?'sus':undefined}>{content}{children}</article>:<>{content}{children}</>}</main>
}
