import {placeRecordMedia} from '@/lib/editor/media-position'
import type {ReactNode} from 'react'
import {recordDocuments,recordSectionContent} from '@/lib/payload/client'
import type {SiteLocale} from '@/i18n/navigation'
import {SectionLayout} from './section-layout'
import {Section} from './section'
import {recordSectionDefinitions} from '@/lib/payload/section-projection'
import type {PageBlock} from '@/lib/payload/client'
import './page-sections.css'

type Collection='products'|'categories'|'news'|'sustainability'|'jobs'|'events'
export async function RecordLayout<T>({collection,slug,recordId,locale,renderSection,children}:{collection:Collection;slug:string;recordId?:number;locale:SiteLocale;renderSection:(record:T,section:string,id:string)=>ReactNode;children?:ReactNode}){
 const doc=(await recordDocuments(collection)).find(doc=>recordId===undefined?doc.slug===slug:(doc.sourceId??doc.id)===recordId)
 if(!doc)throw new Error(`Missing ${collection} record: ${slug}`)
 const layout=(doc.layout??[]) as PageBlock[]
 const content=<SectionLayout layout={layout} renderSection={block=><Section block={block} locale={locale} renderSection={()=>{
  const section=recordSectionDefinitions.get(block.blockType)
  if(!section)return null
  return renderSection(placeRecordMedia(recordSectionContent<T>(collection,doc,block),block.mediaPosition),section.name,block.id)
 }}/>}/>
 return <main id="main" data-no-translate>{['news','sustainability','events'].includes(collection)?<article className={collection==='sustainability'?'sus':undefined}>{content}{children}</article>:<>{content}{children}</>}</main>
}
