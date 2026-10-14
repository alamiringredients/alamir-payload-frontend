import {locales} from '@/i18n/navigation'
import {pageLinks} from '@/lib/payload/client'
export {WebsitePage as default,websitePageMetadata as generateMetadata} from '@/components/pages/website-page'

export const revalidate=60
export async function generateStaticParams(){
 return (await pageLinks()).filter(page=>page.slug!=='home' && !['news','search'].includes(page.slug)).flatMap(page=>locales.map(locale=>({locale,slug:page.slug.split('/')})))
}
