import {richText} from '../editor/lexical.ts'
import {textContent} from '../editor/document.ts'
import type {SiteLocale} from '@/i18n/navigation'
import type {Document} from '../payload/types'
export type SearchResult = {href: string; title: string; description: string; section: string}

export type SearchContent = Record<string, {docs: Document[]}>

export function searchResults(content: SearchContent, query: string, locale: SiteLocale, labels: Record<string, string>): SearchResult[] {
  const normalized = query.trim().toLocaleLowerCase(locale)
  if (!normalized) return []
  const text = (value: unknown): string => {
    const localized = value && typeof value === 'object' && 'en' in value
      ? (value as Record<string, unknown>)[locale] ?? (value as Record<string, unknown>).en : value
    return typeof localized === 'string' ? localized : textContent(richText(localized))
  }
  const categories = new Map(content.categories.docs.map(category => [category.id, category]))
  return ['products', 'news', 'sustainability', 'jobs', 'events'].flatMap(resource =>
    content[resource].docs.flatMap(doc => {
      if (resource === 'jobs' && doc.availability !== 'open') return []
      const category = resource === 'products' ? categories.get(Number(doc.category)) : undefined
      if (resource === 'products' && !category) return []
      const title = text(resource === 'products' || resource === 'jobs' ? doc.name : doc.title)
      const description = text(resource === 'products' ? doc.description : doc.summary)
      if (!`${title} ${description}`.toLocaleLowerCase(locale).includes(normalized)) return []
      const base = resource === 'jobs' ? 'careers' : resource
      return [{
        href: `/${base}/${category ? `${category.slug}/` : ''}${doc.slug}`,
        title, description, section: labels[base] ?? '',
      }]
    }))
}
