import {type ReactElement,type ReactNode} from 'react'
import {sectionContent} from '@/lib/payload/client'
import {getDownloadsPayload} from '@/lib/api/public'
import {DownloadsContent} from '@/components/certifications/downloads-content'
import {mainSections,type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='downloads'){
  const data=await getDownloadsPayload(locale),content=sectionContent<typeof data.content>(source,block)
  content.sectionVisibility={hero:name==='hero',products:name==='product',company:name==='company'}
  const body=mainSections(DownloadsContent({content,data:data.certifications,catalog:data.catalog,settings,locale,labels:data.labels,fileSizes:data.fileSizes}))
  if(name==='hero')return body[0]
  const band=body[0] as ReactElement<{children:ReactNode}>
  return band.props.children
 }

}
