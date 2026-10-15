import {TwoColumns} from '@/components/layout/two-columns'
import {SectionCopy} from '@/components/editor/section-copy'
import type {CompanyInformation} from '@/lib/cms/types'
import { SearchForm } from "@/components/search/search-form";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social-links";
import { SmartLink } from "@/components/site/smart-link";
import type { ManagedPageContent } from "@/lib/cms/types";
import type { SearchResult } from "@/lib/search/match";
import type { SiteLocale } from "@/i18n/navigation";
import type { ReactNode } from "react";
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
  index: number,
  locale: SiteLocale,
) => section(content, key)?.texts[index]?.values[locale] ?? "";

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
      image={image ? hero.assets[0]?.value : undefined}
      imageAlt={image ? value(content, "hero", 0, locale) : ""}
    >
      {!image && (
        <div className="kicker">{value(content, "hero", 0, locale)}</div>
      )}
      <h1><SectionCopy section={hero} locale={locale} kind="heading"/></h1>
      <p><SectionCopy section={hero} locale={locale} kind="body" index={image?4:3}/></p>
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
  const block = section(content, "section-2")!,
    t = (index: number) => block.texts[index]?.values[locale] ?? "";
  const definitions =
    page === "privacy"
      ? [
          { heading: 1, body: [10] },
          { heading: 2, body: [11], bullets: [12, 13, 14, 15] },
          { heading: 3, body: [16] },
          { heading: 4, body: [17] },
          { heading: 5, body: [18] },
          { heading: 6, body: [19] },
          { heading: 7, body: [20], link: 21 },
        ]
      : page === "terms"
        ? [
            { heading: 1, body: [10] },
            { heading: 2, body: [11, 12] },
            { heading: 3, body: [13] },
            { heading: 4, body: [14] },
            { heading: 5, body: [15] },
            { heading: 6, body: [16] },
            { heading: 7, body: [17] },
          ]
        : [
            { heading: 1, body: [7] },
            { heading: 2, body: [10], bullets: [8, 9] },
            { heading: 3, body: [11] },
            { heading: 4, body: [12] },
          ];
  const updated = page === "cookies" ? 5 : 8,
    contact = page === "privacy" ? 22 : page === "terms" ? 18 : 13;
  return (
    <ContentSection>
      <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1fr) 260px" gap="clamp(40px,6vw,90px)" align="start" className="legal-layout">
        <aside className="toc">
          <div>{t(0)}</div>
          <ol>
            {definitions.map((item, index) => (
              <li key={item.heading}>
                <SmartLink href={`#s${index + 1}`}><SectionCopy section={block} locale={locale} index={item.heading}/></SmartLink>
              </li>
            ))}
          </ol>
        </aside>
        <div className="legal">
          <p className="updated">
            {t(updated)} {t(updated + 1)}
          </p>
          {definitions.map((item, index) => (
            <div key={item.heading}>
              <h2 id={`s${index + 1}`}><SectionCopy section={block} locale={locale} index={item.heading}/></h2>
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
          <h2><SectionCopy section={block} locale={locale} index={contact}/></h2>
          <p>
            {t(contact + 1)}{" "}
            <SmartLink href="/contact">
              {t(contact + 2)}
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
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  page: "privacy" | "terms" | "cookies";
}) {
  return (
    <main id="main">
      <ManagedPageHero content={content} locale={locale} />
      {section(content, "section-2")?.enabled && (
        <LegalSection content={content} locale={locale} page={page} />
      )}
    </main>
  );
}

export function ThankYouPageContent({
  content,
  locale,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
}) {
  const cards = section(content, "section-2"),
    t = (index: number) => value(content, "section-2", index, locale);
  return (
    <main id="main">
      <PageHero layout="plain">
        <div className="status">
          <div className="mark" aria-hidden="true">
            ✓
          </div>
          <h1><SectionCopy section={section(content,"hero")} locale={locale} kind="heading"/></h1>
          <p><SectionCopy section={section(content,"hero")} locale={locale} kind="body" index={2}/></p>
          <ActionGroup
            reveal={false}
            actions={[
              {
                href: "/",
                label: content.interface?.backHome[locale]??"",
                variant: "secondary",
              },
              {
                href: "/downloads",
                label: content.interface?.browseDownloads[locale]??"",
                variant: "secondary",
              },
            ]}
          />
        </div>
      </PageHero>
      {cards?.enabled && (
        <ContentSection>
          <SectionHeading
            kicker={t(0)}
            title={<SectionCopy section={cards} locale={locale} kind="heading"/>}
          />
          <CardGrid>
            {[0, 1, 2].map((_, index) => (
              <SmartLink
                className="card"
                href={["/quality", "/products", "/events"][index]}
                key={index}
              >
                <div className="no">{String(index+1).padStart(2,"0")}</div>
                <h3><SectionCopy section={cards} locale={locale} index={index*3+4}/></h3>
                <p><SectionCopy section={cards} locale={locale} index={index*3+5}/></p>
              </SmartLink>
            ))}
          </CardGrid>
        </ContentSection>
      )}
    </main>
  );
}

export function NotFoundPageContent({
  content,
  locale,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
}) {
  const cards = section(content, "section-2")?.cards ?? [],
    paths = [
      "/products",
      "/quality",
      "/downloads",
      "/careers",
      "/news",
      "/contact",
    ];
  return (
    <main id="main">
      <PageHero layout="plain">
        <div className="status">
          <div className="big">404</div>
          <h1><SectionCopy section={section(content,"hero")} locale={locale} kind="heading"/></h1>
          <p><SectionCopy section={section(content,"hero")} locale={locale} kind="body" index={2}/></p>
          <ActionGroup
            reveal={false}
            actions={[
              { href: "/", label: content.interface?.backHome[locale]??"" },
              {
                href: "/search",
                label: content.interface?.searchSite[locale]??"",
                variant: "secondary",
              },
            ]}
          />
        </div>
      </PageHero>
      {cards.length > 0 && (
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
      )}
    </main>
  );
}

export function SearchPageContent({
  content,
  locale,
  results,
  query,
  action,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  results: SearchResult[];
  query: string;
  action: string;
}) {
  const empty = section(content, "section-2");
  return (
    <main id="main">
      <ManagedPageHero content={content} locale={locale} />
      <ContentSection>
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
            <a
              className="result"
              key={`${result.href}-${index}`}
              href={result.href}
            >
              <span className="crumb">{result.section}</span>
              <span className="nm">{result.title}</span>
              <span className="sn">{result.description}</span>
            </a>
          ))}
        </div>
        {empty?.enabled && (
          <div
            className="empty reveal"
            id="no-results"
            hidden={!query.trim() || results.length > 0}
          >
            {value(content, "section-2", 0, locale)}{" "}
            <SmartLink href="/contact">
              {value(content, "section-2", 1, locale)}
            </SmartLink>{" "}
            {value(content, "section-2", 2, locale)}
          </div>
        )}
      </ContentSection>
    </main>
  );
}

