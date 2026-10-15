import sections from './sections.json' with {type: 'json'}
import recordSections from './record-sections.json' with {type: 'json'}
import type {Document} from './types'

export type SectionBlock = {
  id: string
  blockType: string
  enabled?: boolean
  content?: Record<string, unknown>
  data?: Record<string, unknown>
}
type PageSource = Document & {page: Record<string, unknown>; layout: SectionBlock[]}
export type TemplateValue = string | number | boolean | null | TemplateValue[] | {[key: string]: TemplateValue}

export const pageSections = new Map(sections.map(section => [section.slug, section]))
export const recordSectionDefinitions = new Map(recordSections.map(section => [section.slug, section]))

// Stored Section fields are native. Only the existing presentation templates need
// their historical names; keep that translation here rather than in renderers.
function pageFields(page: Record<string, unknown>, block: SectionBlock) {
  const section = pageSections.get(block.blockType)
  if (!section) return page
  return {
    ...page,
    [section.sourceName]: {...page[section.sourceName] as object, ...block.content, enabled: block.enabled !== false},
    ...(section.pageSlug === 'news' && section.name === 'hero' ? {heroImage: block.content?.heroImage} : {}),
  }
}

export function pagePresentationSource(page: PageSource, block?: SectionBlock): Document {
  const settings = {...page.page, sectionVisibility: {hero: true, body: true, news: true, jobs: true, apply: true, company: true, products: true, product: true, related: true, events: true, contact: true}}
  // A selected Section owns its content, regardless of sibling order or copies.
  // Aggregate only when an older whole-page caller actually requests that view.
  const fields = block ? pageFields(settings, block) : page.layout.reduce(pageFields, settings)
  return {...page, page: fields}
}

export function applyRecordSection(doc: Document, block: SectionBlock): Document {
  const section = recordSectionDefinitions.get(block.blockType)
  if (!section || !block.data) return doc
  const data = block.data
  const page = Object.fromEntries(section.page.map(key => [key, {...data[key] as object, enabled: block.enabled !== false}]))
  const root = Object.fromEntries(Object.keys(section.root ?? {}).map(key => [key, data[key === 'body' && section.collection === 'events' ? 'bodyCopy' : key]]))
  return {...doc, ...root, page: {...doc.page as object, ...page}}
}

export function recordPresentationSource(doc: Document): Document {
  return ((doc.layout ?? []) as SectionBlock[]).reduce(applyRecordSection, {...doc, page: {...doc.page as object}})
}

function usesSection(value: TemplateValue, path: string): boolean {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(item => usesSection(item, path))
  return Object.entries(value).some(([key, item]) =>
    (key === '$field' || key === '$rows') && typeof item === 'string'
      ? item === path || item.startsWith(`${path}.`)
      : usesSection(item, path),
  )
}

export function pageSectionTemplate(template: Record<string, TemplateValue>, blockType: string): Record<string, TemplateValue> {
  const definition = pageSections.get(blockType)
  if (!definition) throw new Error(`Unknown page Section: ${blockType}`)
  const result = {...template}
  if (Array.isArray(template.sections)) {
    const path = `page.${definition.sourceName}`
    if (!template.sections.some(section => usesSection(section, path)))
      throw new Error(`Missing presentation for page Section: ${blockType}`)
    // Keep historical positional keys, but select by owned fields, not order.
    result.sections = template.sections.map(section => usesSection(section, path) ? section : {
      key: (section as Record<string, TemplateValue>).key,
      enabled: false, texts: [], richTexts: [], assets: [], links: [],
    })
  }
  if (template.body && typeof template.body === 'object' && !Array.isArray(template.body)) {
    const body = template.body as {$localeTree?: {type: string; content: {attrs?: {id?: string}}[]}}
    if (body.$localeTree?.content) result.body = {
      ...body,
      $localeTree: {...body.$localeTree, content: body.$localeTree.content.filter(node => node.attrs?.id === definition.name)},
    } as TemplateValue
  }
  return result
}
