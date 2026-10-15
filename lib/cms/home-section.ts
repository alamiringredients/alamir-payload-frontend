import {object, localizedText as text, localizedDocument as document, mediaURL, type Fields} from './fields.ts'
import type {LocalizedDocument, LocalizedValue, CmsFigureItem} from './types'
import type {SectionBlock} from '../payload/section-projection'

export type HomeSection = {
  text: Record<string, LocalizedValue>
  rich: Record<string, LocalizedDocument>
  image: string
  videos: string[]
  figures: CmsFigureItem[]
}

// These names describe the presentation; the values name existing editor fields.
// No source text, positional content, or historical page shape is involved.
const copyFields: Record<string, Record<string, string>> = {
  hero: {contactLabel: '@navigation.header.getInTouch', productsLabel: '@page.shared.discoverProducts', location: 'text6'},
  figures: {label: 'text', viewGroup: '@page.shared.viewGroup', ariaLabel: 'text3'},
  story: {kicker: 'text', aboutLabel: '@page.shared.aboutUs', imageAlt: 'text7'},
  products: {kicker: 'text'},
  certifications: {kicker: 'text'},
  sourcing: {kicker: 'text', note: 'text4', detail: 'text5', imageAlt: 'text6'},
  process: {kicker: 'text'},
  quality: {kicker: 'text', qualityLabel: '@page.shared.qualityCapability', proofTitle: 'text5', proofDescription: 'text6', secondProofTitle: 'text7', secondProofDescription: 'text8', imageAlt: 'text9'},
  reach: {caption: 'text', kicker: 'text2', instructions: '@page.shared.globeInstructions', region: 'text7', regionDetail: 'text8', secondRegion: 'text9', secondRegionDetail: 'text10', thirdRegion: 'text11', thirdRegionDetail: 'text12', fourthRegion: 'text13', fourthRegionDetail: 'text14'},
  contact: {badge: '@page.homeContact.badge', button: '@page.homeContact.button', exportDesk: '@page.homeContact.exportDesk', enquiryDetails: '@page.homeContact.enquiryDetails'},
}

export function presentHomeSection(block: SectionBlock, translations: Fields, origin: string, mediaRefs?: ReadonlyMap<number, Fields>): HomeSection {
  const name = block.blockType.replace(/^home-/, '')
  const fields = block.content ?? {}
  const translated = (path: string) => path.split('.').reduce<unknown>((value, key) => object(value)[key], translations)
  return {
    text: Object.fromEntries(Object.entries(copyFields[name] ?? {}).map(([key, field]) => [
      key, text(field.startsWith('@') ? translated(field.slice(1)) : object(fields[field]).values),
    ])),
    rich: Object.fromEntries(Object.entries(fields).filter(([key]) => /^(heading|body)\d*$/.test(key))
      .map(([key, value]) => [key, document(object(value).values)])),
    image: mediaURL(object(fields.image).value, origin, mediaRefs),
    videos: Object.values(object(fields.videos)).map(value => mediaURL(value, origin, mediaRefs)),
    figures: ((fields.figures ?? []) as Fields[]).map((figure, index) => ({
      id: String(figure.id ?? figure.reference ?? index), value: Number(figure.value ?? 0),
      unit: String(figure.unit ?? ''), unitLabel: text(figure.unitLabel),
      label: text(figure.label), description: text(figure.description),
    })),
  }
}
