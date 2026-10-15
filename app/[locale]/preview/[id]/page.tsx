import '@/styles/content-pages.css'
import {WebsitePageContent,type WebsitePageProps} from '@/components/pages/website-page'
import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'
import {hasLocale} from 'next-intl'
import {locales} from '@/i18n/navigation'
import {backendOrigin,preparePage,type Document} from '@/lib/payload/client'

export const metadata={robots:{index:false,follow:false}}
export default async function Preview({params,searchParams}:{params:Promise<{locale:string;id:string}>;searchParams:WebsitePageProps['searchParams']}){
 const {locale,id}=await params
 if(!hasLocale(locales,locale) || !/^\d+$/.test(id))notFound()
 const token=(await cookies()).get('payload-token')?.value
 if(!token)notFound()
 const options={headers:{authorization:`JWT ${token}`},cache:'no-store' as const}
 const account=await fetch(`${backendOrigin()}/api/users/me`,options)
 if(!account.ok || !(await account.json()).user)notFound()
 // Preview this page's draft; shared records still use published content.
 const response=await fetch(`${backendOrigin()}/api/pages/${id}?draft=true&locale=all&depth=0`,options)
 if(!response.ok)notFound()
 const page=await preparePage(await response.json() as Document)
 return <WebsitePageContent page={page} locale={locale} searchParams={searchParams}/>
}
