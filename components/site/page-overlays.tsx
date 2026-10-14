import { ContentImage } from "./content-image";
import { SmartLink } from "./smart-link";
import { DeferredQuoteForm } from "@/components/enquiries/deferred-quote-form";
import type { EventRecord } from "@/lib/events/types";
import type { SiteLocale } from "@/i18n/navigation";
import { InlineContent } from "@/components/editor/inline-content";

export function EventAnnouncement({
  event,
  locale,
}: {
  event: EventRecord;
  locale: SiteLocale;
}) {
  const start = new Date(event.starts_at),
    end = new Date(event.ends_at),
    short = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: event.timezone || undefined,
    }).formatRange(start, end),
    day = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      timeZone: event.timezone || undefined,
    }).formatRange(start, end),
    month = new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "numeric",
      timeZone: event.timezone || undefined,
    }).format(start);
  return (
    <div
      className="ann"
      id="announce"
      data-event-key={event.slug}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ann-title"
      aria-hidden="true"
    >
      <div className="ann-card">
        <button
          className="ann-close"
          type="button"
          id="announce-close"
          aria-label="Close announcement"
        >
          ×
        </button>
        <figure className="ann-photo">
          <ContentImage
            src={event.content.heroImage}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <figcaption className="ann-stamp">
            <b>{day}</b>
            <span>{month}</span>
          </figcaption>
        </figure>
        <div className="ann-body">
          <span className="ann-kicker">Upcoming event</span>
          <h2 id="ann-title">
            Meet us at{" "}
            <em>
              <InlineContent document={event.content.title[locale]} />.
            </em>
          </h2>
          <ul className="ann-meta">
            <li>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <rect
                  x="2.9"
                  y="4.1"
                  width="14.2"
                  height={13}
                  rx={2}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M2.9 8.1h14.2M6.8 2.6v3M13.2 2.6v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>{short}</span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M10 17.5s5.6-4.9 5.6-9a5.6 5.6 0 10-11.2 0c0 4.1 5.6 9 5.6 9z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx={10}
                  cy="8.4"
                  r="2.1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span>
                {event.content.venue[locale]}
                {event.content.stand[locale]
                  ? ` — ${event.content.stand[locale]}`
                  : ""}
              </span>
            </li>
          </ul>
          <div className="ann-acts">
            <SmartLink
              className="btn"
              href={`/book-a-meeting?event=${event.slug}`}
            >
              Book a meeting
            </SmartLink>
            <SmartLink className="btn ghost" href="/events">
              View all
            </SmartLink>
          </div>
          <p className="ann-skip">
            <button type="button" data-ann-close>
              Not right now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function PageOverlays({locale}:{locale:SiteLocale}) {
  return (
    <>
      <div
        className="rq-backdrop"
        id="rq"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rq-title"
        aria-hidden="true"
      >
        <div className="rq-modal">
          <button
            className="rq-close"
            type="button"
            id="rq-close"
            aria-label="Close"
          >
            <svg
              className="rq-close-icon"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 3l10 10M13 3 3 13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="kicker">Request a quote</div>
          <h2 id="rq-title">
            Tell us what you <em>need.</em>
          </h2>
          <p>
            Sealed 1&nbsp;kg sample plus the technical data sheet within five
            business days. No obligation.
          </p>
          <DeferredQuoteForm locale={locale}/>
        </div>
      </div>
      <div
        className="cookie"
        id="cookie-notice"
        role="region"
        aria-label="Cookie notice"
      >
        <p>
          We use essential cookies to run this site and optional analytics
          cookies to understand which pages buyers use. Read the{" "}
          <SmartLink href="/cookies">cookie notice</SmartLink>.
        </p>
        <div className="acts">
          <button className="btn" type="button" data-cookie="all">
            Accept all
          </button>
          <button className="btn ghost" type="button" data-cookie="essential">
            Essential only
          </button>
        </div>
      </div>
    </>
  );
}
