import sections from '@/lib/payload/sections.json'
import {sectionContent} from '@/lib/payload/client'
import type {ManagedPageContent} from '@/lib/cms/types'
import {getCatalogPayload} from '@/lib/api/public'
import {renderManagedSection} from '@/lib/cms/render'
import {CatalogIndexSections} from '@/components/catalog/catalog-content'
import {mainSections,type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings,context}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='products'){
  const data=await getCatalogPayload(locale,'products'),content=sectionContent<ManagedPageContent>(source,block)
  const blocks=content.sections.map((section,index)=>({...section,key:`section-${index}`}))
  const index=['hero','collection','deep'].indexOf(name)
  return renderManagedSection(CatalogIndexSections({content:{blocks},context:{catalog:data.catalog,locale,certifications:data.certifications,certificationLabels:data.certificationLabels,settings}})[index],content.sections[index],locale,{preserveUnknownText:true})
 }

}
