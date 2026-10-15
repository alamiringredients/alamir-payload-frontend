import {object, localizedText, localizedDocument, mediaURL, type Fields} from './fields.ts'
import {pageSeo} from './page-content.ts'
import {pageSections, type SectionBlock} from '../payload/section-projection.ts'
import type {CmsCardItem, LocalizedValue, LocalizedDocument, HomeSeoContent} from './types'

export type ManagedSection = {
  key: string
  enabled: boolean
  text: Record<string, LocalizedValue>
  rich: Record<string, LocalizedDocument>
  images: Record<string, string>
  cards: CmsCardItem[]
}
export type ManagedPage = {sections: ManagedSection[]; seo: HomeSeoContent; interface: {backHome: LocalizedValue; browseDownloads: LocalizedValue; searchSite: LocalizedValue}}
type Page = {page: Fields; layout: SectionBlock[]; interface?: unknown; mediaRefs?: unknown}

export function presentManagedPage(page: Page, origin: string, selected?: SectionBlock): ManagedPage {
  const translations = object(page.interface)
  const shared = object(object(translations.page).shared)
  const notFound = object(object(translations.page).notFoundTranslations)
  const backHome = localizedText(object(notFound.item_1).translations)
  const events = object(object(translations.page).events)
  const media = page.mediaRefs as ReadonlyMap<number, Fields> | undefined
  return {
    seo: pageSeo(page, origin),
    interface: {backHome, browseDownloads: localizedText(shared.browseDownloads), searchSite: localizedText(object(notFound.item_2).translations)},
    sections: (selected ? [selected] : page.layout).flatMap(block => {
      const definition = pageSections.get(block.blockType)
      if (!definition) return []
      const fields = block.content ?? {}
      const text = Object.fromEntries(Object.entries(fields).filter(([key]) => /^text\d*$/.test(key)).map(([key, value]) => [key, localizedText(object(value).values)]))
      for (const [key, value] of Object.entries(shared)) text[key] = localizedText(value)
      for (const [key, value] of Object.entries(events)) text[key] = localizedText(value)
      text.backHome = backHome
      if (definition.pageSlug === 'events' && definition.name === 'hero') text.text = localizedText(shared.events)
      return [{key: definition.name, enabled: block.enabled !== false, text,
        rich: Object.fromEntries(Object.entries(fields).filter(([key]) => /^(heading|body)\d*$/.test(key)).map(([key, value]) => [key, localizedDocument(object(value).values)])),
        images: Object.fromEntries(Object.entries(fields).filter(([key]) => /^image\d*$/.test(key)).map(([key, value]) => [key, mediaURL(object(value).value, origin, media)])),
        cards: ((fields.cards ?? []) as Fields[]).map((card, index) => ({id: String(card.reference ?? card.id ?? index), title: localizedText(card.title), description: localizedText(card.description)})),
      }]
    }),
  }
}
