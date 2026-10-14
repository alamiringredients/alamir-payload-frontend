import '@/styles/pages/article.css'
import {redirect} from 'next/navigation'
import {localePath,type SiteLocale} from '@/i18n/navigation'

type PageProps={params:Promise<{locale:string}>}
export default async function Page({params}:PageProps){const {locale}=await params;redirect(localePath('/events',locale as SiteLocale))}
