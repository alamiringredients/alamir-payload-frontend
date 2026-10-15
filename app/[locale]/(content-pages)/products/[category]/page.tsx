import '@/styles/pages/product-category.css'
import '@/styles/pages/product-detail.css'
import {CatalogRoute, catalogMetadata} from '@/components/catalog/catalog-route'

export const generateMetadata = catalogMetadata
export default CatalogRoute

import {getCatalogIdentities} from '@/lib/api/public'
export async function generateStaticParams(){
  return (await getCatalogIdentities()).categories.map(({slug})=>({category:slug}))
}
