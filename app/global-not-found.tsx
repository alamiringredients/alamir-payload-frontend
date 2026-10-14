import {NextIntlClientProvider} from 'next-intl'
import {NotFoundPageContent} from '@/components/content/managed-page-content'
import {SitePage} from '@/components/site/site-page'
import {fontPreloads,fontStylesheets} from '@/lib/site-font-delivery'
import {sans} from '@/lib/site-fonts'
import {getLayoutPayload,getManagedPageContent} from '@/lib/api/public'
import './site.css'
import './shell.css'
import '@/styles/serif-font.css'
import '@/styles/content-pages.css'
import '@/styles/pages/document.css'

export default async function GlobalNotFound(){
  const locale='en'
  const layoutData=await getLayoutPayload(locale)
  return <html lang={locale} className={`js ${sans.variable}`} data-scroll-behavior="smooth">
    <head>
      {fontPreloads.latin.map(href=><link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous"/>)}
      <link rel="stylesheet" href={fontStylesheets.latin}/>
    </head>
    <body><NextIntlClientProvider locale={locale}>
      <SitePage page="404" locale={locale} home={layoutData.home} settings={layoutData.settings}>
        <NotFoundPageContent content={await getManagedPageContent('404',locale)} locale={locale}/>
      </SitePage>
    </NextIntlClientProvider></body>
  </html>
}
