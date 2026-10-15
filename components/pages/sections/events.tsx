import {interfaceLabels,sectionContent} from '@/lib/payload/client'
import type {ManagedPageContent} from '@/lib/cms/types'
import {getEventsPayload} from '@/lib/api/public'
import {EventsPageBody} from '@/components/events/public-content'
import {BookingPageBody} from '@/components/events/booking-route'
import {BookingSelection} from '@/components/events/booking-selection'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 const {name,pageSlug}=definition
 const content=sectionContent<ManagedPageContent>(source,block)
 if(pageSlug==='events'){
  const data=await getEventsPayload(locale)
  return <EventsPageBody events={data.events} locale={locale} labels={{...data.labels,...await interfaceLabels('page.events',locale)}} content={content} section={name}/>
 }
 if(pageSlug==='book-a-meeting'){
  const data=name==='hero'?undefined:await getEventsPayload(locale,'book-a-meeting')
  const widget=data?<BookingSelection events={data.events} slots={data.slots} locale={locale} icon={settings.icon} section={content.sections.find(section=>section.key==='bk-band')!} labels={await interfaceLabels('page.booking',locale)}/>:undefined
  return <BookingPageBody widget={widget} content={content} locale={locale} section={name}/>
 }
}
