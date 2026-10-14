import '@/styles/pages/product-detail.css'
import {CatalogRoute, catalogMetadata} from '@/components/catalog/catalog-route'

export const generateMetadata = catalogMetadata
export default CatalogRoute

import {getCatalog} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'
export async function generateStaticParams({params}:{params:{locale:string}}){
  const catalog=await getCatalog(false,params.locale as SiteLocale,'search')
  return catalog.products.flatMap(product=>{const category=catalog.categories.find(item=>item.id===product.category_id);return category?[{category:category.slug,product:product.slug}]:[]})
}
