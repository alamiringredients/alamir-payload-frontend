import {TwoColumns} from '@/components/layout/two-columns'
import type {CategoryCard} from '@/lib/catalog/types'
import {SectionCopy} from '@/components/editor/section-copy'
import {RecordLayout} from '@/components/pages/record-layout'
import {SiteIcon} from '@/components/site/site-icon'
import {CertificationCarousel} from '@/components/certifications/certification-panel'
import {InlineContent} from '@/components/editor/inline-content'
import {ContentImage} from '@/components/site/content-image'
import {PageHero} from '@/components/site/page-hero'
import {SmartLink} from '@/components/site/smart-link'
import {Breadcrumbs} from '@/components/site/breadcrumbs'
import {ActionGroup,CallToActionSection,ContentSection,SectionHeading,type Action} from '@/components/site/content-section'
import type {CertificationData,CertificationInterfaceLabels} from '@/lib/certifications/types'
import {categoryPath,productPath,type Catalog,type CategoryCatalog,type CatalogBlock,type CatalogPageContent,type Category,type Product} from '@/lib/catalog/types'
import type {WebsiteSettings} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
import {getImageProps} from 'next/image'
import {Fragment,type ReactNode,type CSSProperties} from 'react'
import {CatalogInteractions} from './catalog-interactions'
import galleryStyles from './catalog-gallery.module.css'
import categoryStyles from './category-cards.module.css'

type Context={catalog:Catalog;locale:SiteLocale;category?:Category;product?:Product;settings?:WebsiteSettings;certifications?:CertificationData;certificationLabels?:CertificationInterfaceLabels}

const text=(block:CatalogBlock,index:number,locale:SiteLocale)=>block.texts[index]?.values[locale]??''
const asset=(block:CatalogBlock,index:number)=>block.assets[index]?.value??''

function Heading({block,locale,start=0}:{block:CatalogBlock;locale:SiteLocale;start?:number}){
 return <SectionHeading kicker={text(block,start,locale)} title={<SectionCopy kind="heading" section={block} locale={locale}/>} description={<SectionCopy kind="body" section={block} locale={locale} index={start+3}/>}/>
}

function CatalogViewHeading({block,context}:{block:CatalogBlock;context:Context}){
 const {catalog,locale}=context
 const labels=catalog.settings.labels
 return <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1.06fr) minmax(0,.94fr)" gap="clamp(28px,4.6vw,72px)" align="end" className="view-head reveal"><div className="band-head"><div className="kicker">{text(block,0,locale)}</div><h2><SectionCopy kind="heading" section={block} locale={locale}/></h2><p className="lead view-copy on" data-view-panel="products"><SectionCopy kind="body" section={block} locale={locale}/></p><p className="lead view-copy" data-view-panel="categories">{block.richTexts?.[2]?.values[locale]&&<InlineContent document={block.richTexts[2].values[locale]}/>}</p></div><div className="view-switch" role="group" aria-label={labels.productView[locale]}><button className="vtab" type="button" data-view="products" aria-pressed="true">{labels.singleProducts[locale]} <span className="n">{String(catalog.products.length).padStart(2,'0')}</span></button><button className="vtab" type="button" data-view="categories" aria-pressed="false">{labels.categories[locale]} <span className="n">{String(catalog.categories.length).padStart(2,'0')}</span></button></div></TwoColumns>
}

function CatalogCallToAction({block,locale,actions}:{block:CatalogBlock;locale:SiteLocale;actions:Action[]}){
 return <CallToActionSection kicker={text(block,0,locale)} title={<SectionCopy kind="heading" section={block} locale={locale}/>} description={<SectionCopy kind="body" section={block} locale={locale} index={3}/>} actions={actions}/>
}

