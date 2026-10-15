import type {publicContentResources} from './resources'

export type ContentResource = Exclude<(typeof publicContentResources.collections)[number], 'pages' | 'media' | 'translations' | 'forms'>
type PageResource = 'pages' | ContentResource

const groups = {
  catalog: ['products', 'categories', 'product-applications', 'product-concentrations'],
  certifications: ['certifications', 'certification-types'],
  news: ['news', 'news-taxonomies'],
  careers: ['jobs'],
  events: ['events'],
  booking: ['events', 'meeting-slots'],
  sustainability: ['sustainability', 'sustainability-goals'],
} as const satisfies Record<string, readonly ContentResource[]>

const sectionGroups: Record<string, readonly (keyof typeof groups)[]> = {
  'home-certifications': ['certifications'],
  'quality-credentials': ['certifications'],
  'quality-roadmap': ['certifications'],
  'products-collection': ['catalog'],
  'products-deep': ['certifications'],
  'downloads-product': ['catalog'],
  'downloads-company': ['certifications'],
  'news-articles': ['news'],
  'careers-jobs': ['careers'],
  'events-related': ['events'],
  'events-enquiry': ['events'],
  'book-a-meeting-bk_band': ['booking'],
  'sustainability-content': ['sustainability'],
}
const resourceGroups: Record<ContentResource, keyof typeof groups> = {
  products: 'catalog', categories: 'catalog', 'product-applications': 'catalog', 'product-concentrations': 'catalog',
  jobs: 'careers', news: 'news', 'news-taxonomies': 'news', events: 'events', 'meeting-slots': 'booking',
  sustainability: 'sustainability', 'sustainability-goals': 'sustainability',
  certifications: 'certifications', 'certification-types': 'certifications',
}

export function contentReadResources(resource: ContentResource): readonly ContentResource[] {
  return groups[resourceGroups[resource]]
}

export function pageReadResources(sectionTypes: readonly string[] = [], sourceKey?: string): PageResource[] {
  return [...new Set<PageResource>([
    'pages',
    // The home announcement reads upcoming events independently of its Sections.
    ...(sourceKey === 'home-page' ? groups.events : []),
    ...sectionTypes.flatMap(type => (sectionGroups[type] ?? []).flatMap(group => groups[group])),
  ])]
}
