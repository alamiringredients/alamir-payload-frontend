import {RecordLayout} from '@/components/pages/record-layout'
import type {SustainabilityRecord} from '@/lib/sustainability/types'
import {pageSchema,siteUrl} from '@/lib/seo/structured-data'
import {textContent} from '@/lib/editor/document'
import {getSustainabilityPayload, getSustainabilityArticleMetadata, getPublicSustainabilityPage, getSiteShell, getWebsiteSettings} from '@/lib/api/public'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {SitePage} from '@/components/site/site-page'
import {newsLocales} from '@/lib/news/types'
import {localePath,type SiteLocale} from '@/i18n/navigation'
import {SustainabilityIndexBody,SustainabilityArticleBody} from './sustainability-body'
export type SustainabilityRouteProps={params:Promise<{locale:string;slug?:string}>;preview?:boolean}
export async function sustainabilityMetadata({params}:SustainabilityRouteProps):Promise<Metadata>{
 const {locale,slug}=await params;if(!newsLocales.includes(locale as SiteLocale))return {}
 const l=locale as SiteLocale,record=slug?await getSustainabilityArticleMetadata(l,slug):null,page=slug?undefined:await getPublicSustainabilityPage(),v=record?.published[l]
 if(slug&&!v)return {}
 const path=slug?`/sustainability/${slug}`:'/sustainability',available=record?record.availableLocales:newsLocales,title=v?.seoTitle??page!.seo.title[l],description=v?.seoDescription??page!.seo.description[l]
 return {title,description,openGraph:{title,description,...(v?.gallery[0]?{images:[v.gallery[0].src]}:{})},alternates:{canonical:localePath(path,l),languages:Object.fromEntries(available.map(l=>[l,localePath(path,l)]))}}
}
export async function SustainabilityRoute({params,preview=false}:SustainabilityRouteProps){
 const {locale,slug}=await params;if(!newsLocales.includes(locale as SiteLocale))notFound();const l=locale as SiteLocale
 if(preview)notFound()
 const [{articles,page,record,labels},home,settings] = await Promise.all([
    getSustainabilityPayload(l,slug),
    getSiteShell(),
    getWebsiteSettings(),
  ])
 const version=preview?record?.draft:record?.published[l]
 if(slug&&(!record||!version))notFound()
 const props={articles,page,locale:l,labels}
 const body=record&&version?<RecordLayout<SustainabilityRecord> collection="sustainability" slug={record.slug} locale={l} renderSection={(selected,section)=><SustainabilityArticleBody {...props} record={selected} version={selected.published[l]!} section={section}/>}> <SustainabilityArticleBody {...props} record={record} version={version} section="related"/></RecordLayout>:<SustainabilityIndexBody {...props}/>
 return <SitePage structuredData={preview?undefined:pageSchema(localePath(slug?`/sustainability/${slug}`:'/sustainability',l),l,version?.seoTitle??page.seo.title[l],version?.seoDescription??page.seo.description[l],version?{'@type':'Article',headline:textContent(version.title),datePublished:record?.content.date,dateModified:record?.content.updatedDate,author:{'@id':siteUrl('/#organization')},description:version.summary,...(version.gallery[0]?{image:siteUrl(version.gallery[0].src)}:{}),publisher:{'@id':siteUrl('/#organization')}}:undefined)} page={slug?`sustainability/${slug}`:'sustainability'} locale={l} home={home} settings={settings}>{body}</SitePage>
}
