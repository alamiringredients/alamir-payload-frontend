import '@/styles/pages/product-detail.css'
import {CatalogRoute, catalogMetadata} from '@/components/catalog/catalog-route'

export const generateMetadata = catalogMetadata
export default CatalogRoute

import {getCatalogIdentities} from '@/lib/api/public'
export async function generateStaticParams(){
  const {categories,products}=await getCatalogIdentities()
  const categoriesById=new Map(categories.map(category=>[category.id,category]))
  return products.flatMap(product=>{const category=categoriesById.get(product.category_id);return category?[{category:category.slug,product:product.slug}]:[]})
}
