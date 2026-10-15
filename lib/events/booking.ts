import type {EventCard, PublicEventSlot} from './types'

export type BookingConfirmation = {
  startsAt: string
  endsAt: string
  event: string
  timezone?: string
}
export type BookingState = {
  eventId: number
  month: string
  selectedDay: string
  slotId: number
  step: 'pick' | 'details' | 'done'
  confirmation: (BookingConfirmation & {email: string}) | null
}
type BookingEvent = Pick<EventCard, 'id' | 'timezone'>

function dayFormatter(timezone?: string) {
  return new Intl.DateTimeFormat('en', {
    timeZone: timezone || undefined, year: 'numeric', month: '2-digit', day: '2-digit',
  })
}
function dayKey(value: string | number, formatter: Intl.DateTimeFormat): string {
  const parts = formatter.formatToParts(new Date(value))
  const part = (type: string) => parts.find(part => part.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
function monthDate(month: string): Date {
  return new Date(`${month}-01T00:00:00Z`)
}
function futureSlots(eventId: number, slots: PublicEventSlot[], now: number) {
  return slots.filter(slot => slot.eventId === eventId && Date.parse(slot.startsAt) > now)
}
export function startBooking(event: BookingEvent | undefined, slots: PublicEventSlot[], now = Date.now()): BookingState {
  const first = futureSlots(event?.id ?? 0, slots, now).reduce<PublicEventSlot | undefined>(
    (first, slot) => !first || Date.parse(slot.startsAt) < Date.parse(first.startsAt) ? slot : first, undefined,
  )
  return {
    eventId: event?.id ?? 0,
    month: dayKey(first?.startsAt ?? now, dayFormatter(event?.timezone)).slice(0, 7),
    selectedDay: '', slotId: 0, step: 'pick', confirmation: null,
  }
}
export type BookingAction =
  | {type: 'event'; event: BookingEvent; slots: PublicEventSlot[]; now?: number}
  | {type: 'month'; offset: number}
  | {type: 'day'; day: string}
  | {type: 'slot'; slot: PublicEventSlot; now?: number}
  | {type: 'back'}
  | {type: 'confirmed'; confirmation: BookingConfirmation; email: string}

export function updateBooking(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'event': return startBooking(action.event, action.slots, action.now)
    case 'month': {
      const month = monthDate(state.month)
      month.setUTCMonth(month.getUTCMonth() + action.offset)
      return {...state, month: month.toISOString().slice(0, 7), selectedDay: '', slotId: 0}
    }
    case 'day': return {...state, selectedDay: action.day, slotId: 0}
    case 'slot':
      return action.slot.eventId === state.eventId && action.slot.status === 'available' && Date.parse(action.slot.startsAt) > (action.now ?? Date.now())
        ? {...state, slotId: action.slot.id, step: 'details'} : state
    case 'back': return {...state, step: 'pick'}
    case 'confirmed': return {...state, step: 'done', confirmation: {...action.confirmation, email: action.email}}
  }
}

export function bookingCalendar(state: BookingState, event: BookingEvent, slots: PublicEventSlot[], locale: string, now = Date.now()) {
  const grouped = new Map<string, PublicEventSlot[]>()
  const formatter = dayFormatter(event.timezone)
  for (const slot of futureSlots(event.id, slots, now)) {
    const key = dayKey(slot.startsAt, formatter)
    const items = grouped.get(key) ?? []
    items.push(slot)
    grouped.set(key, items)
  }
  const month = monthDate(state.month)
  const days = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate()
  const formatDate = (value: string, timezone = event.timezone) => new Intl.DateTimeFormat(locale, {
    dateStyle: 'full', timeStyle: 'short', timeZone: timezone || undefined,
  }).format(new Date(value))
  return {
    monthName: new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric', timeZone: 'UTC'}).format(month),
    offset: (month.getUTCDay() + 6) % 7,
    days: Array.from({length: days}, (_, index) => {
      const key = `${state.month}-${String(index + 1).padStart(2, '0')}`
      const items = grouped.get(key) ?? []
      return {key, day: index + 1, hasSlots: items.length > 0, available: items.some(slot => slot.status === 'available')}
    }),
    selectedSlots: grouped.get(state.selectedDay) ?? [],
    selectedDate: state.selectedDay ? new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(`${state.selectedDay}T00:00:00Z`)) : '',
    chosen: slots.find(slot => slot.id === state.slotId && slot.eventId === event.id),
    formatTime: (value: string) => new Intl.DateTimeFormat(locale, {hour: 'numeric', minute: '2-digit', timeZone: event.timezone || undefined}).format(new Date(value)),
    formatDate,
    confirmationDate: state.confirmation ? formatDate(state.confirmation.startsAt, state.confirmation.timezone ?? event.timezone) : '',
  }
}

export function bookingCalendarLinks(confirmation: BookingConfirmation | null, description: string) {
  if (!confirmation) return {google: '#', ics: '#'}
  const timestamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const start = timestamp(confirmation.startsAt), end = timestamp(confirmation.endsAt)
  const summary = confirmation.event.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, '\\$&')
  const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Alamir//Meeting//EN', 'BEGIN:VEVENT', `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${summary}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(confirmation.event)}&dates=${start}/${end}&details=${encodeURIComponent(description)}`,
    ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`,
  }
}
