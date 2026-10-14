import {RecordLayout} from '@/components/pages/record-layout'
import type {NewsRecord} from '@/lib/news/types'
import {pageSchema,siteUrl} from '@/lib/seo/structured-data'
import {textContent} from '@/lib/editor/document'
import {getNewsPayload, getPublicNewsArticle, getPublicNewsPage, getHomeCmsData, getWebsiteSettings} from '@/lib/api/public'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {presentNewsCard,presentNewsVersion} from '@/lib/news/presentation'
import {newsLocales} from '@/lib/news/types'
import {SitePage} from '@/components/site/site-page'
import {NewsArticleBody,NewsIndexBody} from './news-body'
import {localePath,type SiteLocale} from '@/i18n/navigation'
export type NewsRouteProps={params:Promise<{locale:string;slug?:string}>;searchParams?:Promise<{tag?:string|string[]}>;preview?:boolean}
export async function newsMetadata({params}:NewsRouteProps):Promise<Metadata>{
  const {locale,slug}=await params
  if(!newsLocales.includes(locale as SiteLocale))return {}
  const l=locale as SiteLocale,record=slug?await getPublicNewsArticle(l,slug):undefined,page=slug?undefined:await getPublicNewsPage(l),v=slug?record?.published[l]:page?.[l]
  if(!v)return {}
  const path=slug?`/news/${slug}`:'/news',available=record?record.availableLocales:newsLocales
  const image=slug?record?.published[l]?.hero:page?.heroImage
  return {title:v.seoTitle,description:v.seoDescription,openGraph:{title:v.seoTitle,description:v.seoDescription,...(image?{images:[image]}:{})},alternates:{canonical:localePath(path,l),languages:Object.fromEntries(available.map(l=>[l,localePath(path,l)]))}}
}
export async function NewsRoute({params,searchParams,preview=false}:NewsRouteProps){
  const {locale,slug}=await params;if(!newsLocales.includes(locale as SiteLocale))notFound();const l=locale as SiteLocale
  if(preview)notFound()
  const [{cards,page,taxonomies,source,labels},home,settings] = await Promise.all([
    getNewsPayload(l,slug),
    getHomeCmsData(l,'shell'),
    getWebsiteSettings(l),
  ])
  const articles=cards.map(a=>presentNewsCard(a,l,taxonomies))
  const rawVersion=preview?source?.draft:source?.published[l]
  const version=source&&rawVersion?presentNewsVersion(source,rawVersion,l,taxonomies,settings.siteName[l],labels):undefined
  const record=source?presentNewsCard(source,l,taxonomies):undefined
  if(slug&&(!record||!version))notFound()
  const requestedTag=slug?undefined:(await searchParams)?.tag
  const tag=Array.isArray(requestedTag)?requestedTag[0]:requestedTag
  const body=record&&version?<RecordLayout<NewsRecord> collection="news" slug={record.slug} locale={l} renderSection={(selected,section)=><NewsArticleBody record={presentNewsCard(selected,l,taxonomies)} version={presentNewsVersion(selected,selected.published[l]!,l,taxonomies,settings.siteName[l],labels)} articles={articles} taxonomies={taxonomies} page={page[l]} sectionVisibility={page.sectionVisibility} labels={labels} locale={l} section={section}/>}/>:<NewsIndexBody articles={articles} taxonomies={taxonomies} page={page[l]} heroImage={page.heroImage} sectionVisibility={page.sectionVisibility} labels={labels} locale={l} tag={tag}/>
  return <SitePage structuredData={preview?undefined:pageSchema(localePath(slug?`/news/${slug}`:'/news',l),l,rawVersion?.seoTitle??page[l].seoTitle,rawVersion?.seoDescription??page[l].seoDescription,rawVersion?{'@type':'Article',headline:textContent(rawVersion.title),datePublished:source?.content.date,author:{'@id':siteUrl('/#organization')},description:rawVersion.summary,...(rawVersion.hero?{image:siteUrl(rawVersion.hero)}:{}),publisher:{'@id':siteUrl('/#organization')}}:undefined)} page={slug?`news/${slug}`:'news'} locale={l} home={home} settings={settings}>{body}</SitePage>
}
