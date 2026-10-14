import type {NewsCardRecord,NewsCardVersion} from '@/lib/api/public'
import type {ContentNode} from '@/lib/editor/document'
import type {SiteLocale} from '@/i18n/navigation'
import type {Localized,NewsTaxonomy,NewsVersion} from './types'

export type NewsDisplayVersion=NewsVersion & {badge:string;author:string;initials:string;byline:string;dateLabel:string;cardDate:string;readingTime:string}

/** Count visible editorial text, including captions and custom block rows. */
export function readingText(node:ContentNode):string {
  if(node.type==='text')return node.text??''
  if(node.type==='hardBreak')return ' '
  const separator=['paragraph','heading'].includes(node.type)?'':' '
  const children=(node.content??[]).map(readingText).join(separator)
  const attrs=node.attrs??{}
  const labels=[attrs.caption,attrs.captionLabel,attrs.citation,attrs.label].filter(v=>typeof v==='string')
  const rows=Array.isArray(attrs.items)?attrs.items.flatMap(row=>[row.label,row.value].filter(v=>typeof v==='string')):[]
  const table=[...(Array.isArray(attrs.headers)?attrs.headers:[]),...(Array.isArray(attrs.rows)?attrs.rows.flat():[])].filter(v=>typeof v==='string')
  return [children,...labels,...rows,...table].join(' ')
}
function readingMinutes(version:NewsVersion):number {
  const text=[readingText(version.title),version.summary,readingText(version.body)].join(' ')
  const words=text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}’'-]*/gu)?.length??0
  return Math.max(1,Math.ceil(words/200))
}
function authorInitials(name:string):string {
  return name.trim().split(/\s+/u).filter(Boolean).slice(0,2).map(word=>Array.from(word)[0]).join('').toLocaleUpperCase()
}
export function presentNewsVersion(record:Pick<NewsCardRecord,'content'>,version:NewsVersion,locale:SiteLocale,taxonomies:NewsTaxonomy[],siteName:string,labels:Record<string,string>):NewsDisplayVersion {
  const date=new Date(`${record.content.date}T12:00:00Z`)
  const dateLabel=new Intl.DateTimeFormat(locale,{day:'numeric',month:'long',year:'numeric',timeZone:process.env.NEXT_PUBLIC_APP_TIMEZONE || undefined}).format(date)
  const cardDate=new Intl.DateTimeFormat(locale,{month:'short',year:'numeric',timeZone:process.env.NEXT_PUBLIC_APP_TIMEZONE || undefined}).format(date)
  const minutes=readingMinutes(version),plural=new Intl.PluralRules(locale).select(minutes)
  const readingTime=(labels[`readingTime_${plural}`]??labels.readingTime_other??'').replace('{count}',new Intl.NumberFormat(locale).format(minutes))
  return {...version,badge:taxonomies.find(t=>t.kind==='category'&&t.id===record.content.categoryId)?.content[locale].name??'',author:siteName,initials:authorInitials(siteName),dateLabel,cardDate,byline:(labels.publishedByline??'').replace('{date}',dateLabel),readingTime}
}
export type NewsDisplayCard=Omit<NewsCardRecord,'published'> & {published:Partial<Localized<NewsCardVersion & {badge:string;cardDate:string}>>}
export function presentNewsCard(record:NewsCardRecord,locale:SiteLocale,taxonomies:NewsTaxonomy[]):NewsDisplayCard {
  const version=record.published[locale]
  if(!version)return {...record,published:{}}
  const cardDate=new Intl.DateTimeFormat(locale,{month:'short',year:'numeric',timeZone:process.env.NEXT_PUBLIC_APP_TIMEZONE || undefined}).format(new Date(`${record.content.date}T12:00:00Z`))
  const badge=taxonomies.find(t=>t.kind==='category'&&t.id===record.content.categoryId)?.content[locale].name??''
  return {...record,published:{[locale]:{...version,cardDate,badge}}}
}
