import {Fragment, type ReactNode} from 'react'
import {TwoColumns} from '@/components/layout/two-columns'
import {SectionCopy} from '@/components/editor/section-copy'
import type {CompanyInformation} from '@/lib/cms/types'
import { SearchForm } from "@/components/search/search-form";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social-links";
import { SmartLink } from "@/components/site/smart-link";
import type { ManagedPageContent } from "@/lib/cms/types";
import type { SearchResult } from "@/lib/search/results";
import type { SiteLocale } from "@/i18n/navigation";

import {
  ActionGroup,
  CardGrid,
  ContentSection,
  SectionHeading,
} from "@/components/site/content-section";

const section = (content: ManagedPageContent, key: string) =>
  content.sections.find((item) => item.key === key);
const value = (
  content: ManagedPageContent,
  key: string,
  field: string,
  locale: SiteLocale,
) => section(content, key)?.text[field]?.[locale] ?? "";

function ManagedPageHero({
  content,
  locale,
  image = false,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  image?: boolean;
}) {
  const hero = section(content, "hero");
  if (!hero?.enabled) return null;
  return (
    <PageHero
      image={image ? hero.images.image : undefined}
      imageAlt={image ? value(content, "hero", "text", locale) : ""}
    >
      {!image && (
        <div className="kicker">{value(content, "hero", "text", locale)}</div>
      )}
      <h1><SectionCopy section={hero} locale={locale} field="heading"/></h1>
      <p><SectionCopy section={hero} locale={locale} field="body"/></p>
    </PageHero>
  );
}

function LegalSection({
  content,
  locale,
  page,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  page: "privacy" | "terms" | "cookies";
}) {
  const block = section(content, "related")!,
    t = (field: string) => block.text[field]?.[locale] ?? "";
  const definitions = page === "privacy"
    ? [
      {heading: 'heading', body: ['text11']},
      {heading: 'heading2', body: ['text12'], bullets: ['text13', 'text14', 'text15', 'text16']},
      {heading: 'heading3', body: ['text17']}, {heading: 'heading4', body: ['text18']},
      {heading: 'heading5', body: ['text19']}, {heading: 'heading6', body: ['text20']},
      {heading: 'heading7', body: ['text21'], link: 'readCookieNotice'},
    ] : page === "terms" ? [
      {heading: 'heading', body: ['text11']}, {heading: 'heading2', body: ['text12', 'text13']},
      {heading: 'heading3', body: ['text14']}, {heading: 'heading4', body: ['text15']},
      {heading: 'heading5', body: ['text16']}, {heading: 'heading6', body: ['text17']},
      {heading: 'heading7', body: ['text18']},
    ] : [
      {heading: 'heading', body: ['text8']},
      {heading: 'heading2', body: ['text11'], bullets: ['text9', 'text10']},
      {heading: 'heading3', body: ['text12']}, {heading: 'heading4', body: ['text13']},
    ];
  const updated = page === "cookies" ? 'text7' : 'text10';
  const contactHeading = page === "cookies" ? 'heading5' : 'heading8';
  const contactBody = page === "privacy" ? 'text24' : page === "terms" ? 'text20' : 'text15';
  return (
    <ContentSection>
      <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1fr) 260px" gap="clamp(40px,6vw,90px)" align="start" className="legal-layout">
        <aside className="toc">
          <div>{t('onThisPage')}</div>
          <ol>
            {definitions.map((item, index) => (
              <li key={item.heading}>
                <SmartLink href={`#s${index + 1}`}><SectionCopy section={block} locale={locale} field={item.heading}/></SmartLink>
              </li>
            ))}
          </ol>
        </aside>
        <div className="legal">
          <p className="updated">
            {t('lastUpdated')} {t(updated)}
          </p>
          {definitions.map((item, index) => (
            <div key={item.heading}>
              <h2 id={`s${index + 1}`}><SectionCopy section={block} locale={locale} field={item.heading}/></h2>
              {item.body.map((i) => (
                <p key={i}>{t(i)}</p>
              ))}
              {item.bullets && (
                <ul>
                  {item.bullets.map((i) => (
                    <li key={i}>{t(i)}</li>
                  ))}
                </ul>
              )}
              {item.link !== undefined && (
                <p>
                  <SmartLink href="/cookies">
                    {t(item.link)}
                  </SmartLink>
                </p>
              )}
            </div>
          ))}
          <h2><SectionCopy section={block} locale={locale} field={contactHeading}/></h2>
          <p>
            {t(contactBody)}{" "}
            <SmartLink href="/contact">
              {t('contactForm')}
            </SmartLink>
            .
          </p>
        </div>
      </TwoColumns>
    </ContentSection>
  );
}

