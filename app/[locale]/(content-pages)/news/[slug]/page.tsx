import '@/styles/pages/article.css'
import {NewsRoute,newsMetadata,type NewsRouteProps} from '@/components/news/news-route'
export const generateMetadata=newsMetadata
export default function Page(props:NewsRouteProps){return NewsRoute(props)}

import {getNewsCards} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'
export async function generateStaticParams({params}:{params:{locale:string}}){return (await getNewsCards(params.locale as SiteLocale)).map(({slug})=>({slug}))}
