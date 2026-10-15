import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {CatalogCategories} from '@/components/catalog/catalog-content'
import type {CategoryCatalog} from '@/lib/catalog/types'

export function ProductCollection({catalog,locale,section}: SectionContentProps & {catalog:CategoryCatalog}){return (<section className="collection" id="products">
  <div className="wrap">
    <div className="collection-head reveal">
      <div>
        <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
        <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
      </div>
      <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
    </div>
    <div className="product-grid reveal"><CatalogCategories catalog={catalog} locale={locale} /></div>
  </div>
</section>
)}