export function LegalPageContent({
  content,
  locale,
  page,
  section: selectedSection,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  page: "privacy" | "terms" | "cookies";
  section?: string;
}) {
  const sections: Record<string, () => ReactNode> = {
    hero: () => (<ManagedPageHero content={content} locale={locale} />),
    body: () => (section(content, "related")?.enabled && (
      <LegalSection content={content} locale={locale} page={page} />
    ))
  };
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{Object.entries(sections).map(([key, render]) => <Fragment key={key}>{render()}</Fragment>)}</main>;
}

export function ThankYouPageContent({
  content,
  locale,
  section: selectedSection,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  section?: string;
}) {
  const cards = section(content, "related"),
    t = (field: string) => value(content, "related", field, locale);
  const sections: Record<string, () => ReactNode> = {
    hero: () => (<PageHero layout="plain">
      <div className="status">
        <div className="mark" aria-hidden="true">
          ✓
        </div>
        <h1><SectionCopy section={section(content, "hero")} locale={locale} field="heading" /></h1>
        <p><SectionCopy section={section(content, "hero")} locale={locale} field="body" /></p>
        <ActionGroup
          reveal={false}
          actions={[
            {
              href: "/",
              label: content.interface?.backHome[locale] ?? "",
              variant: "secondary",
            },
            {
              href: "/downloads",
              label: content.interface?.browseDownloads[locale] ?? "",
              variant: "secondary",
            },
          ]}
        />
      </div>
    </PageHero>),
    body: () => (cards?.enabled && (
      <ContentSection>
        <SectionHeading
          kicker={t('text')}
          title={<SectionCopy section={cards} locale={locale} field="heading" />}
        />
        <CardGrid>
          {[0, 1, 2].map((_, index) => (
            <SmartLink
              className="card"
              href={["/quality", "/products", "/events"][index]}
              key={index}
            >
              <div className="no">{String(index + 1).padStart(2, "0")}</div>
              <h3><SectionCopy section={cards} locale={locale} field={`heading${index + 2}`} /></h3>
              <p><SectionCopy section={cards} locale={locale} field={index === 0 ? "body" : `body${index + 1}`} /></p>
            </SmartLink>
          ))}
        </CardGrid>
      </ContentSection>
    ))
  };
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{Object.entries(sections).map(([key, render]) => <Fragment key={key}>{render()}</Fragment>)}</main>;
}

