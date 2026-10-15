import type {Document} from '@/lib/payload/types'
import {TwoColumns} from '@/components/layout/two-columns'
import type {CategoryCard,Catalog,CategoryCatalog,CatalogSection,CatalogFold,Category,Product} from '@/lib/catalog/types'
import {categoryPath,productPath} from '@/lib/catalog/types'
import {presentCatalogPageSection} from '@/lib/catalog/presentation'
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
import type {WebsiteSettings} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
import {getImageProps} from 'next/image'
import {Fragment,type CSSProperties} from 'react'
import {textContent} from '@/lib/editor/document'
import {CatalogInteractions} from './catalog-interactions'
import {CatalogPageBrowser,CatalogDialogBrowser,ProductCards} from './catalog-browsing'
import galleryStyles from './catalog-gallery.module.css'
import categoryStyles from './category-cards.module.css'

type Context={catalog:Catalog;locale:SiteLocale;category?:Category;product?:Product;settings?:WebsiteSettings;certifications?:CertificationData;certificationLabels?:CertificationInterfaceLabels}
function Heading({copy,locale}:{copy:CatalogSection;locale:SiteLocale}) {
 return <SectionHeading kicker={copy.eyebrow[locale]} title={<InlineContent document={copy.heading[locale]}/>} description={copy.description[locale]||undefined}/>
}
function CallToAction({copy,locale,actions}:{copy:CatalogSection;locale:SiteLocale;actions:Action[]}) {
 return <CallToActionSection kicker={copy.eyebrow[locale]} title={<InlineContent document={copy.heading[locale]}/>} description={copy.description[locale]} actions={actions}/>
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

function ProductRail(context:Context){
 const cards=ProductCards(context).filter(Boolean),total=cards.length
 return <div className="prail" data-prail><div className="prail-track">{cards}</div><div className="prail-ui"><div className="prail-count" dir="ltr"><b>{total?'01':'00'}</b> / <i>{String(total).padStart(2,'0')}</i></div><div className="prail-bar"><span/></div><div className="prail-nav"><button type="button" data-prail-go="prev" disabled aria-label={context.catalog.settings.labels.previousProducts[context.locale]}><SiteIcon name={context.locale==='ar'?'arrow-right':'arrow-left'}/></button><button type="button" data-prail-go="next" aria-label={context.catalog.settings.labels.nextProducts[context.locale]}><SiteIcon name={context.locale==='ar'?'arrow-left':'arrow-right'}/></button></div></div><CatalogInteractions kind="rail"/></div>
}
function CategoryCards({catalog,locale}:{catalog:CategoryCatalog;locale:SiteLocale}){return catalog.categories.map((category,index)=><article className={`product-card ${categoryStyles.card}`} id={category.slug} key={category.id}><span className={`product-card-no ${categoryStyles.number}`}>{String(index+1).padStart(2,'0')}</span><CategoryArtwork category={category}/><h3>{category.content.name[locale]}</h3><p>{category.content.description[locale]}</p><SmartLink className={`product-card-link ${categoryStyles.link}`} href={categoryPath(category,catalog.products)}>{catalog.settings.labels.exploreRange[locale]}</SmartLink></article>)}
export const CatalogCategories=CategoryCards

function Gallery({copy,context,id,className='band'}:{copy:CatalogSection;context:Context;id:string;className?:string}){
 const {locale}=context,images=(context.product??context.category)!.content.gallery.filter(item=>item.image)
 const groups=[images.slice(0,6),images.slice(6)]
 return <section id={`gallery-${id}`} className={`${className} catalog-gallery-section`}><div className="wrap"><Heading copy={copy} locale={locale}/><div className={`catalog-gallery reveal ${galleryStyles.gallery}`} data-count={images.length}>{groups.map((group,groupIndex)=>group.length?<div className={`${groupIndex?'catalog-gallery-row':'catalog-gallery-lead'} ${groupIndex?galleryStyles.row:galleryStyles.lead}`} data-count={group.length} key={groupIndex}>{group.map((image,index)=><figure className={`catalog-gallery-photo shot ${galleryStyles.photo}`} key={`${image.image}-${index}`}><ContentImage src={image.image} alt={image.alt?.[locale]||image.caption[locale]} width={1600} height={1200} sizes="(max-width: 700px) 100vw, 50vw" loading="lazy"/><figcaption>{image.caption[locale]}</figcaption></figure>)}</div>:null)}</div></div></section>
}
function Hero({copy,context}:{copy:CatalogSection;context:Context}){
 const {locale,category,catalog}=context
 return <PageHero image={copy.image} imageAlt={copy.imageAlt[locale]}><Breadcrumbs label={catalog.settings.labels.breadcrumb[locale]} items={[{href:'/',label:catalog.settings.labels.home[locale]},{href:'/products',label:catalog.settings.labels.products[locale]},...(category?[{label:category.content.name[locale]}]:[])]}/><h1><InlineContent document={copy.heading[locale]}/></h1><p>{copy.description[locale]}</p></PageHero>
}
function ProductGallery({product,locale,catalog}:{product:Product;locale:SiteLocale;catalog:Catalog}){
 const gallery=product.content.gallery.slice(0,3)
 if(!gallery.length)return null
 return <div className="pgal" data-pgal><div className="pgal-frame">{gallery.map((item,index)=>{
  if(index===0)return <figure className="pgal-slide is-on" data-cap={item.caption[locale]} key={item.image}><ContentImage src={item.image} alt={item.alt?.[locale]||item.caption[locale]} width={1600} height={1200} sizes="(max-width: 900px) 100vw, 50vw" loading="eager"/></figure>
  const {props}=getImageProps({src:item.image,alt:item.alt?.[locale]||item.caption[locale],width:1600,height:1200,sizes:'(max-width: 900px) 100vw, 50vw',loading:'lazy',fetchPriority:'low'})
  return <figure className="pgal-slide" data-cap={item.caption[locale]} data-pgal-image={JSON.stringify({src:props.src,srcSet:props.srcSet,sizes:props.sizes,alt:item.alt?.[locale]||item.caption[locale]})} key={item.image}/>
 })}</div><div className="pgal-ui"><p className="pgal-cap">{gallery[0].caption[locale]}</p><span className="pgal-count"><b>01</b> / {String(gallery.length).padStart(2,'0')}</span><div className="pgal-dots">{gallery.map((_,index)=><button type="button" className={index===0?'on':''} aria-current={index===0} aria-label={`${catalog.settings.labels.showPhoto[locale]} ${index+1}`} key={index}/>)}</div>{gallery.length>1&&<div className="pgal-nav" dir="ltr"><button type="button" data-pgal-go="prev" aria-label={catalog.settings.labels.previousPhoto[locale]}><SiteIcon name="arrow-left"/></button><button type="button" data-pgal-go="next" aria-label={catalog.settings.labels.nextPhoto[locale]}><SiteIcon name="arrow-right"/></button></div>}</div><CatalogInteractions kind="gallery"/></div>
}

function Fold({copy,locale}:{copy:CatalogFold;locale:SiteLocale}) {
 if(!textContent(copy.heading[locale]) || (!copy.pairs.length && !copy.items.some(item=>textContent(item[locale]).trim())))return null
 return <details className="fold"><summary><InlineContent document={copy.heading[locale]}/></summary><div className="fold-body">{copy.pairs.length?<table className="spec"><tbody>{copy.pairs.map((item,index)=><tr key={index}><th>{item.label[locale]}</th><td>{item.value[locale]}</td></tr>)}</tbody></table>:copy.items.map((item,index)=><p key={index}><InlineContent document={item[locale]}/></p>)}</div></details>
}
function ProductCatalogDialog({context,id}:{context:Context;id:string}){
 const {catalog,locale}=context,copy=(context.product??context.category)!.content.page?.allProducts
 if(!copy)return null
 return <div className="pmodal" id={id} data-product-catalog role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-hidden="true"><div className="pmodal-head"><div className="wrap pmodal-head-in"><div><div className="kicker">{copy.eyebrow[locale]}</div><h2 id={`${id}-title`}><InlineContent document={copy.heading[locale]}/></h2></div><button className="pmodal-x" type="button" data-product-catalog-close aria-label={catalog.settings.labels.closeProductList[locale]}><SiteIcon name="close"/></button></div></div><CatalogDialogBrowser {...context} id={id} emptyMessage={copy.emptyMessage[locale]}/><CatalogInteractions kind="dialog"/></div>
}
function ProductOverview({id,...context}:Context&{id:string}){
 const {product,category,locale,catalog,settings}=context
 if(!product||!category)return null
 const page=product.content.page
 if(!page)return null
 const applications=new Map(catalog.settings.applications.map(item=>[item.id,item]))
 const applicationValues=product.content.applications.flatMap(id=>applications.has(id)?[applications.get(id)!]:[])
 return <ContentSection id={`detail-${id}`} className="catalog-detail-section"><Heading copy={page.overview} locale={locale}/><TwoColumns collapseAt={1050} as="div" columns="minmax(0,1.22fr) minmax(0,.78fr)" gap="clamp(40px,5vw,80px)" align="start" className="pdp panelled" mediaChild="first"><div className="reveal"><ProductGallery product={product} locale={locale} catalog={catalog}/><div className="folds">{page.folds.map((copy,index)=><Fragment key={index}>{index===2&&applicationValues.length>0&&<details className="fold"><summary>{catalog.settings.labels.applications[locale]}</summary><div className="fold-body"><ul className="ticks">{applicationValues.map(item=><li key={item.id}>{item.label[locale]}</li>)}</ul></div></details>}<Fold copy={copy} locale={locale}/></Fragment>)}</div></div><aside className="pdp-rail reveal"><div className="k">{catalog.settings.labels.atAGlance[locale]}</div><h3>{product.content.name[locale]}</h3><table className="pdp-facts"><tbody>{page.specifications.pairs.map((item,index)=><tr key={index}><th>{item.label[locale]}</th><td>{item.value[locale]}</td></tr>)}</tbody></table><div className="pdp-actions"><SmartLink className="btn" href="/contact" data-quote>{catalog.settings.labels.requestQuote[locale]}</SmartLink>{product.content.tds[locale]&&<a className="btn ghost" href={product.content.tds[locale]}>{catalog.settings.labels.downloadTds[locale]}</a>}{settings?.companyProfile[locale]&&<a className="btn ghost" href={settings.companyProfile[locale]}>{catalog.settings.labels.companyProfile[locale]}</a>}</div></aside></TwoColumns></ContentSection>
}
function RecordSection({context,section,id}:{context:Context;section:string;id:string}) {
 const {product,category,catalog,locale}=context,record=product??category
 if(!record)return null
 const page=record.content.page
 if(!page)return null
 switch(section){
  case 'hero':return <Hero copy={page.hero} context={context}/>
  case 'overview':return <ProductOverview {...context} id={id}/>
  case 'range':return <ContentSection id={`collection-${id}`} theme="tint"><Heading copy={page.range} locale={locale}/><CatalogPageBrowser {...context} id={`catalogue-${id}`} emptyMessage={page.range.emptyMessage[locale]}/></ContentSection>
  case 'gallery':return <Gallery copy={page.gallery} context={context} id={id} className={product?'band tint':'band'}/>
  case 'related':return <ContentSection><Heading copy={page.related} locale={locale}/><ProductRail {...context}/></ContentSection>
  case 'enquiry':
  case 'traceability':{
   const siblings=product?catalog.products.filter(item=>item.category_id===category?.id):[]
   const next=product&&siblings.length>1?siblings[(siblings.findIndex(item=>item.id===product.id)+1)%siblings.length]:undefined
   const dialog=`all-products-${id}`
   return <><CallToAction copy={page.enquiry} locale={locale} actions={[{href:'/contact',label:catalog.settings.labels.requestQuote[locale]},{href:product?(next&&category?productPath(next,category):'/products'):'/downloads',label:product?(next?.content.name[locale]??catalog.settings.labels.browseProducts[locale]):page.downloadSpecifications[locale],variant:'secondary'},{href:`#${dialog}`,label:catalog.settings.labels.browseProducts[locale],variant:'secondary',dialog}]}/><ProductCatalogDialog context={context} id={dialog}/></>
  }
  default:return null
 }
}
export function CatalogIndexSection({content,section,context,id,mediaRefs}:{content:Record<string,unknown>;section:string;context:Context;id:string;mediaRefs?:Map<number,Document>}){
 const {locale,catalog,certifications,certificationLabels}=context,copy=presentCatalogPageSection(content,mediaRefs)
 if(section==='hero')return <PageHero image={copy.image}><div className="kicker">{String((content.text2 as {values?:Record<string,string>})?.values?.[locale]??'')}</div><h1><InlineContent document={copy.heading[locale]}/></h1><p className="lead"><InlineContent document={copy.body[locale]}/></p></PageHero>
 if(section==='deep')return <ContentSection theme="deep"><SectionHeading kicker={copy.eyebrow[locale]} title={<InlineContent document={copy.heading[locale]}/>} description={<InlineContent document={copy.body[locale]}/>}/>{certifications&&certificationLabels&&<CertificationCarousel data={certifications} locale={locale} labels={certificationLabels}/>}<ActionGroup actions={[{href:'/downloads',label:certificationLabels?.downloads??''},{href:'/contact',label:catalog.settings.labels.requestQuote[locale],variant:'secondary'}]}/></ContentSection>
 if(section!=='collection')return null
 const labels=catalog.settings.labels
 return <ContentSection id={`collection-${id}`}><TwoColumns collapseAt={1050} as="div" columns="minmax(0,1.06fr) minmax(0,.94fr)" gap="clamp(28px,4.6vw,72px)" align="end" className="view-head reveal"><div className="band-head"><div className="kicker">{copy.eyebrow[locale]}</div><h2><InlineContent document={copy.heading[locale]}/></h2><p className="lead view-copy on" data-view-panel="products"><InlineContent document={copy.body[locale]}/></p><p className="lead view-copy" data-view-panel="categories"><InlineContent document={copy.categoryBody[locale]}/></p></div><div className="view-switch" role="group" aria-label={labels.productView[locale]}><button className="vtab" type="button" data-view="products" aria-pressed="true">{labels.singleProducts[locale]} <span className="n">{String(catalog.products.length).padStart(2,'0')}</span></button><button className="vtab" type="button" data-view="categories" aria-pressed="false">{labels.categories[locale]} <span className="n">{String(catalog.categories.length).padStart(2,'0')}</span></button></div></TwoColumns><CatalogPageBrowser {...context} id={`catalogue-${id}`} emptyMessage={copy.emptyMessage[locale]}/><div className="view catalog-category-view" data-view-panel="categories"><div className="product-grid reveal">{CategoryCards(context)}</div></div><CatalogInteractions kind="view"/></ContentSection>
}
export async function CatalogPageBody(context:Context){
 const record=context.product??context.category
 if(!record)return null
 return <RecordLayout<Product|Category> collection={context.product?'products':'categories'} slug={record.slug} recordId={record.id} locale={context.locale} renderSection={(selected,section,id)=>{
  const selectedContext={...context,...(context.product?{product:selected as Product}:{category:selected as Category})}
  return <RecordSection context={selectedContext} section={section} id={id}/>
 }}/>
}
