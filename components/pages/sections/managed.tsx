import {backendOrigin} from '@/lib/payload/client'
import {presentManagedPage} from '@/lib/cms/managed-page'
import {getSearchPayload} from '@/lib/api/public'
import {ContactPageContent,LegalPageContent,ThankYouPageContent,SearchPageContent,NotFoundPageContent} from '@/components/content/managed-page-content'
import {ContactForm} from '@/components/enquiries/contact-form'
import {localePath} from '@/i18n/navigation'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings,context}:SectionArgs){
 const {name,pageSlug}=definition
 const content=presentManagedPage(source,backendOrigin(),block)
 const section=name==='hero'?'hero':'body'
 if(['privacy','terms','cookies'].includes(pageSlug))return LegalPageContent({content,locale,section,page:pageSlug as 'privacy'|'terms'|'cookies'})
 else if(pageSlug==='thank-you')return ThankYouPageContent({content,locale,section})
 else if(pageSlug==='contact'){
  return ContactPageContent({content,locale,section,company:settings.company,form:<ContactForm locale={locale} salesWhatsapp={settings.company.salesWhatsapp}/>})
 }else if(pageSlug==='search'){
  const data=await getSearchPayload(context.query??'',locale)
  return SearchPageContent({content,locale,section,results:data.results,query:context.query??'',action:localePath('/search',locale)})
 }else return NotFoundPageContent({content,locale,section})
}
