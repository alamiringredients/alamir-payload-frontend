import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {SitePage} from '@/components/site/site-page'
import {getLocale} from 'next-intl/server'
import {locales, type SiteLocale} from '@/i18n/navigation'
import {getLayoutPayload,getManagedPageContent} from '@/lib/api/public'
import {NotFoundPageContent} from '@/components/content/managed-page-content'

export default async function NotFoundPage() {
  const requested = await getLocale()
  const locale = locales.includes(requested as SiteLocale) ? requested as SiteLocale : 'en'
  const [layoutData, sharedStyles, pageStyles] = await Promise.all([
    getLayoutPayload(locale),
    readFile(join(process.cwd(), 'styles/content-pages.css'), 'utf8'),
    readFile(join(process.cwd(), 'styles/pages/document.css'), 'utf8'),
  ])
  // CSS imports here would preload the 404 styles on every route.
  return <><style data-not-found-styles dangerouslySetInnerHTML={{__html: `${sharedStyles}\n${pageStyles}`}}/><SitePage page="404" locale={locale} home={layoutData.home} settings={layoutData.settings}><NotFoundPageContent content={await getManagedPageContent('404',locale)} locale={locale}/></SitePage></>
}