function CategoryArtwork({category}:{category:Pick<Category,'content'>|CategoryCard}){
 const images=category.content.artwork.assets.filter(item=>item.value)
 if(!category.content.artwork.enabled||!images.length)return null
 const columns=Math.min(images.length,6),spread=Math.min(58,28+columns*5),width=images.length===1?66:Math.max(30,63-columns*5),lifts=[2,28,8,36,4,22]
 return <figure className={`product-art multi category-artwork ${categoryStyles.art} ${categoryStyles.multi} ${categoryStyles.artwork}`} data-artwork-count={images.length} aria-hidden="true">{images.map((image,index)=>{
  const column=index%columns,row=Math.floor(index/columns),position=columns===1?0:column/(columns-1)*2-1,lift=(images.length===1?8:lifts[(index+images.length)%lifts.length])+row*40
  const style={'--art-x':`${50+position*spread/2}%`,'--art-y':`${lift}%`,'--art-width':`${width}%`,'--art-rotation':`${images.length===1?0:position*7+(index%2?2:-2)}deg`,'--art-hover-x':`${position*(6+columns)}px`,'--art-hover-y':`${Math.round((18-lift)*.5)}px`,'--art-z':String(row*columns+Math.round((1-Math.abs(position))*10)+index+1)} as CSSProperties
  return <ContentImage className={`category-artwork-layer ${categoryStyles.layer}`} src={image.value} alt="" loading="lazy" sizes={`(max-width: 700px) ${width}vw, (max-width: 1050px) ${width/2}vw, ${Math.ceil(330*width/100)}px`} style={style} key={image.id}/>
 })}</figure>
}

