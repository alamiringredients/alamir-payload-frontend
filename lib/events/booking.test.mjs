import assert from 'node:assert/strict'
import {test} from 'node:test'
import {bookingCalendar, bookingCalendarLinks, startBooking, updateBooking} from './booking.ts'

const now = Date.parse('2026-10-01T00:00:00Z')
const event = {id: 1, timezone: 'Africa/Cairo'}
const slot = {id: 10, eventId: 1, startsAt: '2026-11-01T00:30:00Z', endsAt: '2026-11-01T01:00:00Z', status: 'available'}

test('calendar uses the event month and day across a browser month disagreement', () => {
  const previousTimezone = process.env.TZ
  process.env.TZ = 'America/Los_Angeles'
  try {
    const state = startBooking(event, [slot], now)
    const calendar = bookingCalendar(state, event, [slot], 'en', now)
    assert.equal(new Date(slot.startsAt).getMonth(), 9)
    assert.equal(state.month, '2026-11')
    assert.equal(calendar.monthName, 'November 2026')
    assert.equal(calendar.offset, 6)
    assert.equal(calendar.days.length, 30)
    assert.equal(calendar.days[0].available, true)
    assert.equal(calendar.days[1].hasSlots, false)
    const selected = updateBooking(state, {type: 'day', day: '2026-11-01'})
    assert.deepEqual(bookingCalendar(selected, event, [slot], 'en', now).selectedSlots, [slot])
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ
    else process.env.TZ = previousTimezone
  }
})

test('booking permits available future slots and resets selection when changing events', () => {
  const state = startBooking(event, [slot], now)
  for (const unavailable of [
    {...slot, status: 'reserved'},
    {...slot, eventId: 2},
    {...slot, startsAt: '2026-09-01T00:00:00Z'},
  ]) assert.equal(updateBooking(state, {type: 'slot', slot: unavailable, now}), state)
  const details = updateBooking(state, {type: 'slot', slot, now})
  assert.equal(details.step, 'details')
  assert.equal(details.slotId, slot.id)
  const anotherEvent = {id: 2, timezone: 'Africa/Cairo'}
  const anotherSlot = {...slot, id: 20, eventId: 2, startsAt: '2027-01-03T12:00:00Z'}
  const changed = updateBooking(details, {type: 'event', event: anotherEvent, slots: [slot, anotherSlot], now})
  assert.equal(changed.eventId, 2)
  assert.equal(changed.month, '2027-01')
  assert.equal(changed.step, 'pick')
  assert.equal(changed.slotId, 0)
  assert.equal(changed.selectedDay, '')
  assert.equal(changed.confirmation, null)
  const previous = updateBooking(changed, {type: 'month', offset: -1})
  assert.equal(previous.month, '2026-12')
})

test('confirmation display and exports preserve actual instants and escape calendar text', () => {
  const confirmation = {
    startsAt: '2026-11-01T10:30:00.123+02:00',
    endsAt: '2026-11-01T11:00:00.456+02:00',
    event: 'Alamir, export; team\\meeting\r\nSecond line',
    timezone: 'UTC',
  }
  const state = updateBooking(startBooking(event, [slot], now), {type: 'confirmed', confirmation, email: 'visitor@example.com'})
  assert.equal(state.step, 'done')
  assert.equal(state.confirmation.email, 'visitor@example.com')
  assert.equal(bookingCalendar(state, event, [slot], 'en', now).confirmationDate,
    new Intl.DateTimeFormat('en', {dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC'}).format(new Date(confirmation.startsAt)))
  const links = bookingCalendarLinks(state.confirmation, 'Meet the team')
  const google = new URL(links.google)
  assert.equal(google.searchParams.get('dates'), '20261101T083000Z/20261101T090000Z')
  assert.equal(google.searchParams.get('text'), confirmation.event)
  const calendar = decodeURIComponent(links.ics.split(',')[1])
  assert.ok(calendar.includes('DTSTART:20261101T083000Z\r\n'))
  assert.ok(calendar.includes('DTEND:20261101T090000Z\r\n'))
  assert.ok(calendar.includes('SUMMARY:Alamir\\, export\\; team\\\\meeting\\nSecond line\r\n'))
  assert.equal(calendar.replaceAll('\r\n', '').includes('\n'), false)
  assert.ok(calendar.endsWith('END:VCALENDAR\r\n'))
})
