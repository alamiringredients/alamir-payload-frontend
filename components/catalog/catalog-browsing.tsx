import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'
import {SiteIcon} from '@/components/site/site-icon'
import {SmartLink} from '@/components/site/smart-link'
import {categoryPath,productPath,type Catalog,type Category,type Product} from '@/lib/catalog/types'
import type {SiteLocale} from '@/i18n/navigation'
import {CatalogBrowsingInteractions} from './catalog-browsing-interactions'

type Context = {catalog:Catalog;locale:SiteLocale;category?:Category;product?:Product}
type BrowserProps = Context & {emptyMessage:string}

export function ProductCards(context:Context){
 const categoriesByID=new Map(context.catalog.categories.map(category=>[category.id,category]))
 const products=context.catalog.products.filter(product=>context.product?product.id!==context.product.id:!context.category||product.category_id===context.category.id)
 return products.map(product=>{
  const category=categoriesByID.get(product.category_id)
  if(!category)return null
  const name=product.content.name[context.locale],images=product.content.artwork.assets.filter(item=>item.value)
  return <article key={product.id} className="pcard pcard--art" data-cat={category.slug} data-app={product.content.applications.join(' ')} data-brix={product.content.concentrations.join(' ')} data-search={`${name} ${product.content.description[context.locale]} ${category.content.name[context.locale]}`.toLocaleLowerCase(context.locale)}>
   <SmartLink className="cover" href={productPath(product,category)} aria-label={name}/>
   <figure className={`pcard-art${product.sort_order%2===0?' flip':''}`} aria-hidden="true">{images.map((image,index)=><ContentImage className={index?'pa-fruit':'pa-plate'} src={image.value} alt="" loading="lazy" key={image.id}/>)}</figure>
   <div className="pcard-body"><span className="pcard-cat">{category.content.name[context.locale]}</span><h3>{name}</h3>{product.content.description[context.locale]&&<p>{product.content.description[context.locale]}</p>}<span className="pcard-go">{context.catalog.settings.labels.viewProduct[context.locale]} <span className="arrow"><SiteIcon name="arrow-right"/></span></span></div>
  </article>
 })
}

function Controls({catalog,locale,category,dialog=false}:{catalog:Catalog;locale:SiteLocale;category?:Category;dialog?:boolean}) {
 const labels=catalog.settings.labels
 const products=catalog.products.filter(product=>!category||product.category_id===category.id)
 const applications=new Set(products.flatMap(product=>product.content.applications)),concentrations=new Set(products.flatMap(product=>product.content.concentrations))
 const navigating=!dialog&&!!category,searchId=dialog?'product-catalog-search':'cat-q'
 const searchLabel=dialog?labels.searchProducts[locale]:labels.allProducts[locale]
 return <>
  <div className="tab-rail" role="group" aria-label={labels.productCategory[locale]}>{!navigating&&<button className="tab" type="button" data-cat="all" aria-pressed="true">{labels.allProducts[locale]}</button>}{catalog.categories.map(item=>navigating?<SmartLink key={item.id} className="tab" href={categoryPath(item,catalog.products)} aria-current={item.id===category.id?'page':undefined}>{item.content.name[locale]}</SmartLink>:<button key={item.id} className="tab" type="button" data-cat={item.slug} aria-pressed="false">{item.content.name[locale]}</button>)}</div>
  <div className="cat-tools">
   <div className="cat-field cat-catsel"><select aria-label={labels.productCategory[locale]} data-cat-select={dialog?undefined:true} data-cat-dropdown={dialog?true:undefined} defaultValue={dialog?category?.slug??'all':category?categoryPath(category,catalog.products):''}><option value={dialog?'all':''}>{labels.allProducts[locale]}</option>{catalog.categories.map(item=><option value={dialog?item.slug:categoryPath(item,catalog.products)} key={item.id}>{item.content.name[locale]}</option>)}</select></div>
   <div className="cat-field wide"><label className="sr-only" htmlFor={searchId}>{searchLabel}</label><input id={searchId} type="search" data-cat-search autoComplete="off"/></div>
   <div className="cat-field"><select aria-label={labels.allApplications[locale]} data-cat-app defaultValue=""><option value="">{labels.allApplications[locale]}</option>{catalog.settings.applications.filter(item=>dialog||applications.has(item.id)).map(item=><option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></div>
   <div className="cat-field"><select aria-label={labels.anyConcentration[locale]} data-cat-brix defaultValue=""><option value="">{labels.anyConcentration[locale]}</option>{catalog.settings.concentrations.filter(item=>dialog||concentrations.has(item.id)).map(item=><option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></div>
   <button className="cat-reset" type="button" hidden>{labels.clear[locale]}</button>
  </div>
  <div className="cat-count" data-cat-count data-singular={labels.productSingular[locale]} data-plural={labels.products[locale].toLocaleLowerCase(locale)} aria-live="polite">{!dialog&&`${products.length} ${labels.products[locale].toLocaleLowerCase(locale)}`}</div>
 </>
}

function Results({emptyMessage,columns,...context}:BrowserProps&{columns:2|3}) {
 return <><div className={`pcards c${columns} cat-grid`}>{ProductCards(context)}</div><div className="cat-empty" hidden><strong>{emptyMessage}</strong></div></>
}

export function CatalogPageBrowser({emptyMessage,...context}:BrowserProps) {
 const {category,catalog,locale}=context
 return <div id="catalogue" className={category?undefined:'view on'} data-view-panel={category?undefined:'products'}>
  <TwoColumns collapseAt={1050} as="div" columns="minmax(0,244px) minmax(0,1fr)" gap="clamp(40px,5vw,80px)" align="start" className="cat-shell">
   <aside className="cat-side" aria-label={catalog.settings.labels.allProducts[locale]}><Controls {...context}/></aside>
   <div className="cat-main"><Results {...context} emptyMessage={emptyMessage} columns={2}/></div>
  </TwoColumns>
  <CatalogBrowsingInteractions useHash/>
 </div>
}

export function CatalogDialogBrowser({emptyMessage,...context}:BrowserProps) {
 return <>
  <div className="pmodal-tools"><div className="wrap"><Controls {...context} dialog/></div></div>
  <div className="pmodal-body"><div className="wrap"><Results {...context} category={undefined} emptyMessage={emptyMessage} columns={3}/></div></div>
  <CatalogBrowsingInteractions initialCategory={context.category?.slug}/>
 </>
}
