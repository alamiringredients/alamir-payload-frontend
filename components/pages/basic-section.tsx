import {BuilderForm} from '@/components/forms/managed-form'
import type {CmsForm} from '@/lib/forms/types'
import type {CountryOption} from '@/lib/countries'
import {ContentRenderer,InlineContent} from '@/components/editor/content-renderer'
import {PageHero} from '@/components/site/page-hero'
import {ContentSection,SectionHeading,ActionGroup} from '@/components/site/content-section'
import {richText,type PageBlock} from '@/lib/payload/client'
import type {SiteLocale} from '@/i18n/navigation'
import type {ContentNode} from '@/lib/editor/document'

export function BasicSection({block,locale,form,countries=[],pageId}:{block:PageBlock;locale:SiteLocale;form?:CmsForm;countries?:readonly CountryOption[];pageId?:number}){
 const localized=(value:unknown)=>value && typeof value==='object' && ('en' in value || 'ar' in value || 'fr' in value) ? ((value as Record<string,unknown>)[locale]??(value as Record<string,unknown>).en):value
 const heading=richText(localized(block.heading),undefined,locale),body=richText(localized(block.body),undefined,locale),eyebrow=String(localized(block.eyebrow)??'')
 if(block.blockType==='form')return form?<ContentSection><SectionHeading kicker={eyebrow} title={<InlineContent document={heading}/>}/><ContentRenderer document={body}/><BuilderForm purpose="custom" definition={form} countries={countries} locale={locale} pageId={pageId}/></ContentSection>:null
 const media=block.media as {url?:string;alt?:Record<string,string>;mimeType?:string}|undefined
 const poster=block.poster as {url?:string}|undefined
 const caption=String(localized(block.caption)??'')
 const mediaNode:ContentNode=media?.mimeType?.startsWith('video/')?{type:'video',attrs:{src:media.url,poster:poster?.url,label:String(localized(media.alt)??''),caption,controls:true,ratio:'16/9'}}:{type:'image',attrs:{src:media?.url,alt:String(localized(media?.alt)??''),caption,ratio:'original',position:'center'}}
 if(block.blockType==='hero')return <PageHero image={media?.mimeType?.startsWith('image/')?media.url:undefined} imageAlt={String(localized(media?.alt)??'')} mediaPosition={block.mediaPosition==='left'?'left':'right'} media={media?.mimeType?.startsWith('video/')?<div className="ph-media"><ContentRenderer document={{type:'doc',content:[mediaNode]}}/></div>:undefined}><div className="kicker">{eyebrow}</div><h1><InlineContent document={heading}/></h1><div className="hero-description"><InlineContent document={body}/></div></PageHero>
 const mediaColumn:ContentNode={type:'column',content:[mediaNode]},bodyColumn:ContentNode={type:'column',content:body.content}
 const mediaFirst=block.mediaPosition==='left'?locale!=='ar':locale==='ar'
 const content=block.blockType==='text-media'?<ContentRenderer document={{type:'doc',content:[{type:'columns',attrs:{layout:'equal',verticalAlign:'center',mediaSide:block.mediaPosition==='left'?(locale==='ar'?'end':'start'):(locale==='ar'?'start':'end')},content:mediaFirst?[mediaColumn,bodyColumn]:[bodyColumn,mediaColumn]}]}}/>:<ContentRenderer document={body}/>
 return <ContentSection theme={block.blockType==='call-to-action'?'tint':'plain'}><SectionHeading kicker={eyebrow} title={<InlineContent document={heading}/>}/>{content}
  {block.blockType==='gallery'&&<ContentRenderer document={{type:'doc',content:[{type:'gallery',attrs:{images:((block.images??[]) as {image:{url:string;alt:Record<string,string>};caption:Record<string,string>;alt?:Record<string,string>}[]).map(item=>({src:item.image.url,alt:String(localized(item.alt)??localized(item.image.alt)??''),caption:String(localized(item.caption)??'')}))}}]}}/>}
  {block.blockType==='call-to-action'&&<ActionGroup actions={((block.actions??[]) as {label:Record<string,string>;href:string}[]).map(action=>({href:action.href,label:String(localized(action.label)??'')}))}/>}
 </ContentSection>
}
