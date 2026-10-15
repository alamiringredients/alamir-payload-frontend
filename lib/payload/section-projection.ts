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
export type TemplateValue = string | number | boolean | null | TemplateValue[] | {[key: string]: TemplateValue}

export const pageSections = new Map(sections.map(section => [section.slug, section]))
export const recordSectionDefinitions = new Map(recordSections.map(section => [section.slug, section]))

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
