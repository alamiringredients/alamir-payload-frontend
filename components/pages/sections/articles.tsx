import {sectionContent} from '@/lib/payload/client'
import {getSustainabilityPayload,getNewsPayload} from '@/lib/api/public'
import {SustainabilityIndexBody} from '@/components/sustainability/sustainability-body'
import {NewsIndexBody} from '@/components/news/news-body'
import {presentNewsCard} from '@/lib/news/presentation'
import {mainSections,type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,context}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='sustainability'){
  const data=await getSustainabilityPayload(locale),page=sectionContent<typeof data.page>(source,block)
  return mainSections(SustainabilityIndexBody({...data,page,locale}))[['hero','content','related'].indexOf(name)]
 }
 if(pageSlug==='news'){
  const data=await getNewsPayload(locale),page=sectionContent<typeof data.page>(source,block)
  return mainSections(NewsIndexBody({articles:data.cards.map(card=>presentNewsCard(card,locale,data.taxonomies)),taxonomies:data.taxonomies,page:page[locale],heroImage:page.heroImage,sectionVisibility:page.sectionVisibility,locale,labels:data.labels,tag:context.tag}))[['hero','articles','events'].indexOf(name)]
 }

}
