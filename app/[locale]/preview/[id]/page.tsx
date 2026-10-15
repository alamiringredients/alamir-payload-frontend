import '@/styles/content-pages.css'
import {PageBody} from '@/components/pages/page-body'
import {headers} from 'next/headers'
import {notFound} from 'next/navigation'
import {hasLocale} from 'next-intl'
import {locales} from '@/i18n/navigation'
import {backendOrigin,type CmsPage} from '@/lib/payload/client'
import {getSiteShell,getWebsiteSettings} from '@/lib/api/public'
import {SitePage} from '@/components/site/site-page'

export const metadata={robots:{index:false,follow:false}}
export default async function Preview({params}:{params:Promise<{locale:string;id:string}>}){
 const {locale,id}=await params
 if(!hasLocale(locales,locale) || !/^\d+$/.test(id))notFound()
 const cookie=(await headers()).get('cookie')??''
 const options={headers:{cookie},cache:'no-store' as const}
 const account=await fetch(`${backendOrigin()}/api/users/me`,options)
 if(!account.ok || !(await account.json()).user)notFound()
 const response=await fetch(`${backendOrigin()}/api/pages/${id}?draft=true&locale=all&depth=2`,options)
 if(!response.ok)notFound()
 const page=await response.json() as CmsPage
 const [home,settings]=await Promise.all([getSiteShell(),getWebsiteSettings()])
 return <SitePage page={page.slug!} locale={locale} home={home} settings={settings}><PageBody page={page} locale={locale}/></SitePage>
}
