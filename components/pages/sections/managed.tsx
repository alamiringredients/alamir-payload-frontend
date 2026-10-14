import {type ReactNode} from 'react'
import {sectionContent} from '@/lib/payload/client'
import type {ManagedPageContent} from '@/lib/cms/types'
import {getSearchPayload} from '@/lib/api/public'
import {ContactPageContent,LegalPageContent,ThankYouPageContent,SearchPageContent,NotFoundPageContent} from '@/components/content/managed-page-content'
import {ContactForm} from '@/components/enquiries/contact-form'
import {localePath} from '@/i18n/navigation'
import {mainSections,type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings,context}:SectionArgs){
 const {name,pageSlug}=definition
 const content=sectionContent<ManagedPageContent>(source,block)
 let body:ReactNode
 if(['privacy','terms','cookies'].includes(pageSlug))body=LegalPageContent({content,locale,page:pageSlug as 'privacy'|'terms'|'cookies'})
 else if(pageSlug==='thank-you')body=ThankYouPageContent({content,locale})
 else if(pageSlug==='contact'){
  body=ContactPageContent({content,locale,company:settings.company,form:<ContactForm locale={locale} salesWhatsapp={settings.company.salesWhatsapp}/>})
 }else if(pageSlug==='search'){
  const data=await getSearchPayload(context.query??'',locale)
  body=SearchPageContent({content,locale,results:data.results,query:context.query??'',action:localePath('/search',locale)})
 }else body=NotFoundPageContent({content,locale})
 return mainSections(body)[name==='hero'?0:1]
}
