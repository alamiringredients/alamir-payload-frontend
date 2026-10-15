import {Fragment,type ReactNode} from 'react'
import type {ManagedPageContent} from '@/lib/cms/types'
import {SectionCopy} from '@/components/editor/section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import { ContentImage } from "@/components/site/content-image";
import { SmartLink } from "@/components/site/smart-link";
import { PageHero } from "@/components/site/page-hero";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import type { EventRecord } from "@/lib/events/types";
import type { SiteLocale } from "@/i18n/navigation";
import {
  ContentRenderer,
  InlineContent,
} from "@/components/editor/content-renderer";
import { documentHeadings, textContent } from "@/lib/editor/document";
import { ShareLinks } from "@/components/news/news-interactions";
import {
  CardGrid,
  ContentSection,
  SectionHeading,
} from "@/components/site/content-section";
import { FormActions } from "@/components/forms/form-actions";

const eventPath = (event: EventRecord) => `/events/${event.slug}`;
function EventCard({
  event,
  locale,
  labels,
}: {
  labels: Record<string,string>;
  event: EventRecord;
  locale: SiteLocale;
}) {
  const date = new Date(event.starts_at),
    day = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      timeZone: event.timezone || undefined,
    }).format(date),
    month = new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: event.timezone || undefined,
    }).format(date);
  return (
    <SmartLink className="evcard" href={eventPath(event)}>
      <figure className="evcard-shot">
        <ContentImage
          src={event.content.heroImage}
          alt={event.content.heroAlt[locale]}
          loading="lazy"
          decoding="async"
        />
        <span className="evcard-when">
          <b>{day}</b>
          <i>{month}</i>
        </span>
      </figure>
      <div className="evcard-body">
        <span className="evcard-nm">
          {textContent(event.content.title[locale])}
        </span>
        <span className="evcard-st">{event.content.summary[locale]}</span>
        <span className="evcard-go">
          {event.kind === "recap" ? labels.recap : labels.details} →
        </span>
      </div>
    </SmartLink>
  );
}

export function EventsPageBody({
  events,
  locale,
  labels,
  content,
  section: selectedSection,
}: {
    labels: Record<string, string>;
    events: EventRecord[];
    locale: SiteLocale;
    content: ManagedPageContent;
  section?: string;
}) {
  const now = new Date(),
    upcoming = events.filter(
      (event) =>
        event.published &&
        event.kind === "event" &&
        new Date(event.ends_at) > now,
    ),
    past = events.filter(
      (event) =>
        event.published &&
        (event.kind === "recap" || new Date(event.ends_at) <= now),
    );
  const sections: Record<string, () => ReactNode> = {
    hero: () => {
      const section = content.sections.find(item => item.key === 'hero');
      if (!section?.enabled) return null;
      return (<PageHero image={section.assets[0]?.value} imageAlt="">
        <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
        <h1><SectionCopy section={section} locale={locale} richIndex={0} /></h1>
        <p><SectionCopy section={section} locale={locale} richIndex={1} /></p>
      </PageHero>);
    },
    related: () => {
      const section = content.sections.find(item => item.key === 'section-2');
      if (!section?.enabled) return null;
      return (<ContentSection>
        <SectionHeading
          kicker={section.texts[0]?.values[locale] ?? ''}
          title={<SectionCopy section={section} locale={locale} richIndex={0} />}
        />
        <CardGrid>
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} labels={labels} />
          ))}
        </CardGrid>
        {upcoming.length === 0 && (
          <p className="lead">{section.texts[3]?.values[locale] ?? ''}</p>
        )}
        <FormActions className="reveal" style={{ marginTop: 36 }}>
          <SmartLink className="btn" href="/book-a-meeting">
            {section.texts[4]?.values[locale] ?? ''}</SmartLink>
          <button className="btn ghost" data-quote="" type="button">
            {section.texts[5]?.values[locale] ?? ''}</button>
        </FormActions>
      </ContentSection>);
    },
    enquiry: () => {
      const section = content.sections.find(item => item.key === 'section-3');
      if (!section?.enabled) return null;
      return (<ContentSection theme="tint">
        <SectionHeading
          kicker={section.texts[0]?.values[locale] ?? ''}
          title={<SectionCopy section={section} locale={locale} richIndex={0} />}
        />
        <div className="cards c4 reveal">
          {past.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} labels={labels} />
          ))}
        </div>
      </ContentSection>);
    },
    more: () => {
      const section = content.sections.find(item => item.key === 'section-4');
      if (!section?.enabled) return null;
      return (<ContentSection>
        <SectionHeading
          kicker={section.texts[0]?.values[locale] ?? ''}
          title={<SectionCopy section={section} locale={locale} richIndex={0} />}
        />
        <div className="ev-gallery reveal">
          {section.assets.filter(asset => asset.value).map((image) => (
            <figure key={image.id}>
              <ContentImage
                src={image.value}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </ContentSection>);
    }
};
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{Object.entries(sections).map(([key, render]) => <Fragment key={key}>{render()}</Fragment>)}</main>;
}

export function EventDetailBody({
  event,
  brandName,
  locale,
  labels,
  section,
}: {
  brandName: string;
  section?:string;
  event: EventRecord;
  locale: SiteLocale;
  labels: Record<string, string>;
}) {
  const content = event.content,
    headings = documentHeadings(content.body[locale]),
    date = new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone: event.timezone || undefined,
    }).formatRange(new Date(event.starts_at), new Date(event.ends_at));
  const kind = event.kind === "recap" ? labels.eventRecap : labels.tradeShow;
  const sections={hero:(
        <PageHero
          as="header"
          image={content.heroImage}
          imageAlt={content.heroAlt[locale]}
        >
          <Breadcrumbs label={labels.breadcrumb} items={[{href:"/",label:labels.home},{href:"/events",label:labels.events},{label:kind}]}/>
          <div className="art-meta">
            <span className="cat">{kind}</span>
            <span>{date}</span>
            {content.location[locale] && (
              <span>{content.location[locale]}</span>
            )}
          </div>
          <h1>
            <InlineContent document={content.title[locale]} />
          </h1>
          <p>{content.summary[locale]}</p>
          <div className="art-byline">
            <span className="av" aria-hidden="true">{brandName.split(/\s+/).slice(0,2).map(word=>word[0]).join('')}</span>
            <div>
              <div className="who">{content.venue[locale]}</div>
              <div className="when">{content.stand[locale] || date}</div>
            </div>
          </div>
        </PageHero>),body:(<div className="art-body">
          <TwoColumns collapseAt={1050} as="div" columns="190px minmax(0,1fr)" gap="clamp(40px,5vw,80px)" align="start" className="wrap art-grid">
            <aside className="art-rail">
              {headings.length > 0 && (
                <div className="toc">
                  <div className="lbl">{labels.toc}</div>
                  <ul>
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ShareLinks labels={labels} />
            </aside>
            <div className="art-prose">
              <ContentRenderer document={content.body[locale]} />
              <FormActions>
                {event.kind === "event" && (
                  <SmartLink
                    className="btn"
                    href={`/book-a-meeting?event=${event.slug}`}
                  >
                    {labels.arrangeStandMeeting}
                  </SmartLink>
                )}
                <button className="btn ghost" data-quote="" type="button">
                  {labels.requestQuote}
                </button>
                <SmartLink className="btn ghost" href="/events">
                  {labels.allEvents}
                </SmartLink>
              </FormActions>
            </div>
          </TwoColumns>
        </div>
      )}
  return section?sections[section as keyof typeof sections]:<main id="main"><article>{Object.values(sections)}</article></main>;
}
