import {cmsLocales, object, localizedText, localizedDocument, mediaURL, type Fields} from '../cms/fields.ts'
import {richText} from '../editor/lexical.ts'
import type {ContentNode} from '../editor/document'
import type {Document} from './types'

export type NativeRecordCollection = 'news' | 'sustainability' | 'jobs' | 'events' | 'certifications' | 'certification-types' | 'news-taxonomies'
type View = 'card' | 'meta'
const localized = (value: unknown, locale: string): unknown => {
  const row = object(value)
  return cmsLocales.some(language => language in row) ? row[locale] : value
}
const string = (value: unknown) => value == null ? '' : String(value)
const id = (value: unknown): number => typeof value === 'number' ? value : Number(object(value).sourceId ?? object(value).id ?? 0)
const rows = (value: unknown): Fields[] => Array.isArray(value) ? value : []

function articleBody(value: unknown, locale: string, introStyle: unknown, sustainability = false) {
  const document = richText(value, undefined, locale)
  if (introStyle === 'lead' && document.content[0]?.type === 'paragraph')
    document.content[0].attrs = {...document.content[0].attrs, variant: 'lead'}
  if (sustainability) {
    const content: ContentNode[] = []
    let section: ContentNode | undefined
    for (const node of document.content) {
      if (node.type === 'heading' && node.attrs?.level === 2) {
        section = {type: 'contentSection', attrs: {id: node.attrs.id}, content: []}
        content.push(section)
      }
      if (section) section.content!.push(node)
      else {
        if (node.type === 'paragraph') node.attrs = {...node.attrs, variant: 'lead'}
        content.push(node)
      }
    }
    document.content = content
  }
  return document
}

/** Present prepared, owned record fields directly, independently of historical records. */
export function presentNativeRecord<T>(collection: NativeRecordCollection, doc: Document, origin: string, view?: View): T {
  const page = object(doc.page), metadata = object(page.metadata), relationships = object(doc.relationships)
  const refs = doc.mediaRefs as ReadonlyMap<number, Fields> | undefined
  const media = (value: unknown, locale = 'en') => mediaURL(localized(value, locale), origin, refs)
  const text = (key: string, locale: string) => string(localized(doc[key], locale))
  const base = {id: doc.sourceId ?? doc.id, slug: string(doc.slug)}
  const manyIds = (value: unknown) => rows(value).map(id)
  const manySlugs = (value: unknown) => rows(value).map(row => string(row.slug)).filter(Boolean)
  if (collection === 'news' || collection === 'sustainability') {
    const sustainability = collection === 'sustainability'
    const versions = Object.fromEntries(cmsLocales.map(locale => {
      const gallery = Array.isArray(doc.gallery)
        ? rows(doc.gallery).map(photo => ({src: media(photo.image, locale), alt: string(localized(photo.alt, locale)), caption: string(localized(photo.caption, locale))}))
        : media(doc.heroImage, locale) ? [{src: media(doc.heroImage, locale), alt: text('heroAlt', locale), caption: text('heroCaption', locale)}] : []
      const seo = {seoTitle: text('seoTitle', locale), seoDescription: text('seoDescription', locale)}
      if (view === 'meta') return [locale, {...seo, ...(sustainability ? {gallery} : {hero: media(doc.hero, locale)})}]
      const title = richText(localized(doc.title, locale), undefined, locale)
      const card = {title, summary: text('summary', locale),
        cardTitle: richText(localized(doc.cardTitle, locale) || localized(doc.title, locale), undefined, locale),
        cardSummary: text('cardSummary', locale) || text('summary', locale),
        ...(sustainability ? {badge: text('badge', locale), gallery} : {hero: media(doc.hero, locale), heroAlt: text('heroAlt', locale)})}
      if (view === 'card') return [locale, card]
      return [locale, {...card, ...seo, body: articleBody(localized(doc.body, locale), locale, doc.introStyle, sustainability),
        ...(sustainability ? {kicker: text('kicker', locale), railIntro: text('railIntro', locale), note: text('note', locale)}
          : {heroCaption: text('heroCaption', locale)})}]
    }))
    const details = sustainability
      ? {updatedDate: string(metadata.updatedDate), sortOrder: Number(metadata.sortOrder ?? 0),
        goalIds: rows(relationships.goals).map(goal => Number(goal.reference ?? id(goal))),
        primaryGoal: Number(object(relationships.primaryGoal).reference ?? id(relationships.primaryGoal)),
        relatedArticleIds: manyIds(relationships.relatedArticles)}
      : {categoryId: id(relationships.category), tagIds: manyIds(relationships.tags),
        previousSlug: string(object(relationships.previousArticle).slug), nextSlug: string(object(relationships.nextArticle).slug),
        relatedSlugs: manySlugs(relationships.relatedArticles)}
    return {...base, content: {...(view === 'meta' ? {} : {date: string(metadata.date), featured: Boolean(metadata.featured), ...details}), locales: versions},
      published: versions, availableLocales: [...cmsLocales]} as T
  }
  if (collection === 'jobs') {
    const content = Object.fromEntries(cmsLocales.map(locale => [locale, {
      title: text('name', locale), summary: text('summary', locale),
      ...(view === 'meta' ? {} : Object.fromEntries(['department', 'location', 'contract', 'experience'].map(key => [key, text(key, locale)]))),
      ...(!view ? {heading: richText(localized(doc.title, locale), undefined, locale), hero: media(doc.hero, locale), heroAlt: text('heroAlt', locale),
        reportsTo: text('reportsTo', locale), closing: text('closing', locale), body: articleBody(localized(doc.body, locale), locale, doc.introStyle)} : {}),
    }]))
    return {...base, code: string(page.code), status: doc.availability, content} as T
  }
  if (collection === 'events') {
    const settings = object(page.seo)
    const seo = {...Object.fromEntries(['title', 'description', 'socialTitle', 'socialDescription'].map(key => [key, localizedText(settings[key])])), socialImage: media(settings.socialImage)}
    const content = {seo, ...(view === 'meta' ? {} : {title: localizedDocument(doc.title),
      ...Object.fromEntries(['stand', 'venue', 'eyebrow', 'heroAlt', 'summary', 'location', 'heroCaption'].map(key => [key, localizedText(doc[key])])),
      heroImage: media(doc.heroImage), ...(!view ? {body: Object.fromEntries(cmsLocales.map(locale => [locale, articleBody(localized(doc.body, locale), locale, doc.introStyle)]))} : {})})}
    return {...base, kind: doc.kind, published: true, sort_order: Number(page.sort_order ?? 0),
      starts_at: string(doc.startsAt), ends_at: string(doc.endsAt), timezone: doc.timezone, content} as T
  }
  if (collection === 'certification-types') return {...base, content: {name: localizedText(doc.name), description: localizedText(doc.description),
    logo: media(doc.logo), badge: string(localized(doc.badge, 'en')), kind: string(localized(doc.kind, 'en'))}} as T
  if (collection === 'certifications') return {id: base.id, type_id: id(doc.certificationType), holder: doc.holder, status: doc.standing,
    published: true, sort_order: Number(page.sort_order ?? 0), content: {scope: localizedText(doc.scope), target_date: string(doc.targetDate),
      issue_date: string(doc.issueDate), expiry_date: string(doc.expiryDate), certificate_number: string(doc.certificateNumber), document: media(doc.document)}} as T
  return {...base, kind: doc.kind, sort_order: Number(page.sort_order ?? 0), content: Object.fromEntries(cmsLocales.map(locale => [locale, {
    name: text('name', locale), description: string(localized(object(metadata.localeTree).description, locale)),
  }]))} as T
}
