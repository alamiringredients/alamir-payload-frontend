import {recordIdentities} from '@/lib/payload/client'
import '@/styles/pages/article.css'
import {NewsRoute,newsMetadata,type NewsRouteProps} from '@/components/news/news-route'
export const generateMetadata=newsMetadata
export default function Page(props:NewsRouteProps){return NewsRoute(props)}

export async function generateStaticParams(){return (await recordIdentities('news')).map(({slug})=>({slug}))}
