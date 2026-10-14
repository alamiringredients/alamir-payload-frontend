import {CatalogCategories} from '@/components/catalog/catalog-content'
import type {CategoryCatalog} from '@/lib/catalog/types'
import type {SiteLocale} from '@/i18n/navigation'

export function ProductCollection({catalog,locale}: {catalog:CategoryCatalog;locale:SiteLocale}){return (<section className="collection" id="products">
  <div className="wrap">
    <div className="collection-head reveal">
      <div>
        <div className="kicker">Our products</div>
        <h2>Pure character. Precise results.</h2>
      </div>
      <p>A focused ingredient portfolio for sauces, beverages, dairy, bakery and prepared food applications, available in industrial aseptic formats.</p>
    </div>
    <div className="product-grid reveal"><CatalogCategories catalog={catalog} locale={locale} /></div>
  </div>
</section>
)}
