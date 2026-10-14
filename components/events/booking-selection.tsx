'use client'
import {Suspense,type ComponentProps} from 'react'
import {useSearchParams} from 'next/navigation'
import {BookingWidget} from './booking-widget'
type Props=Omit<ComponentProps<typeof BookingWidget>,'preferredEvent'>
function Selection(props:Props){const event=useSearchParams().get('event')??undefined;return <BookingWidget key={event} {...props} preferredEvent={event}/>}
export function BookingSelection(props:Props){return <Suspense fallback={<BookingWidget {...props}/>}><Selection {...props}/></Suspense>}
