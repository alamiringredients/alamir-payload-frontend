import {recordIdentities} from '@/lib/payload/client'
import {RecordLayout} from '@/components/pages/record-layout'
import type {JobRecord} from '@/lib/careers/types'
import {pageSchema} from '@/lib/seo/structured-data'
import '@/styles/pages/career-detail.css'
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'
import {locales,localePath} from '@/i18n/navigation'
import {getJobMetadata, getCareersPayload, getSiteShell, getWebsiteSettings} from '@/lib/api/public'
import {CareerJobBody} from '@/components/careers/public-content'
import {SitePage} from '@/components/site/site-page'
import {FormScopeProvider} from '@/components/forms/forms-provider'
import {getForms,getFormCountries} from '@/lib/forms/server'

type Props={params:Promise<{locale:string;slug:string}>}
export async function generateStaticParams(){return (await recordIdentities('jobs')).map(({slug})=>({slug}))}
export async function generateMetadata({params}:Props){
  const {locale,slug}=await params
  if(!hasLocale(locales,locale))notFound()
  const job=await getJobMetadata(locale,slug)
  if(!job)notFound()
  return {title:job.content[locale].title,description:job.content[locale].summary,alternates:{canonical:localePath(`/careers/${slug}`,locale)}}
}
export default async function Page({params}:Props){
  const {locale,slug}=await params
  if(!hasLocale(locales,locale))notFound()
  const [{content,jobs,job,labels},home,settings,forms] = await Promise.all([
    getCareersPayload(locale,slug),
    getSiteShell(),
    getWebsiteSettings(),
    getForms(locale,{purpose:'application',collection:'jobs',slug}),
  ])
  if(!job)notFound()
  return <FormScopeProvider forms={forms} countries={await getFormCountries(forms,locale)}><SitePage structuredData={pageSchema(localePath(`/careers/${slug}`,locale),locale,job.content[locale].title,job.content[locale].summary)} page={`careers/${slug}`} locale={locale} home={home} settings={settings}><RecordLayout<JobRecord> collection="jobs" slug={job.slug} locale={locale} renderSection={(selected,section)=><CareerJobBody job={selected} jobs={jobs} content={content} locale={locale} labels={labels} section={section}/>}/></SitePage></FormScopeProvider>
}
