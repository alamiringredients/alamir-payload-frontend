import {InlineContent} from './inline-content'
import type {HomeSectionContent} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'

export type SectionContentProps={section:HomeSectionContent;locale:SiteLocale}

export function SectionCopy({section,locale,kind,index,richIndex}:{section?:HomeSectionContent;locale:SiteLocale;kind?:'heading'|'body';index?:number;richIndex?:number}){
 const field=index===undefined?undefined:section?.texts[index]
 const rich=richIndex===undefined?section?.richTexts?.find(item=>kind
  ? item.role===kind || (kind==='heading' && item.id==='section-heading')
  : field && item.sources.includes(field.source)):section?.richTexts?.[richIndex]
 return rich?<InlineContent document={rich.values[locale]}/>:field?.values[locale]??null
}
