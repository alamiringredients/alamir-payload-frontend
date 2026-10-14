import type {ContentDocument,ContentNode} from './document'
import type {SiteLocale} from '@/i18n/navigation'
type Position='original'|'left'|'right'|undefined
export function placeMedia(document:ContentDocument,position:Position,locale:SiteLocale):ContentDocument{
 if(!position || position==='original')return document
 const side=position==='left'?(locale==='ar'?'end':'start'):(locale==='ar'?'start':'end')
 const visit=(node:ContentNode):ContentNode=>{
  if(node.type==='aboutProfile')return {...node,attrs:{...node.attrs,mediaSide:side}}
  let content=node.content?.map(visit)
  if(node.type==='columns' && content?.length===2){
   const mediaIndex=content.findIndex(column=>column.content?.some(child=>['image','video'].includes(child.type)))
   if(mediaIndex!==-1){
    const media=content[mediaIndex],copy=content[1-mediaIndex]
    content=side==='start'?[media,copy]:[copy,media]
    return {...node,attrs:{...node.attrs,mediaSide:side},content}
   }
  }
  return {...node,...(content?{content}:{})}
 }
 return {...document,content:document.content.map(visit)}
}
export function placeRecordMedia<T>(value:T,position:Position,locale:SiteLocale):T{
 if(!position || position==='original')return value
 if(Array.isArray(value))return value.map(child=>placeRecordMedia(child,position,locale)) as T
 if(value && typeof value==='object'){
  if('type' in value && value.type==='doc')return placeMedia(value as unknown as ContentDocument,position,locale) as T
  return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,placeRecordMedia(child,position,locale)])) as T
 }
 return value
}
