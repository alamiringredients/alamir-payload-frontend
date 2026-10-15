import {recordIdentities} from '@/lib/payload/client'
import '@/styles/pages/sustainability.css'
import '@/styles/pages/sustainability-detail.css'
import '@/styles/pages/sustainability-cms.css'
import {SustainabilityRoute,sustainabilityMetadata} from '@/components/sustainability/sustainability-route'
export const generateMetadata=sustainabilityMetadata
export default SustainabilityRoute

export async function generateStaticParams(){return (await recordIdentities('sustainability')).map(({slug})=>({slug}))}
