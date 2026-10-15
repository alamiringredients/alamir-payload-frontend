import type {LocalizedDocument,HomeSectionContent, LocalizedValue} from '@/lib/cms/types'

// Templates describe the existing design. Editors change content, never markup.
export type CatalogItem = {label?: LocalizedValue; value: LocalizedValue;document?:LocalizedDocument}
export type CatalogBlock = HomeSectionContent & {kind?:'specifications'|'applications'|'prose';items?: CatalogItem[]}
export type ProductGalleryItem = {image: string; caption: LocalizedValue;alt?:LocalizedValue}
export type CatalogPageContent = {blocks: CatalogBlock[]}
export type CatalogSeo = {title: LocalizedValue; description: LocalizedValue}
export type CategoryPageCopy = {
  heroHeading?:LocalizedDocument
  introHeading?:LocalizedDocument
  heroTitle: LocalizedValue
  heroAccent: LocalizedValue
  heroDescription: LocalizedValue
  introTitle: LocalizedValue
  introAccent: LocalizedValue
  introDescription: LocalizedValue
}
export type CatalogCard = {name: LocalizedValue; description: LocalizedValue; seo: CatalogSeo; artwork: CatalogBlock}
export type CategoryAppearance = 'standard' | 'muted'
export type CategoryContent = CatalogCard & {appearance:CategoryAppearance;page: CatalogPageContent; pageCopy:CategoryPageCopy; icon: string; gallery: ProductGalleryItem[]}
export type ProductContent = CatalogCard & {
  page: CatalogPageContent
  applications: string[]
  concentrations: string[]
  gallery: ProductGalleryItem[]
  tds: LocalizedValue
}
export type Category = {id: number; slug: string; published: boolean; sort_order: number; content: CategoryContent}
export type Product = {id: number; category_id: number; slug: string; published: boolean; sort_order: number; content: ProductContent}
export type FilterOption = {id: string; label: LocalizedValue}
export type CatalogLabels = {
  atAGlance:LocalizedValue
  browseProducts:LocalizedValue
  clear:LocalizedValue
  searchProducts:LocalizedValue
  searchPlaceholder:LocalizedValue
  breadcrumb:LocalizedValue
  productView:LocalizedValue
  singleProducts:LocalizedValue
  categories:LocalizedValue
  previousProducts:LocalizedValue
  nextProducts:LocalizedValue
  concentration:LocalizedValue
  applications:LocalizedValue
  closeProductList:LocalizedValue
  viewProduct: LocalizedValue
  exploreRange: LocalizedValue
  allProducts: LocalizedValue
  allApplications: LocalizedValue
  anyConcentration: LocalizedValue
  home: LocalizedValue
  products: LocalizedValue
  productSingular: LocalizedValue
  productCategory: LocalizedValue
  requestQuote: LocalizedValue
  downloadTds: LocalizedValue
  companyProfile: LocalizedValue
  previousPhoto: LocalizedValue
  nextPhoto: LocalizedValue
  showPhoto: LocalizedValue
}
export type CatalogSettings = CatalogPageContent & {emptyMessage:LocalizedValue;seo: {title:LocalizedValue; description:LocalizedValue}; labels:CatalogLabels; applications: FilterOption[]; concentrations: FilterOption[]}
export type Catalog = {categories: Category[]; products: Product[]; settings: CatalogSettings}
export type NavigationCatalog = {
  categories: (Pick<Category,'id'|'slug'> & {content:Pick<CategoryContent,'name'|'icon'>})[]
  products: (Pick<Product,'id'|'slug'|'category_id'> & {content:Pick<ProductContent,'name'|'gallery'>})[]
  settings: {labels:Pick<CatalogLabels,'products'>}
}
export function productPath(product: Pick<Product,'slug'>, category: Pick<Category,'slug'>) {
  return `/products/${category.slug}/${product.slug}`
}
export function categoryPath(category: Pick<Category,'id'|'slug'>, products: Pick<Product,'category_id'|'slug'>[]) {
  const children = products.filter((product) => product.category_id === category.id)
  // Retain the established category URL, resolving its body directly for a single product.
  return children.length === 1 ? productPath(children[0], category) : `/products/${category.slug}`
}
export function productHeroImage(product: {content:Pick<ProductContent,'gallery'>}) {
  return product.content.gallery?.[0]?.image ?? ''
}
export function categoryHeroImage(category: Category) {
  return category.content.page.blocks.find((block) => block.key === 'section-0')?.assets[0]?.value ?? ''
}

export type CategoryCard=Pick<Category,'id'|'slug'> & {content:Pick<CategoryContent,'name'|'description'|'icon'|'artwork'>}
export type CategoryCatalog = {categories:CategoryCard[];products:Pick<Product,'category_id'|'slug'>[];settings:{labels:Pick<CatalogLabels,'exploreRange'>}}