export function NotFoundPageContent({
  content,
  locale,
  section: selectedSection,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  section?: string;
}) {
  const cards = section(content, "related")?.cards ?? [],
    paths = [
      "/products",
      "/quality",
      "/downloads",
      "/careers",
      "/news",
      "/contact",
    ];
  const sections: Record<string, () => ReactNode> = {
    hero: () => (<PageHero layout="plain">
      <div className="status">
        <div className="big">404</div>
        <h1><SectionCopy section={section(content, "hero")} locale={locale} field="heading" /></h1>
        <p><SectionCopy section={section(content, "hero")} locale={locale} field="body" /></p>
        <ActionGroup
          reveal={false}
          actions={[
            { href: "/", label: content.interface?.backHome[locale] ?? "" },
            {
              href: "/search",
              label: content.interface?.searchSite[locale] ?? "",
              variant: "secondary",
            },
          ]}
        />
      </div>
    </PageHero>),
    body: () => (cards.length > 0 && (
      <ContentSection>
        <CardGrid>
          {cards.map((card, index) => (
            <SmartLink
              className="card"
              href={paths[index] ?? "/"}
              key={card.id}
            >
              <div className="no">{String(index + 1).padStart(2, "0")}</div>
              <h2>{card.title[locale]}</h2>
              <p>{card.description[locale]}</p>
            </SmartLink>
          ))}
        </CardGrid>
      </ContentSection>
    ))
  };
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{Object.entries(sections).map(([key, render]) => <Fragment key={key}>{render()}</Fragment>)}</main>;
}

export function SearchPageContent({
  content,
  locale,
  results,
  query,
  action,
  section: selectedSection,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  results: SearchResult[];
  query: string;
  action: string;
  section?: string;
}) {
  const empty = section(content, "related");
  const sections: Record<string, () => ReactNode> = {
    hero: () => (<ManagedPageHero content={content} locale={locale} />),
    body: () => (<ContentSection>
      <SearchForm
        query={query}
        action={action}
      />
      <div
        className="stack reveal"
        style={{ marginTop: 34 }}
        aria-live="polite"
      >
        {results.map((result, index) => (
          <SmartLink
            className="result"
            locale={locale}
            key={`${result.href}-${index}`}
            href={result.href}
          >
            <span className="crumb">{result.section}</span>
            <span className="nm">{result.title}</span>
            <span className="sn">{result.description}</span>
          </SmartLink>
        ))}
      </div>
      {empty?.enabled && (
        <div
          className="empty reveal"
          id="no-results"
          hidden={!query.trim() || results.length > 0}
        >
          {value(content, "related", "text", locale)}{" "}
          <SmartLink href="/contact">
            {value(content, "related", "text2", locale)}
          </SmartLink>{" "}
          {value(content, "related", "text3", locale)}
        </div>
      )}
    </ContentSection>)
  };
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{Object.entries(sections).map(([key, render]) => <Fragment key={key}>{render()}</Fragment>)}</main>;
}

export function ContactPageContent({
  content,
  locale,
  form,
  company,
  section: selectedSection,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  form: ReactNode;
  company: CompanyInformation;
  section?: string;
}) {
  const details = section(content, "related"),
    t = (field: string) => details?.text[field]?.[locale] ?? "";
  const sections: Record<string, () => ReactNode> = {
    hero: () => (<ManagedPageHero content={content} locale={locale} image />),
    body: () => (<section className="band">
      <div className="wrap">
        <TwoColumns collapseAt={1050} as="div" columns="minmax(0,.8fr) minmax(0,1.2fr)" gap="clamp(30px,5vw,72px)" align="start" className="contact-grid">
          <div className="reveal">
            <div className="kicker">{t("text")}</div>
            <div className="contact-list">
              {company.email && <div><span>{t("email")}</span><a href={`mailto:${company.email}`} dir="ltr">{company.email}</a></div>}
              {company.phone && <div><span>{t("phone")}</span><a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`} dir="ltr">{company.phone}</a></div>}
              {company.website && <div><span>{t("website")}</span><a href={company.website} dir="ltr">{new URL(company.website).host}</a></div>}
              <div><span>{t("address")}</span><p style={{ whiteSpace: "pre-line" }}>{company.address[locale]}</p></div>
              <div><span>{t("followUs")}</span><SocialLinks className="footer-social ct-social" urls={company.socialLinks} locale={locale} /></div>
            </div>
          </div>
          <div>
            <div className="kicker">{t("text7")}</div>
            {form}
          </div>
        </TwoColumns>
      </div>
    </section>)
  };
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{Object.entries(sections).map(([key, render]) => <Fragment key={key}>{render()}</Fragment>)}</main>;
}
