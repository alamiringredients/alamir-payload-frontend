import '@/styles/pages/product-category.css'
import '@/styles/pages/product-detail.css'
import {CatalogRoute, catalogMetadata} from '@/components/catalog/catalog-route'

export const generateMetadata = catalogMetadata
export default CatalogRoute

import {getCatalog} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'
export async function generateStaticParams({params}:{params:{locale:string}}){
  const catalog=await getCatalog(params.locale as SiteLocale,'search')
  return catalog.categories.map(({slug})=>({category:slug}))
}
