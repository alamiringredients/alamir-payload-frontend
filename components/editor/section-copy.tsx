import {InlineContent} from './inline-content'
import type {HomeSectionContent} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'

export function SectionCopy({section,locale,kind,index}:{section?:HomeSectionContent;locale:SiteLocale;kind?:'heading'|'body';index?:number}){
 const field=index===undefined?undefined:section?.texts[index]
 const rich=section?.richTexts?.find(item=>kind==='heading'
  ? item.id==='section-heading'||item.label.startsWith('Heading')
  : kind==='body'
   ? /^(Paragraph|Content):/.test(item.label)||item.id.startsWith('body')
   : field && item.sources.includes(field.source))
 return rich?<InlineContent document={rich.values[locale]}/>:field?.values[locale]??null
}
