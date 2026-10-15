import {sectionContent} from '@/lib/payload/client'
import {getDownloadsPayload} from '@/lib/api/public'
import {DownloadsContent} from '@/components/certifications/downloads-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='downloads'){
  const data=await getDownloadsPayload(locale),content=sectionContent<typeof data.content>(source,block)
  return <DownloadsContent content={content} data={data.certifications} catalog={data.catalog} settings={settings} locale={locale} labels={data.labels} fileSizes={data.fileSizes} section={name}/>
 }
}
