"use client";
import {InlineContent} from '@/components/editor/inline-content'
import {sectionText} from '@/lib/cms/section-text'
import type {HomeSectionContent} from '@/lib/cms/types'
import {useFormDefinition} from '@/components/forms/forms-provider'
import {ManagedForm} from '@/components/forms/managed-form'
import {useReducer} from "react";
import {startBooking, updateBooking, bookingCalendar, bookingCalendarLinks} from "@/lib/events/booking";
import { SmartLink as Link } from "@/components/site/smart-link";
import Image from "next/image";


import type { EventCard, PublicEventSlot } from "@/lib/events/types";
import type { SiteLocale } from "@/i18n/navigation";
import { textContent } from "@/lib/editor/document";

import { FormActions } from "@/components/forms/form-actions";

export function BookingWidget({
  events,
  slots,
  locale,
  preferredEvent,
  icon,
  section,
  labels,
}: {
  events: EventCard[];
  slots: PublicEventSlot[];
  locale: SiteLocale;
  preferredEvent?: string;
  icon: string;
  section: HomeSectionContent;
  labels: Record<string, string>;
}) {
  const copy = (source: string) => sectionText(section, source, locale)
  const rich = (source: string) => {
    const field = section.richTexts?.find(field => field.source === source)
    return field ? <InlineContent document={field.values[locale]}/> : null
  }
  const first =
    events.find((event) => event.slug === preferredEvent) ?? events[0];
  const [booking, dispatch] = useReducer(updateBooking, undefined, () => startBooking(first, slots));
  const {eventId, selectedDay, slotId, step, confirmation: done} = booking;
  const event = events.find(item => item.id === eventId) ?? first;
  const {definition: formDefinition} = useFormDefinition("reservation", eventId);
  if (!event)
    return (
      <div className="bk-card">
        <div className="bk-done">
          <h2>{labels.noTimes}</h2>
          <p>
            <Link href="/contact">{labels.enquiryInstead}</Link>
          </p>
        </div>
      </div>
    );
  const calendar = bookingCalendar(booking, event, slots, locale);
  const {monthName, chosen, formatTime, formatDate} = calendar;
  const {google: calendarHref, ics} = bookingCalendarLinks(done, copy('Meet the export team — 30 minutes'));
  return (
    <div className="bk" id="bk">
      <div className="bk-card" data-step="pick" hidden={step !== "pick"}>
        <aside className="bk-side">
          <Link className="bk-org" href="/">
            {icon && <Image src={icon} alt="" width={26} height={26} />}
            <span>{copy('Alamir Ingredients')}</span>
          </Link>
          <h2 className="bk-title">{copy('Meet the export team')}</h2>
          {events.length > 1 && (
            <label className="bk-event-select">
              <span>{labels.event}</span>
              <select
                value={eventId}
                onChange={e => {
                  const selected = events.find(item => item.id === Number(e.target.value));
                  if (selected) dispatch({type: "event", event: selected, slots});
                }}
              >
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {textContent(item.content.title[locale])}
                  </option>
                ))}
              </select>
            </label>
          )}
          <ul className="bk-meta">
            <li>
              <span aria-hidden="true">◷</span>
              <span>{copy('30 minutes')}</span>
            </li>
            <li>
              <span aria-hidden="true">⌖</span>
              <span>{event.content.location[locale]}</span>
            </li>
          </ul>
          <p className="bk-note">
            {copy('Bring your specification — target Brix, break profile, packaging format and destination port. We will come with the matching data sheets and an indicative price.')}
          </p>
          <div className="bk-side-foot">
            <p>{copy('Prefer to write instead?')}</p>
            <Link href="/contact">
              {copy('Send an enquiry')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>
        <div className="bk-cal">
          <p className="bk-h">{copy('Select a date')}</p>
          <div className="bk-month">
            <button
              className="bk-nav"
              type="button"
              onClick={() =>
                dispatch({type: "month", offset: -1})
              }
              aria-label={labels.previousMonth}
            >
              ‹
            </button>
            <p className="bk-mname" aria-live="polite">
              {monthName}
            </p>
            <button
              className="bk-nav"
              type="button"
              onClick={() =>
                dispatch({type: "month", offset: 1})
              }
              aria-label={labels.nextMonth}
            >
              ›
            </button>
          </div>
          <div className="bk-dow" aria-hidden="true">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{copy(day)}</span>
            ))}
          </div>
          <div className="bk-grid" role="group" aria-label={labels.availableDates}>
            {Array.from({ length: calendar.offset }, (_, index) => (
              <span className="pad" key={`pad-${index}`} />
            ))}
            {calendar.days.map(({key, day, available, hasSlots}) => (
              <button
                key={key}
                type="button"
                className={`bk-day${available ? " free" : ""}${key === selectedDay ? " sel" : ""}`}
                disabled={!hasSlots}
                onClick={() => dispatch({type: "day", day: key})}
                aria-label={`${key}: ${available ? labels.available : labels.fullyReserved}`}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="bk-legend">
            <span className="dot" aria-hidden="true" /> {copy('Days with slots left. Weekends and public holidays are closed.')}
          </p>
        </div>
        <div className="bk-slots">
          <p className="bk-h">
            {calendar.selectedDate || copy('Pick a date first')}
          </p>
          <div className="bk-times" role="group">
            {selectedDay ? (
              calendar.selectedSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className="bk-slot"
                  disabled={slot.status === "reserved"}
                  onClick={() => dispatch({type: "slot", slot})}
                >
                  {formatTime(slot.startsAt)}
                  {slot.status === "reserved" ? ` · ${labels.reserved}` : ""}
                </button>
              ))
            ) : (
              <p className="bk-empty">
                {copy('Choose a day on the calendar and the open slots appear here.')}
              </p>
            )}
          </div>
        </div>
      </div>
      <div
        className="bk-card bk-form-card"
        data-step="details"
        hidden={step !== "details"}
      >
        <aside className="bk-side">
          <button
            className="bk-back"
            type="button"
            onClick={() => dispatch({type: "back"})}
          >
            ← {labels.back}
          </button>
          <Link className="bk-org" href="/">
            {icon && <Image src={icon} alt="" width={26} height={26} />}
            <span>{copy('Alamir Ingredients')}</span>
          </Link>
          <h2 className="bk-title">
            {textContent(event.content.title[locale])}
          </h2>
          <ul className="bk-meta">
            <li>
              <span>◷</span>
              <span>{copy('30 minutes')}</span>
            </li>
            <li className="on">
              <span>□</span>
              <span>{chosen ? formatDate(chosen.startsAt) : ""}</span>
            </li>
          </ul>
          <p className="bk-note">
            {copy('Nothing is held until you confirm. The invite lands in your inbox straight after.')}
          </p>
        </aside>
        <div className="bk-fields">
          <p className="bk-h">{copy('Confirm your details')}</p>
          <ManagedForm key={eventId} purpose="reservation" locale={locale} ownerId={eventId} slotId={slotId} actions={<button className="btn ghost" type="button" onClick={()=>dispatch({type: "back"})}>{formDefinition?.ui?.pickAnotherSlot}</button>} onSuccess={result=>{if(result.data)dispatch({type: 'confirmed', confirmation: result.data, email: String(result.values.email??'')})}}/>

        </div>
      </div>
      <div
        className="bk-card bk-done-card"
        data-step="done"
        hidden={step !== "done"}
      >
        <div className="bk-done">
          <div className="mark" aria-hidden="true">
            ✓
          </div>
          <h2>
            {rich('You’re booked.')}
          </h2>
          <p className="bk-done-lead">
            {rich('A calendar invite and a joining link are on their way to your inbox. If anything changes, reply to that email and we will move it.')} <b>{done?.email}</b>
          </p>
          <div className="bk-recap">
            <div>
              <span>{copy('Meeting')}</span>
              <b>{done?.event}</b>
            </div>
            <div>
              <span>{copy('When')}</span>
              <b>{calendar.confirmationDate}</b>
            </div>
            <div>
              <span>{copy('Where')}</span>
              <b>{copy('Video call — link in the invite')}</b>
            </div>
          </div>
          <FormActions>
            <a className="btn" download="alamir-meeting.ics" href={ics}>
              {labels.addCalendar}
            </a>
            <a
              className="btn ghost"
              target="_blank"
              rel="noopener"
              href={calendarHref}
            >
              {labels.addGoogleCalendar}
            </a>
          </FormActions>
          <p className="bk-done-foot">
            <Link href="/">{copy('Back to home')}</Link> ·{" "}
            <Link href="/events">{copy('Company news & events')}</Link> ·{" "}
            <Link href="/downloads">{copy('Browse downloads')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
