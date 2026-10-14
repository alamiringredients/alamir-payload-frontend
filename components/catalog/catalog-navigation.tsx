import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'
import {categoryPath, productHeroImage, productPath, type NavigationCatalog} from '@/lib/catalog/types'
import type {SiteLocale} from '@/i18n/navigation'
export function CatalogNavigation({catalog,locale,mobile=false}:{catalog:NavigationCatalog;locale:SiteLocale;mobile?:boolean}) {
  return <>{catalog.categories.map((category) => {
    const products = catalog.products.filter((product) => product.category_id === category.id)
    const href = categoryPath(category,catalog.products)
    if (mobile) return <SmartLink key={category.id} href={href}>{category.content.name[locale]}</SmartLink>
    return <div className="nav-drop-row" key={category.id}>
      <SmartLink className="nav-drop-link" href={href}>
        <span className="nav-drop-thumb">{category.content.icon&&<ContentImage src={category.content.icon} alt="" loading="lazy" sizes="42px" />}</span>
        <span><b>{category.content.name[locale]}</b><i>{products.length} {catalog.settings.labels.products[locale].toLocaleLowerCase(locale)}</i></span>
        {products.length > 1 && <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>}
      </SmartLink>
      {products.length > 1 && <div className="nav-sub"><div className="nav-sub-card"><div className="nav-sub-head">{category.content.name[locale]}</div>{products.map((product) => {const image=productHeroImage(product);return <SmartLink key={product.id} href={productPath(product,category)}><span className="nav-drop-thumb">{image&&<ContentImage src={image} alt="" loading="lazy" sizes="36px" />}</span><span>{product.content.name[locale]}</span></SmartLink>})}</div></div>}
    </div>
  })}</>
}
