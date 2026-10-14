import {sectionContent} from '@/lib/payload/client'
import {getCareersPayload} from '@/lib/api/public'
import {CareersPageBody} from '@/components/careers/public-content'
import {mainSections,type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings,context}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='careers'){
  const data=await getCareersPayload(locale),content=sectionContent<typeof data.content>(source,block)
  return mainSections(CareersPageBody({...data,content,locale}))[['hero','news','jobs','apply'].indexOf(name)]
 }

}
