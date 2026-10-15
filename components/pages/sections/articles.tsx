import {backendOrigin,records} from '@/lib/payload/client'
import {presentNewsPage} from '@/lib/cms/page-content'
import {presentSustainabilityPage} from '@/lib/cms/sustainability-page'
import {getSustainabilityCards,getNewsCards} from '@/lib/api/public'
import {SustainabilityIndexBody} from '@/components/sustainability/sustainability-body'
import {NewsIndexBody} from '@/components/news/news-body'
import {presentNewsCard} from '@/lib/news/presentation'
import {getInterface} from '@/lib/payload/interface'
import type {NewsTaxonomy} from '@/lib/news/types'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,context}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='sustainability'){
  const [ui,articles]=await Promise.all([getInterface(),name==='content'?getSustainabilityCards():[]])
  const page=presentSustainabilityPage(source,backendOrigin(),block)
  return SustainabilityIndexBody({articles,page,labels:ui.sustainability[locale],locale,section:name})
 }
 if(pageSlug==='news'){
  const [ui,cards,taxonomies]=await Promise.all([getInterface(),name==='articles'?getNewsCards():[],name==='articles'?records<NewsTaxonomy>('news-taxonomies'):[]])
  const page=presentNewsPage(source,backendOrigin(),block)
  return NewsIndexBody({articles:cards.map(card=>presentNewsCard(card,locale,taxonomies)),taxonomies,page:page[locale],heroImage:page.heroImage,sectionVisibility:page.sectionVisibility,locale,labels:ui.news[locale],tag:context.tag,section:name})
 }

}
