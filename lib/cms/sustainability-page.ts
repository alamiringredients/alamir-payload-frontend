import {object, localizedText as text, localizedDocument as document, mediaURL, type Fields} from './fields.ts'
import type {SectionBlock} from '../payload/section-projection'
import type {SustainabilityPageContent} from '../sustainability/types'

type Page = {page: Fields; layout: SectionBlock[]; interface?: unknown; relationships?: unknown; mediaRefs?: unknown}

export function presentSustainabilityPage(page: Page, origin: string, selected?: SectionBlock): SustainabilityPageContent {
  const blocks = selected ? [selected] : page.layout
  const section = (name: string) => blocks.filter(block => block.blockType === `sustainability-${name}`).at(-1)
  const hero = section('hero'), content = section('content'), related = section('related')
  const heroFields = hero?.content ?? {}, contentFields = content?.content ?? {}, relatedFields = related?.content ?? {}
  const refs = page.mediaRefs as ReadonlyMap<number, Fields> | undefined
  const translations = object(object(page.interface).page), seo = object(page.page.seo)
  const goals = object(page.relationships).goals
  return {
    hero: {enabled: Boolean(hero && hero.enabled !== false), title: document(object(heroFields.heading).values), description: document(object(heroFields.body).values)},
    content: {enabled: Boolean(content && content.enabled !== false), kicker: text(object(contentFields.text).values), title: document(object(contentFields.heading).values)},
    contact: {enabled: Boolean(related && related.enabled !== false), kicker: text(object(relatedFields.text).values),
      title: document(object(relatedFields.heading).values), description: document(object(relatedFields.body).values),
      quoteLabel: text(object(translations.events).requestQuote), qualityLabel: text(object(translations.sustainability).roadmap)},
    heroIcons: (Array.isArray(heroFields.icons) ? heroFields.icons : []).map(icon => mediaURL(icon, origin, refs)).filter(Boolean),
    relatedKicker: text(page.page.relatedKicker), relatedTitle: document(page.page.relatedTitle), sectionVisibility: {related: true},
    goals: (Array.isArray(goals) ? goals : []).map(goal => ({
      id: Number(goal.reference ?? goal.id), color: String(goal.color ?? ''), image: mediaURL(goal.image, origin, refs),
      name: text(goal.name), alt: text(goal.alt),
    })),
    seo: {title: text(seo.title), description: text(seo.description)},
  }
}
