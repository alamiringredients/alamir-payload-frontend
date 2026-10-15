import {InlineContent} from '@/components/editor/inline-content'
import type {HomeSection} from '@/lib/cms/home-section'
import type {SiteLocale} from '@/i18n/navigation'

export type SectionContentProps = {section: HomeSection; locale: SiteLocale}
export function SectionCopy({section, locale, field}: SectionContentProps & {field: string}) {
  const document = section.rich[field]?.[locale]
  return document ? <InlineContent document={document}/> : null
}
