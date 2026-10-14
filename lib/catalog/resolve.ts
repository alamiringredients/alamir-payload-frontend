import type {Catalog} from './types'
export function resolveCatalogPage(catalog:Catalog, path:string) {
  if (path === 'products') return {content:catalog.settings}
  const parts = path.split('/')
  if (parts[0] !== 'products' || parts.length > 3) return null
  const category = catalog.categories.find((category) => category.slug === parts[1])
  if (!category) return null
  const products = catalog.products.filter((product) => product.category_id === category.id)
  const product = parts[2] ? products.find((product) => product.slug === parts[2]) : undefined
  if (parts[2] && !product) return null
  return product ? {category,product,content:product.content.page} : {category,content:category.content.page}
}
