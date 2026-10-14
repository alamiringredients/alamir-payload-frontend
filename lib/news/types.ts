import type {ContentDocument} from '@/lib/editor/document'
import type {SiteLocale} from '@/i18n/navigation'
export const newsLocales = ['en','ar','fr'] as const
export type Localized<T> = Record<SiteLocale,T>
export type NewsTaxonomy = {id:number;kind:'category'|'tag';slug:string;sort_order:number;content:Localized<{name:string;description:string}>}
export type NewsVersion = {
  title:ContentDocument;summary:string;cardTitle:ContentDocument;cardSummary:string;body:ContentDocument;hero:string;heroAlt:string;heroCaption:string;
  seoTitle:string;seoDescription:string
}
export type NewsContent = {categoryId:number;tagIds:number[];featured:boolean;date:string;previousSlug:string;nextSlug:string;relatedSlugs:string[];locales:Localized<NewsVersion>}
export type NewsRecord = {id:number;slug:string;revision:number;content:NewsContent;published:Partial<Localized<NewsVersion>>}
export type NewsPageLocale = {kicker:string;title:ContentDocument;description:string;heroAlt:string;empty:string;relatedKicker:string;relatedTitle:ContentDocument;contactKicker:string;contactTitle:ContentDocument;contactDescription:string;eventsKicker:string;eventsTitle:ContentDocument;eventsDescription:string;seoTitle:string;seoDescription:string}
export type NewsPageContent = Localized<NewsPageLocale>&{heroImage:string;sectionVisibility:Record<'hero'|'related'|'contact'|'events',boolean>}
