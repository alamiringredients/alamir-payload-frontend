import {CatalogInteractions} from '@/components/catalog/catalog-interactions'
import {sectionContent} from '@/lib/payload/client'
import type {ManagedPageContent} from '@/lib/cms/types'
import {getCatalogPayload} from '@/lib/api/public'
import {CatalogIndexSections} from '@/components/catalog/catalog-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='products'){
  const data=await getCatalogPayload(locale,'products'),content=sectionContent<ManagedPageContent>(source,block)
  const blocks=content.sections.map((section,index)=>({...section,key:`section-${index}`}))
  const index=['hero','collection','deep'].indexOf(name)
  const section=CatalogIndexSections({content:{blocks},context:{catalog:data.catalog,locale,certifications:data.certifications,certificationLabels:data.certificationLabels,settings}})[index]
  return <>{section}{name==='collection'&&<CatalogInteractions/>}</>
 }

}
