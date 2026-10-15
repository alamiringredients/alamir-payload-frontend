"use client";
import {InlineContent} from '@/components/editor/inline-content'
import type {ManagedSection} from '@/lib/cms/managed-page'
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
  section: ManagedSection;
  labels: Record<string, string>;
}) {
  const copy = (field: string) => section.rich[field] ? textContent(section.rich[field][locale]) : section.text[field]?.[locale] ?? ''
  const rich = (field: string) => section.rich[field] ? <InlineContent document={section.rich[field][locale]}/> : null
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
  const {google: calendarHref, ics} = bookingCalendarLinks(done, copy('text29'));
  return (
    <div className="bk" id="bk">
      <div className="bk-card" data-step="pick" hidden={step !== "pick"}>
        <aside className="bk-side">
          <Link className="bk-org" href="/">
            {icon && <Image src={icon} alt="" width={26} height={26} />}
            <span>{copy('text')}</span>
          </Link>
          <h2 className="bk-title">{copy('heading')}</h2>
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
              <span>{copy('text3')}</span>
            </li>
            <li>
              <span aria-hidden="true">⌖</span>
              <span>{event.content.location[locale]}</span>
            </li>
          </ul>
          <p className="bk-note">
            {copy('body')}
          </p>
          <div className="bk-side-foot">
            <p>{copy('body2')}</p>
            <Link href="/contact">
              {copy('sendEnquiry')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>
        <div className="bk-cal">
          <p className="bk-h">{copy('body3')}</p>
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
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
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
            <span className="dot" aria-hidden="true" /> {copy('text17')}
          </p>
        </div>
        <div className="bk-slots">
          <p className="bk-h">
            {calendar.selectedDate || copy('body4')}
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
                {copy('body5')}
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
            <span>{copy('text')}</span>
          </Link>
          <h2 className="bk-title">
            {textContent(event.content.title[locale])}
          </h2>
          <ul className="bk-meta">
            <li>
              <span>◷</span>
              <span>{copy('text3')}</span>
            </li>
            <li className="on">
              <span>□</span>
              <span>{chosen ? formatDate(chosen.startsAt) : ""}</span>
            </li>
          </ul>
          <p className="bk-note">
            {copy('body6')}
          </p>
        </aside>
        <div className="bk-fields">
          <p className="bk-h">{copy('body7')}</p>
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
            {rich('heading2')}
          </h2>
          <p className="bk-done-lead">
            {rich('body8')} <b>{done?.email}</b>
          </p>
          <div className="bk-recap">
            <div>
              <span>{copy('meeting')}</span>
              <b>{done?.event}</b>
            </div>
            <div>
              <span>{copy('when')}</span>
              <b>{calendar.confirmationDate}</b>
            </div>
            <div>
              <span>{copy('where')}</span>
              <b>{copy('text32')}</b>
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
            <Link href="/">{copy('backHome')}</Link> ·{" "}
            <Link href="/events">{copy('events')}</Link> ·{" "}
            <Link href="/downloads">{copy('browseDownloads')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
