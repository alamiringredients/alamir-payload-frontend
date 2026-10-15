import type {Document} from '@/lib/payload/types'
import {getCatalog,getCertificationsPayload} from '@/lib/api/public'
import {catalogInterfaceLabels} from '@/lib/payload/client'
import {CatalogIndexSection} from '@/components/catalog/catalog-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,definition,source}:SectionArgs){
 if(definition.pageSlug!=='products')return null
 const props={id:block.id,mediaRefs:source.mediaRefs as Map<number,Document>|undefined,content:block.content??{},locale}
 if(definition.name==='hero')return <CatalogIndexSection {...props} section="hero"/>
 if(definition.name==='collection')return <CatalogIndexSection {...props} section="collection" catalog={await getCatalog('products')}/>
 if(definition.name==='deep'){
  const [certificates,labels]=await Promise.all([getCertificationsPayload(locale),catalogInterfaceLabels()])
  return <CatalogIndexSection {...props} section="deep" certifications={certificates.certifications} certificationLabels={certificates.certificationLabels} requestQuoteLabel={labels.requestQuote[locale]}/>
 }
 return null
}
