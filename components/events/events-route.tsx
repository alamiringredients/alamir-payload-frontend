import {interfaceLabels} from '@/lib/payload/client'
import {RecordLayout} from '@/components/pages/record-layout'
import type {EventRecord} from '@/lib/events/types'
import {pageSchema,siteUrl} from '@/lib/seo/structured-data'
import {textContent} from '@/lib/editor/document'
import {getEventsPayload, getSiteShell, getWebsiteSettings} from '@/lib/api/public'
import {notFound} from 'next/navigation'
import {SitePage} from '@/components/site/site-page'
import {localePath,type SiteLocale} from '@/i18n/navigation'
import {EventDetailBody,EventsPageBody} from './public-content'

export async function EventsRoute({locale,slug}:{locale:SiteLocale;slug?:string}){
 const [payload,home,settings] = await Promise.all([
    getEventsPayload(locale,'events',slug),
    getSiteShell(),
    getWebsiteSettings(),
  ])
 const {events,event,labels}=payload
 if(!slug)return <SitePage page="events" locale={locale} home={home} settings={settings}><EventsPageBody events={events} locale={locale} labels={{...labels,...await interfaceLabels('page.events',locale)}} content={payload.managedContent}/></SitePage>
 if(!event)notFound()
 const body=<RecordLayout<EventRecord> collection="events" slug={event.slug} locale={locale} renderSection={(selected,section)=>EventDetailBody({event:selected,locale,labels,section,brandName:settings.siteName[locale]})}/>;return <SitePage structuredData={pageSchema(localePath(`/events/${event.slug}`,locale),locale,event.content.seo.title[locale],event.content.seo.description[locale],event.kind==='event'?{'@type':'Event',name:textContent(event.content.title[locale]),description:event.content.summary[locale],startDate:event.starts_at,endDate:event.ends_at,location:{'@type':'Place',name:event.content.venue[locale],address:event.content.location[locale]},...(event.content.heroImage?{image:siteUrl(event.content.heroImage)}:{})}:{'@type':'Article',headline:textContent(event.content.title[locale]),description:event.content.summary[locale],...(event.content.heroImage?{image:siteUrl(event.content.heroImage)}:{})})} page={event.kind==='recap'?'events/recap':'events/event'} locale={locale} home={home} settings={settings}>{body}</SitePage>
}
