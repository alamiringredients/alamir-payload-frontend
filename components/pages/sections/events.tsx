import {sectionContent} from '@/lib/payload/client'
import type {ManagedPageContent} from '@/lib/cms/types'
import {getEventsPayload} from '@/lib/api/public'
import {renderManagedPage} from '@/lib/cms/render'
import {EventsPageBody} from '@/components/events/public-content'
import {BookingPageBody} from '@/components/events/booking-route'
import {BookingSelection} from '@/components/events/booking-selection'
import {mainSections,type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings,context}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='events'){
  const data=await getEventsPayload(locale),content=sectionContent<ManagedPageContent>(source,block)
  return mainSections(renderManagedPage(EventsPageBody({events:data.events,locale}),content,locale))[['hero','related','enquiry','more'].indexOf(name)]
 }
 if(pageSlug==='book-a-meeting'){
  const data=await getEventsPayload(locale,'book-a-meeting'),content=sectionContent<ManagedPageContent>(source,block)
  const widget=<BookingSelection events={data.events} slots={data.slots} locale={locale} icon={settings.icon}/>
  return mainSections(renderManagedPage(BookingPageBody(widget),content,locale))[name==='hero'?0:1]
 }

}