export function ContactPageContent({
  content,
  locale,
  form,
  company,
}: {
  content: ManagedPageContent;
  locale: SiteLocale;
  form: ReactNode;
  company: CompanyInformation;
}) {
  const details = section(content, "section-2"),
    t = (source: string) => details?.texts.find(field => field.source === source)?.values[locale] ?? "";
  return (
    <main id="main">
      <ManagedPageHero content={content} locale={locale} image />
      <section className="band">
        <div className="wrap">
          <TwoColumns collapseAt={1050} as="div" columns="minmax(0,.8fr) minmax(0,1.2fr)" gap="clamp(30px,5vw,72px)" align="start" className="contact-grid">
            <div className="reveal">
              <div className="kicker">{t("Contact details")}</div>
              <div className="contact-list">
                {company.email && <div><span>{t("Email")}</span><a href={`mailto:${company.email}`} dir="ltr">{company.email}</a></div>}
                {company.phone && <div><span>{t("Phone")}</span><a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`} dir="ltr">{company.phone}</a></div>}
                {company.website && <div><span>{t("Website")}</span><a href={company.website} dir="ltr">{new URL(company.website).host}</a></div>}
                <div><span>{t("Address")}</span><p style={{whiteSpace:"pre-line"}}>{company.address[locale]}</p></div>
                <div><span>{t("Follow us")}</span><SocialLinks className="footer-social ct-social" urls={company.socialLinks} locale={locale}/></div>
              </div>
            </div>
            <div>
              <div className="kicker">{t("Enquiry form")}</div>
              {form}
            </div>
          </TwoColumns>
        </div>
      </section>
    </main>
  );
}
