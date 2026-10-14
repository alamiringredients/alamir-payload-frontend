import {cache} from 'react'
import {loadPayload} from '@/lib/payload/public'
import 'server-only'
import type {SiteLocale} from '@/i18n/navigation'
import type {HomeCmsData,ManagedPageContent,QualityPageContent,WebsiteSettings} from '@/lib/cms/types'
import type {DownloadsPageContent} from '@/lib/downloads/types'
import type {CertificationData,CertificationInterfaceLabels} from '@/lib/certifications/types'
import type {Catalog,NavigationCatalog,CategoryCatalog} from '@/lib/catalog/types'
import type {EventRecord,PublicEventSlot} from '@/lib/events/types'
import type {NewsPageContent,NewsRecord,NewsTaxonomy,NewsVersion} from '@/lib/news/types'
import type {AboutContent,CareersContent,JobRecord} from '@/lib/careers/types'
import type {SustainabilityPageContent,SustainabilityRecord,SustainabilityVersion} from '@/lib/sustainability/types'
import type {SearchResult} from '@/lib/search/match'

export type NewsCardVersion=Pick<NewsVersion,'title'|'summary'|'cardTitle'|'cardSummary'|'hero'|'heroAlt'>
export type NewsCardRecord=Pick<NewsRecord,'id'|'slug'> & {content:Omit<NewsRecord['content'],'locales'>;published:Partial<Record<SiteLocale,NewsCardVersion>>}
type PublicNewsRecord=Omit<NewsCardRecord,'published'> & {published:NewsRecord['published'];availableLocales:SiteLocale[];draft?:NewsVersion}
export type JobCard=Omit<JobRecord,'content'> & {content:Record<SiteLocale,Pick<JobRecord['content'][SiteLocale],'title'|'summary'|'department'|'location'|'contract'|'experience'>>}
export type SustainabilityCardVersion=Pick<SustainabilityVersion,'title'|'cardTitle'|'summary'|'cardSummary'|'badge'|'gallery'>
export type SustainabilityCard=Pick<SustainabilityRecord,'id'|'slug'> & {content:Omit<SustainabilityRecord['content'],'locales'>;published:Partial<Record<SiteLocale,SustainabilityCardVersion>>}
type PublicSustainabilityArticle=Omit<SustainabilityCard,'published'> & {published:SustainabilityRecord['published'];availableLocales:SiteLocale[];draft?:SustainabilityVersion}
type TranslationEntry={key:string;page:string;source:string;translations:{en:string;ar:string;fr:string};previousTranslations?:{en:string;ar:string;fr:string};baseline?:{en:string;ar:string;fr:string}}

type QueryValue=string|number|boolean|undefined
type ManagedPageKey='contact'|'privacy'|'terms'|'cookies'|'thank-you'|'404'|'products'|'events'|'book-a-meeting'|'search'

const readPayload=cache((endpoint:string,locale:SiteLocale,params:string)=>loadPayload(endpoint,locale,JSON.parse(params)))
async function read<T>(endpoint:string,locale:SiteLocale,params:Record<string,QueryValue>={}):Promise<T> {
  return await readPayload(endpoint,locale,JSON.stringify(params)) as T
}

