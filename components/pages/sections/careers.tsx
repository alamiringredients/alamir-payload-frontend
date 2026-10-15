import {sectionContent} from '@/lib/payload/client'
import {getCareersPayload} from '@/lib/api/public'
import {CareersPageBody} from '@/components/careers/public-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='careers'){
  const data=await getCareersPayload(locale),content=sectionContent<typeof data.content>(source,block)
  return CareersPageBody({...data,content,locale,section:name})
 }

}
