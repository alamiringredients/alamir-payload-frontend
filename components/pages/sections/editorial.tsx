import {placeMedia} from '@/lib/editor/media-position'
import {sectionContent} from '@/lib/payload/client'
import type {EditorialPageContent} from '@/lib/cms/types'
import {ContentRenderer} from '@/components/editor/content-renderer'
import {EditorialPageHero} from '@/components/editor/editorial-page-hero'
import {qualityBlockRenderer} from '@/components/certifications/quality-blocks'
import {getQualityPayload} from '@/lib/api/public'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='about' || pageSlug==='quality'){
  const content=sectionContent<EditorialPageContent>(source,block)
  if(name==='hero')return <EditorialPageHero {...{kicker:content.hero.kicker[locale],title:content.hero.title[locale],description:content.hero.description[locale],image:content.hero.image,imageAlt:content.hero.alt[locale],mediaPosition:block.mediaPosition==='left'?'left':'right'}}/>
  const nodes=content.body[locale].content.filter(node=>node.attrs?.id===name)
  const document=placeMedia({type:'doc',content:nodes},block.mediaPosition,locale)
  if(pageSlug==='quality'){
   const data=await getQualityPayload(locale)
   return <ContentRenderer document={document} renderBlock={qualityBlockRenderer(data.certifications,locale,data.labels,settings.groupLogo)}/>
  }
  return <ContentRenderer document={document} groupLogo={settings.groupLogo}/>
 }

}
