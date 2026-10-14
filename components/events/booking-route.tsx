import type {ReactNode} from 'react'
import {PageHero} from '@/components/site/page-hero'
import {SitePage} from '@/components/site/site-page'
import {renderManagedPage} from '@/lib/cms/render'
import {BookingSelection} from './booking-selection'
import {getEventsPayload, getHomeCmsData, getWebsiteSettings} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'

export function BookingPageBody(widget:ReactNode){return <main id="main"><PageHero className="bk-hero" image="/assets/photos/book-meeting.webp" imageAlt="An Alamir Ingredients export manager and a buyer reviewing a specification sheet beside tomato and mango samples"><div className="kicker">Book a meeting</div><h1>Thirty minutes with the <em>export team.</em></h1><p>Pick a slot that works in your time zone. We will confirm by email with a calendar invite, and if you are meeting us at a show the same slot holds a seat on the stand.</p></PageHero><section className="band bk-band"><div className="wrap">{widget}</div></section></main>}
export async function BookingRoute({locale}:{locale:SiteLocale}){
 const [payload,home,settings] = await Promise.all([
    getEventsPayload(locale,'book-a-meeting'),
    getHomeCmsData(locale,'shell'),
    getWebsiteSettings(locale),
  ])
 const {events,slots,labels}=payload
 const widget=<BookingSelection events={events} slots={slots} locale={locale} icon={settings.icon}/>
 const content=BookingPageBody(widget)
 return <SitePage page="book-a-meeting" locale={locale} home={home} settings={settings}>{payload.managedContent?renderManagedPage(content,payload.managedContent,locale):content}</SitePage>
}