function ProductCards(context:Context){
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

function ProductRail(context:Context){
 const total=context.catalog.products.length-1
 return <div className="prail" data-prail><div className="prail-track">{ProductCards(context)}</div><div className="prail-ui"><div className="prail-count"><b>01</b> / <i>{String(total).padStart(2,'0')}</i></div><div className="prail-bar"><span/></div><div className="prail-nav" dir="ltr"><button type="button" data-prail-go="prev" aria-label={context.catalog.settings.labels.previousProducts[context.locale]}><SiteIcon name="arrow-left"/></button><button type="button" data-prail-go="next" aria-label={context.catalog.settings.labels.nextProducts[context.locale]}><SiteIcon name="arrow-right"/></button></div></div></div>
}

function CategoryCards({catalog,locale}:{catalog:CategoryCatalog;locale:SiteLocale}){return catalog.categories.map((category,index)=><article className={`product-card ${categoryStyles.card}`} id={category.slug} key={category.id}><span className={`product-card-no ${categoryStyles.number}`}>{String(index+1).padStart(2,'0')}</span><CategoryArtwork category={category}/><h3>{category.content.name[locale]}</h3><p>{category.content.description[locale]}</p><SmartLink className={`product-card-link ${categoryStyles.link}`} href={categoryPath(category,catalog.products)}>{catalog.settings.labels.exploreRange[locale]}</SmartLink></article>)}
export const CatalogCategories=CategoryCards

function Filters(context:Context){
 const {catalog,locale,category}=context,labels=catalog.settings.labels
 const products=catalog.products.filter(product=>!category||product.category_id===category.id)
 const applications=new Set(products.flatMap(product=>product.content.applications)),concentrations=new Set(products.flatMap(product=>product.content.concentrations))
 return <TwoColumns collapseAt={1050} as="div" columns="minmax(0,244px) minmax(0,1fr)" gap="clamp(40px,5vw,80px)" align="start" className="cat-shell"><aside className="cat-side" aria-label={labels.allProducts[locale]}>
  <div className="tab-rail" role="group" aria-label={labels.productCategory[locale]}>{!category&&<button className="tab" type="button" data-cat="all" aria-pressed="true">{labels.allProducts[locale]}</button>}{catalog.categories.map(item=>category?<SmartLink key={item.id} className="tab" href={categoryPath(item,catalog.products)} aria-current={item.id===category.id?'page':undefined}>{item.content.name[locale]}</SmartLink>:<button key={item.id} className="tab" type="button" data-cat={item.slug} aria-pressed="false">{item.content.name[locale]}</button>)}</div>
  <div className="cat-tools"><div className="cat-field cat-catsel"><select aria-label={labels.productCategory[locale]} data-cat-select defaultValue={category?categoryPath(category,catalog.products):''}><option value="">{labels.allProducts[locale]}</option>{catalog.categories.map(item=><option value={categoryPath(item,catalog.products)} key={item.id}>{item.content.name[locale]}</option>)}</select></div><div className="cat-field wide"><label className="sr-only" htmlFor="cat-q">{labels.allProducts[locale]}</label><input id="cat-q" type="search" data-cat-search autoComplete="off"/></div><div className="cat-field"><select aria-label={labels.allApplications[locale]} data-cat-app><option value="">{labels.allApplications[locale]}</option>{catalog.settings.applications.filter(item=>applications.has(item.id)).map(item=><option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></div><div className="cat-field"><select aria-label={labels.anyConcentration[locale]} data-cat-brix><option value="">{labels.anyConcentration[locale]}</option>{catalog.settings.concentrations.filter(item=>concentrations.has(item.id)).map(item=><option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></div><button className="cat-reset" type="button" hidden>{labels.clear[locale]}</button></div>
  <div className="cat-count" data-cat-count data-singular={labels.productSingular[locale]} data-plural={labels.products[locale].toLocaleLowerCase(locale)} aria-live="polite">{products.length} {labels.products[locale].toLocaleLowerCase(locale)}</div></aside>
  <div className="cat-main"><div className="pcards c2 cat-grid">{ProductCards(context)}</div><div className="cat-empty" hidden><strong>{category?text(category.content.page.blocks.find(block=>block.key==='section-1')!,11,locale):catalog.settings.emptyMessage[locale]}</strong></div></div>
 </TwoColumns>
}

function Gallery({block,locale,className='band'}:{block:CatalogBlock;locale:SiteLocale;className?:string}){
 const images=block.assets.filter(item=>item.value)
 const groups=[images.slice(0,6),images.slice(6)]
 return <section className={className} id="gallery"><div className="wrap"><SectionHeading kicker={text(block,0,locale)} title={<SectionCopy kind="heading" section={block} locale={locale}/>} description={text(block,4,locale)||undefined}/><div className={`catalog-gallery reveal ${galleryStyles.gallery}`} data-count={images.length}>{groups.map((group,groupIndex)=>group.length?<div className={`${groupIndex?'catalog-gallery-row':'catalog-gallery-lead'} ${groupIndex?galleryStyles.row:galleryStyles.lead}`} data-count={group.length} key={groupIndex}>{group.map((image,index)=>{const imageIndex=groupIndex*6+index;return <figure className={`catalog-gallery-photo shot ${galleryStyles.photo}`} key={image.id}><ContentImage src={image.value} alt={image.alt?.[locale]||text(block,imageIndex+5,locale)} width={1600} height={1200} sizes="(max-width: 700px) 100vw, 50vw" loading="lazy"/><figcaption>{text(block,imageIndex+5,locale)}</figcaption></figure>})}</div>:null)}</div></div></section>
}

function Hero({block,context}:{block:CatalogBlock;context:Context}){
 const {locale,category,product,catalog}=context,record=product??category
 const heading=block.richTexts?.find(item=>item.id==='hero-heading')?.values[locale]
 if(!record)return <PageHero image={asset(block,0)} imageAlt={text(block,0,locale)}><div className="kicker">{text(block,1,locale)}</div><h1><SectionCopy kind="heading" section={block} locale={locale}/></h1><p className="lead"><SectionCopy kind="body" section={block} locale={locale} index={4}/></p></PageHero>
 return <PageHero image={asset(block,0)} imageAlt={text(block,4,locale)}><Breadcrumbs label={catalog.settings.labels.breadcrumb[locale]} items={[{href:'/',label:catalog.settings.labels.home[locale]},{href:'/products',label:catalog.settings.labels.products[locale]},...(category?[{label:category.content.name[locale]}]:[])]}/><h1>{heading?<InlineContent document={heading}/>:<>{text(block,1,locale)} <em>{text(block,2,locale)}</em></>}</h1><p>{text(block,3,locale)}</p></PageHero>
}

function ProductGallery({product,locale,catalog}:{product:Product;locale:SiteLocale;catalog:Catalog}){
 const gallery=product.content.gallery.slice(0,3)
 if(!gallery.length)return null
 return <div className="pgal" data-pgal><div className="pgal-frame">{gallery.map((item,index)=>{
  if(index===0)return <figure className="pgal-slide is-on" data-cap={item.caption[locale]} key={item.image}><ContentImage src={item.image} alt={item.alt?.[locale]||item.caption[locale]} width={1600} height={1200} sizes="(max-width: 900px) 100vw, 50vw" loading="eager"/></figure>
  const {props}=getImageProps({src:item.image,alt:item.alt?.[locale]||item.caption[locale],width:1600,height:1200,sizes:'(max-width: 900px) 100vw, 50vw',loading:'lazy',fetchPriority:'low'})
  return <figure className="pgal-slide" data-cap={item.caption[locale]} data-pgal-image={JSON.stringify({src:props.src,srcSet:props.srcSet,sizes:props.sizes,alt:item.alt?.[locale]||item.caption[locale]})} key={item.image}/>
 })}</div><div className="pgal-ui"><p className="pgal-cap">{gallery[0].caption[locale]}</p><span className="pgal-count"><b>01</b> / {String(gallery.length).padStart(2,'0')}</span><div className="pgal-dots">{gallery.map((_,index)=><button type="button" className={index===0?'on':''} aria-current={index===0} aria-label={`${catalog.settings.labels.showPhoto[locale]} ${index+1}`} key={index}/>)}</div>{gallery.length>1&&<div className="pgal-nav" dir="ltr"><button type="button" data-pgal-go="prev" aria-label={catalog.settings.labels.previousPhoto[locale]}><SiteIcon name="arrow-left"/></button><button type="button" data-pgal-go="next" aria-label={catalog.settings.labels.nextPhoto[locale]}><SiteIcon name="arrow-right"/></button></div>}</div></div>
}

function Fold({block,locale}:{block:CatalogBlock;locale:SiteLocale}) {
 const values=block.items?.filter(item=>item.value[locale].trim())
 const specificationRows=block.kind==='specifications' && !values
  ? Array.from({length:Math.floor((block.texts.length-1)/2)},(_,index)=>({
      label:block.texts[index*2+1]?.values[locale],
      value:block.texts[index*2+2]?.values[locale],
    }))
  : []
 let content
 if(specificationRows.length) {
  content=<table className="spec"><tbody>{specificationRows.map((item,index)=><tr key={index}>
   <th>{item.label}</th><td>{item.value}</td>
  </tr>)}</tbody></table>
 } else if(block.kind==='applications') {
  content=<ul className="ticks">{block.texts.slice(1).map(item=><li key={item.id}>{item.values[locale]}</li>)}</ul>
 } else {
  content=values
   ? values.map((item,index)=><p key={index}>{item.document?<InlineContent document={item.document[locale]}/>:item.value[locale]}</p>)
   : block.texts.slice(1).map(item=><p key={item.id}>{item.values[locale]}</p>)
 }
 return <details className="fold">
  <summary><SectionCopy kind="heading" section={block} locale={locale}/></summary>
  <div className="fold-body">{content}</div>
 </details>
}

function ProductCatalogDialog({context}:{context:Context}){
 const {catalog,locale,category}=context,labels=catalog.settings.labels
 const block=(context.product??context.category)?.content.page.blocks.find(block=>block.key===(context.product?'section-5':'section-4'))
 if(!block || block.enabled===false)return null
 const copy={kicker:text(block,0,locale),close:labels.closeProductList[locale],search:labels.searchProducts[locale],clear:labels.clear[locale],empty:text(block,10,locale)}
 return <div className="pmodal" id="all-products" data-product-catalog data-open={category?.slug??''} role="dialog" aria-modal="true" aria-labelledby="product-catalog-title" aria-hidden="true">
  <div className="pmodal-head"><div className="wrap pmodal-head-in"><div><div className="kicker">{copy.kicker}</div><h2 id="product-catalog-title"><SectionCopy kind="heading" section={block} locale={locale}/></h2></div><button className="pmodal-x" type="button" data-product-catalog-close aria-label={copy.close}><SiteIcon name="close"/></button></div></div>
  <div className="pmodal-tools"><div className="wrap">
   <div className="tab-rail" role="group" aria-label={labels.productCategory[locale]}><button className="tab" type="button" data-cat="all" aria-pressed="true">{labels.allProducts[locale]}</button>{catalog.categories.map(item=><button className="tab" type="button" data-cat={item.slug} aria-pressed="false" key={item.id}>{item.content.name[locale]}</button>)}</div>
   <div className="cat-tools"><div className="cat-field cat-catsel"><select aria-label={labels.productCategory[locale]} data-cat-dropdown defaultValue={category?.slug??'all'}><option value="all">{labels.allProducts[locale]}</option>{catalog.categories.map(item=><option value={item.slug} key={item.id}>{item.content.name[locale]}</option>)}</select></div><div className="cat-field wide"><label className="sr-only" htmlFor="product-catalog-search">{copy.search}</label><input id="product-catalog-search" type="search" data-cat-search autoComplete="off"/></div><div className="cat-field"><select aria-label={labels.allApplications[locale]} data-cat-app defaultValue=""><option value="">{labels.allApplications[locale]}</option>{catalog.settings.applications.map(item=><option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></div><div className="cat-field"><select aria-label={labels.anyConcentration[locale]} data-cat-brix defaultValue=""><option value="">{labels.anyConcentration[locale]}</option>{catalog.settings.concentrations.map(item=><option value={item.id} key={item.id}>{item.label[locale]}</option>)}</select></div><button className="cat-reset" type="button" hidden>{copy.clear}</button></div>
   <div className="cat-count" data-cat-count data-singular={labels.productSingular[locale]} data-plural={labels.products[locale].toLocaleLowerCase(locale)} aria-live="polite"/>
  </div></div>
  <div className="pmodal-body"><div className="wrap"><div className="pcards c3 cat-grid">{ProductCards({...context,category:undefined})}</div><div className="cat-empty" hidden><strong>{copy.empty}</strong></div></div></div>
 </div>
}

function ProductDetailSections({content,context}:{content:CatalogPageContent;context:Context}){
 const {product,category,locale,catalog,settings}=context
 if(!product||!category)return {}
 const sections=content.blocks.filter(block=>block.key.startsWith('section-')),folds=content.blocks.filter(block=>block.key.startsWith('fold-')),details=sections[1]
 const concentrationOptions=new Map(catalog.settings.concentrations.map(item=>[item.id,item.label[locale]]))
 const applicationOptions=new Map(catalog.settings.applications.map(item=>[item.id,item]))
 const concentrationValues=product.content.concentrations.map(id=>concentrationOptions.get(id)).filter(Boolean).join(' · ')
 const applicationValues=product.content.applications.flatMap(id=>applicationOptions.has(id)?[applicationOptions.get(id)!]:[])
 const facts=folds.find(block=>block.kind==='specifications')
 const siblings=catalog.products.filter(item=>item.category_id===category.id),next=siblings.length>1?siblings[(siblings.findIndex(item=>item.id===product.id)+1)%siblings.length]:undefined
 const nextHref=next?productPath(next,category):'/products'
 return {hero:sections[0]&&<Hero block={sections[0]} context={context}/>,overview:<ContentSection id="detail">{details&&<SectionHeading kicker={text(details,0,locale)} title={<SectionCopy kind="heading" section={details} locale={locale}/>}/>}<TwoColumns collapseAt={1050} as="div" columns="minmax(0,1.22fr) minmax(0,.78fr)" gap="clamp(40px,5vw,80px)" align="start" className="pdp panelled" mediaChild="first"><div className="reveal"><ProductGallery product={product} locale={locale} catalog={catalog}/><div className="folds">{folds.filter(block=>block.enabled).map((block,index)=><Fragment key={block.key}>{index===2&&applicationValues.length>0&&<details className="fold"><summary>{catalog.settings.labels.applications[locale]}</summary><div className="fold-body"><ul className="ticks">{applicationValues.map(item=><li key={item.id}>{item.label[locale]}</li>)}</ul></div></details>}<Fold block={block} locale={locale}/></Fragment>)}</div></div><aside className="pdp-rail reveal"><div className="k">{catalog.settings.labels.atAGlance[locale]}</div><h3>{product.content.name[locale]}</h3>{facts&&<table className="pdp-facts"><tbody>{concentrationValues&&<tr><th>{catalog.settings.labels.concentration[locale]}</th><td>{concentrationValues}</td></tr>}{Array.from({length:Math.floor((facts.texts.length-1)/2)},(_,index)=><tr key={index}><th>{text(facts,index*2+1,locale)}</th><td>{text(facts,index*2+2,locale)}</td></tr>)}</tbody></table>}<div className="pdp-actions"><SmartLink className="btn" href="/contact" data-quote>{catalog.settings.labels.requestQuote[locale]}</SmartLink>{product.content.tds[locale]&&<a className="btn ghost" href={product.content.tds[locale]}>{catalog.settings.labels.downloadTds[locale]}</a>}{settings?.companyProfile[locale]&&<a className="btn ghost" href={settings.companyProfile[locale]}>{catalog.settings.labels.companyProfile[locale]}</a>}</div></aside></TwoColumns></ContentSection>,gallery:sections[2]&&<Gallery block={sections[2]} locale={locale} className="band tint"/>,related:sections[3]&&<ContentSection><Heading block={sections[3]} locale={locale}/><ProductRail {...context}/></ContentSection>,enquiry:sections[4]&&<CatalogCallToAction block={sections[4]} locale={locale} actions={[{href:'/contact',label:text(sections[4],4,locale)},{href:nextHref,label:next?.content.name[locale]??catalog.settings.labels.browseProducts[locale],variant:'secondary'},{href:'#all-products',label:text(sections[4],6,locale),variant:'secondary',dialog:'all-products'}]}/>}
}

export function CatalogIndexSections({content,context,section}:{content:CatalogPageContent;context:Context;section?:string}){
 const {locale,category,certifications,certificationLabels}=context,sections=content.blocks.filter(block=>block.key.startsWith('section-'))
 const renderers:Record<string,()=>ReactNode>={hero:()=>(sections[0]&&<Hero block={sections[0]} context={context}/>),
range:()=>(<ContentSection id="collection" theme={category?'tint':'plain'}>{sections[1]&&(category?<Heading block={sections[1]} locale={locale}/>:<CatalogViewHeading block={sections[1]} context={context}/>)}{category?<div id="catalogue" data-open={category.slug}>{Filters(context)}</div>:<><div className="view on" id="catalogue" data-view-panel="products">{Filters(context)}</div><div className="view" id="view-categories" data-view-panel="categories"><div className="product-grid reveal">{CategoryCards(context)}</div></div></>}</ContentSection>),
gallery:()=>(sections[2]&&(category?<Gallery block={sections[2]} locale={locale}/>:<ContentSection theme="deep"><Heading block={sections[2]} locale={locale}/>{certifications&&certificationLabels&&<CertificationCarousel data={certifications} locale={locale} labels={certificationLabels}/>}<ActionGroup actions={[{href:'/downloads',label:certificationLabels?.downloads??''},{href:'/contact',label:context.catalog.settings.labels.requestQuote[locale],variant:'secondary'}]}/></ContentSection>)),
traceability:()=>(category&&sections[3]&&<CatalogCallToAction block={sections[3]} locale={locale} actions={[{href:'/contact',label:text(sections[3],4,locale)},{href:'/downloads',label:text(sections[3],5,locale),variant:'secondary'},{href:'#all-products',label:text(sections[3],6,locale),variant:'secondary',dialog:'all-products'}]}/>)}
 return section?renderers[section]?.()??null:Object.entries(renderers).map(([key,render])=><Fragment key={key}>{render()}</Fragment>)
}

export async function CatalogPageBody({content,...context}:Context&{content:CatalogPageContent}){
 const record=context.product??context.category
 return <>{record?<RecordLayout<Product|Category> collection={context.product?'products':'categories'} slug={record.slug} recordId={record.id} locale={context.locale} renderSection={(selected,section)=>{
  const selectedContext={...context,...(context.product?{product:selected as Product}:{category:selected as Category})}
  if(context.product)return ProductDetailSections({content:selected.content.page,context:selectedContext})[section as keyof ReturnType<typeof ProductDetailSections>]
  return CatalogIndexSections({content:selected.content.page,context:selectedContext,section})
 }}/>:<main id="main" data-no-translate>{CatalogIndexSections({content,context})}</main>}{record&&<ProductCatalogDialog context={context}/>}<CatalogInteractions/></>
}
