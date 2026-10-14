import {ContactPageContent} from '@/components/content/managed-page-content'
import {SitePage} from '@/components/site/site-page'
import {getHomeCmsData,getManagedPageContent,getWebsiteSettings} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'
import {ContactForm} from './contact-form'

export async function ContactRoute({locale}:{locale:SiteLocale}){
 const [home,settings,content]=await Promise.all([getHomeCmsData(locale,'shell'),getWebsiteSettings(locale),getManagedPageContent('contact',locale)])
 const form=<ContactForm locale={locale} salesWhatsapp={settings.company.salesWhatsapp}/>
 return <SitePage page="contact" locale={locale} home={home} settings={settings}><ContactPageContent content={content} locale={locale} form={form} company={settings.company}/></SitePage>
}