export const getHomeCmsData=async(locale:SiteLocale,scope:'all'|'shell'='all')=>{
  if(scope==='shell')return (await getLayoutPayload(locale)).home
  const [layout,homepage]=await Promise.all([getLayoutPayload(locale),getHomepagePayload(locale)])
  return {seo:homepage.home.seo,sections:[...layout.home.sections,...homepage.home.sections]}
}
export const getWebsiteSettings=async(locale:SiteLocale,scope:'all'|'shell'='shell')=>{
  void scope
  return (await getLayoutPayload(locale)).settings
}
export const getManagedPageContent = (key: ManagedPageKey, locale: SiteLocale) => {
  if (key === 'products') return getCatalogPayload(locale, 'products').then(data => {
    if (!data.managedContent) throw new Error('Managed products page missing')
    return data.managedContent
  })
  if (key === 'events' || key === 'book-a-meeting') {
    return getEventsPayload(locale, key).then(data => {
      if (!data.managedContent) throw new Error('Managed event page missing')
      return data.managedContent
    })
  }
  return getManagedPayload(key, locale).then(data => data.content)
}
export const getDownloadsPageContent=(locale:SiteLocale)=>getDownloadsPayload(locale).then(data=>data.content)
export function getCatalog(includeDrafts:boolean,locale:SiteLocale,page?:'navigation'):Promise<NavigationCatalog>
export function getCatalog(includeDrafts:boolean,locale:SiteLocale,page:string):Promise<Catalog>
export async function getCatalog(includeDrafts:boolean,locale:SiteLocale,page='navigation'):Promise<Catalog|NavigationCatalog>{
  if(includeDrafts)throw new Error('Draft catalog records are available only in the backend admin application.')
  if(page==='navigation')return getLayoutPayload(locale).then(data=>data.catalog)
  return getCatalogPayload(locale,page).then(data=>data.catalog)
}
export const getPublicEvents=(locale:SiteLocale)=>getEventsPayload(locale).then(data=>data.events)
export const getPublicEvent=(locale:SiteLocale,slug:string)=>getEventsPayload(locale,'events',slug).then(data=>data.event)
export const getNewsCards=async(locale:SiteLocale,ids?:string)=>{
  const cards=(await getNewsPayload(locale)).cards
  if(!ids)return cards
  const selected=new Set(ids.split(',').map(Number))
  return cards.filter(card=>selected.has(card.id))
}
export const getPublicNewsArticle=(locale:SiteLocale,slug:string,preview=false)=>{
  if(preview)throw new Error('Draft previews are available only in the backend admin application.')
  return getNewsPayload(locale,slug).then(data=>data.source)
}
export const getPublicNewsPage=(locale:SiteLocale)=>getNewsPayload(locale).then(data=>data.page)
export const getEditorialPage = (page: 'about' | 'careers', locale: SiteLocale) => {
  if (page === 'careers') return getCareersPayload(locale).then(data => data.content)
  return read<AboutContent & CareersContent>('pages/about/payload', locale)
}
export const getPublicJobs=(locale:SiteLocale,scope:'cards'|'search'='cards')=>{void scope;return getCareersPayload(locale).then(data=>data.jobs)}
export const getPublicJob=(locale:SiteLocale,slug:string)=>getCareersPayload(locale,slug).then(data=>data.job)
export const getSustainabilityCards=(locale:SiteLocale)=>getSustainabilityPayload(locale).then(data=>data.articles)
export const getQualityPageContent=(locale:SiteLocale)=>getQualityPayload(locale).then(data=>data.content)
type LayoutPayload = {
  settings: WebsiteSettings
  home: HomeCmsData
  catalog: NavigationCatalog
  notFoundTranslations: TranslationEntry[]
}
type HomepagePayload = {
  countries: {value: string; label: string}[]
  home: HomeCmsData
  certifications: CertificationData
  certificationLabels: CertificationInterfaceLabels
  meetingEvent: EventRecord | null
}
export const getLayoutPayload = (locale: SiteLocale) => read<LayoutPayload>('layout', locale)
export const getHomepagePayload = (locale: SiteLocale) => read<HomepagePayload>('homepage', locale)

export const getCatalogPayload = (locale: SiteLocale, page: string) =>
  read<{
    catalog: Catalog
    managedContent: ManagedPageContent | null
    certifications: CertificationData
    certificationLabels: CertificationInterfaceLabels
  }>('catalog/payload', locale, {page})

export const getQualityPayload = (locale: SiteLocale) =>
  read<{
    content: QualityPageContent
    certifications: CertificationData
    labels: CertificationInterfaceLabels
    translations: TranslationEntry[]
  }>('pages/quality/payload', locale)

export const getDownloadsPayload = (locale: SiteLocale) =>
  read<{
    content: DownloadsPageContent
    catalog: Catalog
    certifications: CertificationData
    labels: CertificationInterfaceLabels
    fileSizes: Record<string, number>
  }>('downloads/payload', locale)

export const getNewsPayload = (locale: SiteLocale, slug?: string) =>
  read<{
    cards: NewsCardRecord[]
    source: PublicNewsRecord | null
    page: NewsPageContent
    taxonomies: NewsTaxonomy[]
    labels: Record<string, string>
  }>('news/payload', locale, {slug})

export const getSustainabilityPayload = (locale: SiteLocale, slug?: string) =>
  read<{
    articles: SustainabilityCard[]
    record: PublicSustainabilityArticle | null
    page: SustainabilityPageContent
    labels: Record<string, string>
  }>('sustainability/payload', locale, {slug})

export const getCareersPayload = (locale: SiteLocale, slug?: string) =>
  read<{
    content: AboutContent & CareersContent
    jobs: JobCard[]
    job: JobRecord | null
    news: NewsCardRecord[]
    labels: Record<string, string>
  }>('careers/payload', locale, {slug})

export const getEventsPayload = (locale: SiteLocale, page = 'events', slug?: string) =>
  read<{
    events: EventRecord[]
    event: EventRecord | null
    slots: PublicEventSlot[]
    managedContent: ManagedPageContent | null
    translations: TranslationEntry[]
    labels: Record<string, string>
  }>('events/payload', locale, {page, slug})

const getManagedPayload = (key: ManagedPageKey, locale: SiteLocale) =>
  key === 'products' ? getCatalogPayload(locale, 'products').then(data => ({content: data.managedContent!, translations: [] as TranslationEntry[]}))
  : key === 'events' || key === 'book-a-meeting' ? getEventsPayload(locale, key).then(data => ({content: data.managedContent!, translations: data.translations}))
  : key === 'search' ? getSearchPayload('', locale).then(data => ({content: data.content, translations: [] as TranslationEntry[]}))
  : key === '404' ? read<{content:ManagedPageContent;translations:TranslationEntry[]}>('pages/404/payload',locale)
  : read<{
    content: ManagedPageContent
    translations: TranslationEntry[]
  }>(`pages/${key}/payload`, locale)

export const getSearchPayload = (query: string, locale: SiteLocale) =>
  read<{
    content: ManagedPageContent
    labels: Record<string, string>
    results: SearchResult[]
  }>('search/payload', locale, {query})

export const getHomeCatalog=(locale:SiteLocale)=>read<CategoryCatalog>('catalog/home',locale)
