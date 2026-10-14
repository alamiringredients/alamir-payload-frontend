import '@/styles/pages/sustainability.css'
import '@/styles/pages/sustainability-detail.css'
import '@/styles/pages/sustainability-cms.css'
import {SustainabilityRoute,sustainabilityMetadata} from '@/components/sustainability/sustainability-route'
export const generateMetadata=sustainabilityMetadata
export default SustainabilityRoute

import {getSustainabilityCards} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'
export async function generateStaticParams({params}:{params:{locale:string}}){return (await getSustainabilityCards(params.locale as SiteLocale)).map(({slug})=>({slug}))}
