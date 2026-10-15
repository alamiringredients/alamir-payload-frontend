import {SectionCopy,type SectionContentProps} from './section-copy'
import {CatalogCategories} from '@/components/catalog/catalog-content'
import type {CategoryCatalog} from '@/lib/catalog/types'

export function ProductCollection({catalog,locale,section}: SectionContentProps & {catalog:CategoryCatalog}){return (<section className="collection" id="products">
  <div className="wrap">
    <div className="collection-head reveal">
      <div>
        <div className="kicker">{section.text.kicker?.[locale] ?? ''}</div>
        <h2><SectionCopy section={section} locale={locale} field="heading"/></h2>
      </div>
      <p><SectionCopy section={section} locale={locale} field="body"/></p>
    </div>
    <div className="product-grid reveal"><CatalogCategories catalog={catalog} locale={locale} /></div>
  </div>
</section>
)}
