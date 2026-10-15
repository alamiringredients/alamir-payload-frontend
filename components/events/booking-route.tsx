import type {ReactNode} from 'react'
import {PageHero} from '@/components/site/page-hero'
import {SectionCopy} from '@/components/editor/section-copy'
import type {ManagedPageContent} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'

export function BookingPageBody({widget,content,locale,section:selectedSection}:{widget?:ReactNode;content:ManagedPageContent;locale:SiteLocale;section?:string}){
 const sections:Record<string,()=>ReactNode>={
  hero:()=>{
   const section=content.sections.find(item=>item.key==='hero')
   return section?.enabled?<PageHero className="bk-hero" image={section.images.image} imageAlt={section.text.text?.[locale]}><div className="kicker">{section.text.text2?.[locale]}</div><h1><SectionCopy section={section} locale={locale} field="heading"/></h1><p><SectionCopy section={section} locale={locale} field="body"/></p></PageHero>:null
  },
  bk_band:()=>content.sections.find(item=>item.key==='bk_band')?.enabled?<section className="band bk-band"><div className="wrap">{widget}</div></section>:null,
 }
 return selectedSection?sections[selectedSection]?.()??null:<main id="main">{sections.hero()}{sections.bk_band()}</main>
}
