import {FormScopeProvider} from '@/components/forms/forms-provider'
import {getForms,getFormCountries} from '@/lib/forms/server'
import type {FormPurpose} from '@/lib/forms/types'
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'
import {locales,localePath} from '@/i18n/navigation'
import {pageBySlug} from '@/lib/payload/client'
import {getSiteShell,getWebsiteSettings} from '@/lib/api/public'
import {SitePage} from '@/components/site/site-page'
import {PageBody} from '@/components/pages/page-body'
import type {Metadata} from 'next'
import type {LocalizedValue} from '@/lib/cms/types'

export type WebsitePageProps={params:Promise<{locale:string;slug:string[]}>;searchParams:Promise<{q?:string;tag?:string}>}
export async function websitePageMetadata({params}:WebsitePageProps):Promise<Metadata>{
 const {locale,slug}=await params
 if(!hasLocale(locales,locale))notFound()
 const path=slug.join('/')
 const page=await pageBySlug(path)
 if(!page)notFound()
 const seo=page.page?.seo as {title?:LocalizedValue;description?:LocalizedValue;socialImage?:{url?:string}}|undefined
 const copy=page.page?.copy as {seoTitle?:LocalizedValue;seoDescription?:LocalizedValue}|undefined
 const title=seo?.title?.[locale] || copy?.seoTitle?.[locale] || page.title[locale] || page.title.en
 const description=seo?.description?.[locale] || copy?.seoDescription?.[locale]
 const canonicalPath=`/${page.slug}`
 return {title,description,openGraph:{title,description,...(seo?.socialImage?.url?{images:[seo.socialImage.url]}:{})},alternates:{canonical:localePath(canonicalPath,locale),languages:Object.fromEntries(locales.map(language=>[language,localePath(canonicalPath,language)]))}}
}
export async function WebsitePage({params,searchParams}:WebsitePageProps){
 const {locale,slug}=await params
 if(!hasLocale(locales,locale))notFound()
 const path=slug.join('/')
 const page=await pageBySlug(path)
 if(!page)notFound()
 const [home,settings]=await Promise.all([getSiteShell(),getWebsiteSettings()])
 const purpose=({"contact-page":'contact',"careers-page":'application',"search-page":'search'} as Record<string,FormPurpose>)[page.sourceKey??'']
 const forms=purpose?await getForms(locale,{purpose,collection:'pages',ownerId:page.id}):[]
 const input=page.layout.some(block=>block.blockType.startsWith('search-') || block.blockType.startsWith('news-'))?await searchParams:{}
 return <SitePage page={path} pageStyle={page.sourceKey?.replace(/-page$/, '').replace(/^booking$/, 'book-a-meeting') ?? ''} locale={locale} home={home} settings={settings}><FormScopeProvider forms={forms} countries={await getFormCountries(forms,locale)}><PageBody page={page} locale={locale} context={{query:input.q,tag:input.tag}}/></FormScopeProvider></SitePage>
}
