import {richText} from '../editor/lexical.ts'
import type {LocalizedDocument,LocalizedValue} from '../cms/types'
import type {Document} from '../payload/types'
import type {SectionBlock} from '../payload/section-projection'
import type {CatalogFold,CatalogSection,Category,Product} from './types'

const locales = ['en','ar','fr'] as const
const object = (value:unknown) => value && typeof value === 'object' ? value as Record<string,unknown> : {}
export function catalogText(value:unknown):LocalizedValue {
  const values=object(value)
  return Object.fromEntries(locales.map(locale=>[locale,String(values[locale]??'')])) as LocalizedValue
}
function document(value:unknown):LocalizedDocument {
  const values=object(value)
  return Object.fromEntries(locales.map(locale=>[locale,richText(values[locale],undefined,locale)])) as LocalizedDocument
}
function media(value:unknown,refs?:Map<number,Document>):string {
  const related=typeof value==='number'?refs?.get(value):value
  const url=String(object(related).url??(typeof related==='string'?related:''))
  return url?new URL(url,process.env.NEXT_PUBLIC_BACKEND_URL).href:''
}
function copy(value:unknown):unknown {return object(value).values}
function section(value:unknown,refs?:Map<number,Document>):CatalogSection {
  const fields=object(value)
  return {
    eyebrow:catalogText(copy(fields.text)),heading:document(fields.heading),
    description:catalogText(copy(fields.text4)),image:media(object(fields.image).value,refs),
    imageAlt:catalogText(copy(fields.text5)),emptyMessage:catalogText(copy(fields.text11)),
  }
}
export function presentCatalogPageSection(value:unknown,refs?:Map<number,Document>) {
  const fields=object(value)
  return {...section(fields,refs),heading:document(copy(fields.heading)),body:document(copy(fields.body)),categoryBody:document(copy(fields.body2)),emptyMessage:catalogText(copy(fields.text10))}
}
function fold(value:unknown):CatalogFold {
  const fields=object(value)
  return {
    heading:document(fields.heading),
    items:((fields.items??[]) as {body:unknown}[]).map(item=>document(item.body)),
    pairs:((fields.pairs??[]) as {label:unknown;value:unknown}[]).map(item=>({label:catalogText(item.label),value:catalogText(item.value)})),
  }
}

// Catalog records consume their owned Section data directly. No historical
// template, source ID selection or positional text reconstruction is required.
export function presentCatalogRecord(collection:'products'|'categories',doc:Document,selected?:SectionBlock,view?:'card'|'meta'):Product|Category {
  const layout=(doc.layout??[]) as SectionBlock[]
  const data=Object.assign({},...layout.filter(block=>!selected || block.blockType!==selected.blockType).map(block=>block.data),selected?.data) as Record<string,unknown>
  const refs=doc.mediaRefs as Map<number,Document>|undefined
  const settings=object(doc.page),artwork=object(settings.artwork)
  const photos=(data.gallery??[]) as {image:unknown;caption:unknown;alt:unknown}[]
  const category=object(doc.category),relations=object(doc.relationships)
  const sharedLabels=object(object(object(doc.interface).page).shared)
  const specifications=fold(data.specifications)
  if(collection==='products' && !view){
    const concentrations=(relations.concentrations??[]) as {name:unknown}[]
    specifications.pairs=[...concentrations.map(item=>({label:catalogText(sharedLabels.concentration),value:catalogText(item.name)})),...specifications.pairs]
  }
  const keys=(value:unknown)=>((value??[]) as {key:string}[]).map(item=>item.key).filter(Boolean)
  const content={
    name:catalogText(doc.name),description:catalogText(doc.description),
    seo:{title:catalogText(doc.seoTitle),description:catalogText(doc.seoDescription)},
    artwork:{key:'artwork',label:'',enabled:artwork.enabled!==false,texts:[],links:[],assets:((artwork.images??[]) as {image:unknown}[]).map((item,index)=>({id:String(index),kind:'image' as const,label:'',source:'',value:media(item.image,refs)}))},
    gallery:photos.map(photo=>({image:media(photo.image,refs),caption:catalogText(photo.caption),alt:catalogText(photo.alt)})),
    ...(view?{}:{page:{
      hero:{...section(data.hero,refs),heading:document(doc.title)},
      overview:section(data.specificationIntro,refs),range:{...section(data.productRange,refs),emptyMessage:catalogText(copy(object(data.productRange).text12))},
      gallery:{...section(data.galleryIntro,refs),description:catalogText(copy(object(data.galleryIntro).text5))},related:section(data.relatedProducts,refs),
      enquiry:section(data[collection==='products'?'enquiry':'traceability'],refs),allProducts:section(data.allProducts,refs),
      downloadSpecifications:catalogText(sharedLabels.downloadSpecifications),
      folds:['overview','description','specifications','packaging','storage','documents'].map(key=>key==='specifications'?specifications:fold(data[key])),specifications,
    }}),
  }
  const base={id:doc.sourceId??doc.id,slug:String(doc.slug??''),published:true,sort_order:Number(settings.sort_order??0),content}
  if(collection==='categories')return {...base,content:{...content,appearance:doc.appearance==='muted'?'muted':'standard',icon:media(doc.icon,refs)}} as Category
  return {...base,category_id:Number(category.sourceId??category.id??doc.category),content:{...content,applications:keys(relations.applications),concentrations:keys(relations.concentrations),tds:catalogText(Object.fromEntries(locales.map(locale=>[locale,media(object(doc.tds)[locale],refs)])))}} as Product
}
