import type {HomeSectionContent} from './types'
import type {SiteLocale} from '@/i18n/navigation'
import {textContent} from '@/lib/editor/document'

export function sectionText(section: HomeSectionContent, source: string, locale: SiteLocale): string {
  const rich = section.richTexts?.find(field => field.source === source)
  if (rich) return textContent(rich.values[locale])
  return section.texts.find(field => field.source === source)?.values[locale] ?? ''
}
