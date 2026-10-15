import {InlineContent} from './inline-content'
import type {ManagedSection} from '@/lib/cms/managed-page'
import type {SiteLocale} from '@/i18n/navigation'

export function SectionCopy({section, locale, field}: {section?: ManagedSection; locale: SiteLocale; field: string}) {
 const document = section?.rich[field]?.[locale]
 return document ? <InlineContent document={document}/> : section?.text[field]?.[locale] ?? null
}
