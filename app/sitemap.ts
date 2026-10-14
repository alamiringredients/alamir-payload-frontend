import {pageLinks} from '@/lib/payload/client'
import appConfig from '@/config/app'
import type {MetadataRoute} from 'next'
import {getPathname} from '@/i18n/navigation'
import {routing} from '@/i18n/routing'
import {getCatalog,getNewsCards,getPublicEvents,getPublicJobs,getSustainabilityCards} from '@/lib/api/public'

export const revalidate=300
const origin=appConfig.url.replace(/\/$/,'')
const staticPaths=['/','/about','/book-a-meeting','/careers','/contact','/cookies','/downloads','/events','/news','/privacy','/products','/quality','/sustainability','/terms']

export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const cmsPages=await pageLinks()
  const localized=await Promise.all(routing.locales.map(async locale=>{
    const [catalog,news,sustainability,jobs,events]=await Promise.all([
      getCatalog(false,locale,'navigation'),getNewsCards(locale),getSustainabilityCards(locale),getPublicJobs(locale),getPublicEvents(locale),
    ])
    const categoryCounts=new Map<number,number>()
    for(const product of catalog.products)categoryCounts.set(product.category_id,(categoryCounts.get(product.category_id)??0)+1)
    const catalogPaths=catalog.products.flatMap(product=>{
      const category=catalog.categories.find(item=>item.id===product.category_id)
      if(!category)return []
      const path=`/products/${category.slug}/${product.slug}`
      return categoryCounts.get(category.id)===1?[path]:[`/products/${category.slug}`,path]
    })
    return {locale,paths:[
      '/',...events.map(event=>`/events/${event.slug}`),...catalogPaths,...jobs.map(job=>`/careers/${job.slug}`),
      ...news.map(article=>`/news/${article.slug}`),...sustainability.map(article=>`/sustainability/${article.slug}`),
      ...staticPaths,...cmsPages.filter(page=>!['404','search','thank-you'].includes(page.slug!)).map(page=>page.slug==='home'?'/':`/${page.slug}`),
    ]}
  }))
  return localized.flatMap(({locale,paths})=>[...new Set(paths)].map(path=>({
    url:`${origin}${getPathname({href:path,locale})}`,
    changeFrequency:path==='/'?'weekly' as const:'monthly' as const,
    priority:path==='/'?1:(path==='/products'||path==='/quality')?0.9:0.7,
  })))
}
