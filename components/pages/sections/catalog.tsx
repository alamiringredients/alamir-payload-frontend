import type {Document} from '@/lib/payload/types'
import {getCatalogPayload} from '@/lib/api/public'
import {CatalogIndexSection} from '@/components/catalog/catalog-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,definition,settings,source}:SectionArgs){
 if(definition.pageSlug!=='products')return null
 const data=await getCatalogPayload(locale,'products')
 return <CatalogIndexSection id={block.id} mediaRefs={source.mediaRefs as Map<number,Document>|undefined} content={block.content??{}} section={definition.name} context={{catalog:data.catalog,locale,certifications:data.certifications,certificationLabels:data.certificationLabels,settings}}/>
}
