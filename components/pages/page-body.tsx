import {Fragment} from 'react'
import {getCustomForms,getFormCountries} from '@/lib/forms/server'
import type {CmsForm} from '@/lib/forms/types'
import type {CountryOption} from '@/lib/countries'
import sections from '@/lib/payload/sections.json'
import {pageBySourceKey,type CmsPage,type PageBlock} from '@/lib/payload/client'
import type {SiteLocale} from '@/i18n/navigation'
import {getLayoutPayload} from '@/lib/api/public'
import {ContentSection} from '@/components/site/content-section'
import {BasicSection} from './basic-section'
import {SectionLayout} from './section-layout'
import {PageStyles} from './page-styles'
import type {PageContext} from './section-utils'
import './page-sections.css'

const renderers={
 editorial:()=>import('./sections/editorial'),home:()=>import('./sections/home'),careers:()=>import('./sections/careers'),
 downloads:()=>import('./sections/downloads'),catalog:()=>import('./sections/catalog'),events:()=>import('./sections/events'),
 articles:()=>import('./sections/articles'),managed:()=>import('./sections/managed'),
}
const formId=(block:PageBlock)=>typeof block.form==='object' && block.form ? (block.form as {id:number}).id : Number(block.form)
async function Section({block,locale,page,context,form,countries}:{form?:CmsForm;countries:readonly CountryOption[];block:PageBlock;locale:SiteLocale;page:CmsPage;context:PageContext}){
 const definition=sections.find(section=>section.slug===block.blockType)
 if(!definition)return <BasicSection block={block} locale={locale} form={form} countries={countries} pageId={page.id}/>
 const source=page.sourceKey===definition.pageKey?page:await pageBySourceKey(definition.pageKey)
 if(!source)throw new Error(`Missing section source: ${definition.pageKey}`)
 const {settings}=await getLayoutPayload()
 const name=definition.pageSlug
 const group=name==='about'||name==='quality'?'editorial':name==='products'?'catalog':name==='events'||name==='book-a-meeting'?'events':name==='news'||name==='sustainability'?'articles':name==='home'||name==='careers'||name==='downloads'?name:'managed'
 const renderer=await renderers[group]()
 const content=await renderer.renderSection({block,locale,source,definition,settings,context})
 return <><PageStyles page={name}/>{content}</>
}
export async function PageBody({page,locale,context={}}:{page:CmsPage;locale:SiteLocale;context?:PageContext}){
 const blocks=page.layout.filter(block=>block.enabled!==false)
 const formIds=blocks.filter(block=>block.blockType==='form').map(formId)
 const forms=await getCustomForms(locale,[...new Set(formIds)])
 const countries=await getFormCountries(forms,locale)
 const formsById=new Map(forms.map(form=>[form.id,form]))
 const rendered=new Map(await Promise.all(blocks.map(async block=>[block.id,await Section({block,locale,page,context,countries,form:formsById.get(formId(block))})] as const)))
 const groups:PageBlock[][]=[]
 for(const block of blocks){
  const last=groups.at(-1)
  if(/^downloads-(product|company)$/.test(block.blockType) && last?.every(item=>/^downloads-(product|company)$/.test(item.blockType)))last.push(block)
  else groups.push([block])
 }
 return <main id="main">{groups.map(group=><Fragment key={group[0].id}>{/^downloads-(product|company)$/.test(group[0].blockType)?<ContentSection>{group.map(block=><Fragment key={block.id}>{rendered.get(block.id)}</Fragment>)}</ContentSection>:<SectionLayout layout={group} locale={locale} renderSection={block=>rendered.get(block.id)}/>}{" "}</Fragment>)}</main>
}
