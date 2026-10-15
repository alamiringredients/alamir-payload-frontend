import 'server-only'
import {cache} from 'react'
import {locale as rootLocale} from 'next/root-params'
import type {SiteLocale} from '@/i18n/navigation'
import type {CmsForm, FormScope} from '@/lib/forms/types'
import type {Document} from './types'
import type {SearchContent} from '../search/results'
import {publicContentResources} from './resources'
import {contentReadResources, pageReadResources, type ContentResource} from './read-plan'

type Collection = {docs: Document[]}
type PublishedSite = Record<string, Document | Collection>
export type IdentityResource = (typeof publicContentResources.identities)[number]
type SummaryResource = Extract<(typeof publicContentResources.shared)[number], (typeof publicContentResources.collections)[number]>

const site = cache(async (query: string): Promise<PublishedSite> => {
  const origin = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')
  if (!origin) throw new Error('NEXT_PUBLIC_BACKEND_URL is required.')
  const params = new URLSearchParams(query)
  const scope = params.get('scope')
  const resources = scope === 'shared' ? publicContentResources.shared
    : scope === 'identities' ? publicContentResources.identities
    : scope === 'search' ? publicContentResources.search : params.get('resources')!.split(',')
  const response = await fetch(`${origin}/api/public/site?${query}`, {next: {revalidate: 60, tags: ['payload-content', ...resources.map(resource => `public-content:${resource}`)]}})
  if (!response.ok) throw new Error(`Published website content failed (${response.status}).`)
  return response.json()
})
const requestLocale = cache(async () => {try {return await rootLocale() ?? 'all'} catch {return 'all'}})
const shared = cache(async () => site(`scope=shared&locale=${await requestLocale()}`))
const identities = cache(() => site('scope=identities&locale=all'))
const loaded = cache(() => new Map<string, Promise<Document[]>>())
function documents(content: PublishedSite, resource: string): Document[] {
  const collection = content[resource] as Collection | undefined
  if (!collection) throw new Error(`Missing public resource: ${resource}`)
  return collection.docs
}
async function prepareContent(resources: readonly string[], pending: ReturnType<typeof loaded>) {
  const missing = resources.filter(resource => !pending.has(resource))
  if (missing.length) {
    const result = requestLocale().then(locale => site(`scope=content&resources=${missing.sort().join(',')}&locale=${locale}`))
    for (const resource of missing) pending.set(resource, result.then(content => documents(content, resource)))
  }
  await Promise.all(resources.map(resource => pending.get(resource)!))
}
function ordered(docs: Document[], field: '_order' | 'createdAt' = '_order') {
  return [...docs].sort((a, b) => String(a[field] ?? '').localeCompare(String(b[field] ?? ''), undefined, {numeric: true}))
}
export const publishedSummary = cache(async (resource: SummaryResource): Promise<Document[]> => {
  const docs = documents(await shared(), resource)
  if (resource === 'pages') return docs.map(({id, slug, sourceKey, title, sectionTypes}) => ({id, slug, sourceKey, title, sectionTypes}))
  return resource === 'products' || resource === 'categories' ? ordered(docs) : docs
})
export const publishedIdentities = cache(async (resource: IdentityResource): Promise<Document[]> =>
  ordered(documents(await identities(), resource)).map(({id, sourceId, slug, category, availability}) => ({
    id, sourceId, slug, ...(resource === 'products' ? {category} : {}), ...(resource === 'jobs' ? {availability} : {}),
  })))
export const publishedDocuments = cache(async (resource: ContentResource): Promise<Document[]> => {
  await shared()
  const pending = loaded()
  if (!pending.has(resource)) await prepareContent(contentReadResources(resource), pending)
  const docs = await pending.get(resource)!
  return resource === 'news-taxonomies' ? ordered(docs, 'createdAt') :
    ['products', 'categories', 'news', 'sustainability', 'jobs', 'events', 'product-applications', 'product-concentrations'].includes(resource) ? ordered(docs) : docs
})
export const publishedEventSummaries = cache(async (): Promise<Document[]> =>
  (await publishedDocuments('events')).map(({id, sourceId, slug, kind, startsAt, endsAt, timezone, title, venue, stand, layout}) => ({id, sourceId, slug, kind, startsAt, endsAt, timezone, title, venue, stand, layout})))
export const publishedGlobal = cache(async (slug: string): Promise<Document> => {
  const doc = (await shared())[`globals/${slug}`]
  if (!doc) throw new Error(`Unknown public resource: globals/${slug}`)
  return doc as Document
})
export const publishedPage = cache(async (id: number, prepareSections = true): Promise<Document | undefined> => {
  const identity = (await publishedSummary('pages')).find(page => page.id === id)
  if (!identity) return undefined
  const pending = loaded()
  await prepareContent(prepareSections
    ? pageReadResources(identity.sectionTypes as string[] | undefined, identity.sourceKey as string | undefined)
    : ['pages'], pending)
  return (await pending.get('pages')!).find(page => page.id === id)
})
function localized(value: unknown, locale: SiteLocale): unknown {
  if (Array.isArray(value)) return value.map(item => localized(item, locale))
  if (!value || typeof value !== 'object') return value
  const row = value as Record<string, unknown>
  if ('en' in row && Object.keys(row).every(key => ['en', 'ar', 'fr'].includes(key))) return row[locale] ?? row.en
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, localized(value, locale)]))
}
export const publishedForms = cache(async (locale: SiteLocale, purpose: CmsForm['purpose'], owner?: FormScope['collection'], ownerId?: number): Promise<Document[]> => {
  const query = new URLSearchParams({scope: 'content', resources: 'forms', locale, purpose})
  if (owner) query.set('owner', owner)
  if (ownerId !== undefined) query.set('ownerId', String(ownerId))
  return documents(await site(query.toString()), 'forms').map(doc => localized(doc, locale) as Document)
})

export const publishedSearch = cache(async (locale: SiteLocale): Promise<SearchContent> =>
  await site(`scope=search&locale=${locale}`) as SearchContent)
