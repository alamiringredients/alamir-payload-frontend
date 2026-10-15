import {TwoColumns} from '@/components/layout/two-columns'
import { Fragment } from "react";
import { PageHero } from "@/components/site/page-hero";
import { SmartLink } from "@/components/site/smart-link";
import { HeroActions } from "@/components/site/hero-actions";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import {
  ContentSection,
  SectionHeading,
} from "@/components/site/content-section";
import {
  ContentRenderer,
  InlineContent,
} from "@/components/editor/content-renderer";
import { EditorialPageHero } from "@/components/editor/editorial-page-hero";
import { ApplicationForm } from "./application-form";
import type {
  CareersContent,
  JobRecord,
} from "@/lib/careers/types";
import type { SiteLocale } from "@/i18n/navigation";
import type { JobCard } from "@/lib/api/public";
function JobRows({
  jobs,
  locale,
  labels,
}: {
  jobs: JobCard[];
  locale: SiteLocale;
  labels: Record<string, string>;
}) {
  return (
    <div className="jobs reveal">
      {jobs.map((job) => {
        const v = job.content[locale];
        return (
          <article className="job-row" key={job.id}>
            <SmartLink
              className="cover"
              href={`/careers/${job.slug}`}
              aria-label={v.title}
            />
            <span className="code">{job.code}</span>
            <div>
              <h3>{v.title}</h3>
              <div className="facts">
                <span>{v.department}</span>
                <span>{v.location}</span>
                <span>{v.contract}</span>
                <span>{v.experience}</span>
              </div>
            </div>
            <span className="go">
              {labels.viewRole}{" "}
              <span className="arrow" aria-hidden="true">
                {locale === "ar" ? "←" : "→"}
              </span>
            </span>
          </article>
        );
      })}
    </div>
  );
}
export function CareersPageBody({
  content,
  jobs,
  locale,
  labels,
}: {
  content: CareersContent;
  jobs: JobCard[];
  locale: SiteLocale;
  labels: Record<string, string>;
}) {
  return (
    <main id="main">
      {content.sectionVisibility.hero && (
        <EditorialPageHero
          kicker={content.hero.kicker[locale]}
          title={content.hero.title[locale]}
          description={content.hero.description[locale]}
          image={content.hero.image}
          imageAlt={content.hero.alt[locale]}
          actions={[
            {
              href: "#positions",
              label: labels.viewPositions ?? "View open positions",
            },
            {
              href: "#apply",
              label: labels.sendSpeculativeCv ?? "Send a speculative CV",
              variant: "secondary",
            },
          ]}
        />
      )}{" "}
      {content.sectionVisibility.jobs && (
        <ContentSection id="positions">
          <SectionHeading
            kicker={
              <>
                {content.jobsKicker[locale]} · {jobs.length}
              </>
            }
            title={<InlineContent document={content.jobsTitle[locale]} />}
            description={<InlineContent document={content.jobsIntro[locale]} />}
          />
          {jobs.length ? (
            <JobRows jobs={jobs} locale={locale} labels={labels} />
          ) : (
            <p>{content.empty[locale]}</p>
          )}
        </ContentSection>
      )}{" "}
      {content.sectionVisibility.apply && (
        <ContentSection id="apply" theme="tint">
          <SectionHeading
            kicker={content.applyKicker[locale]}
            title={<InlineContent document={content.applyTitle[locale]} />}
            description={
              <InlineContent document={content.applyIntro[locale]} />
            }
          />
          <ApplicationForm locale={locale} />
        </ContentSection>
      )}
    </main>
  );
}
export function CareerJobBody({
  job,
  jobs,
  content,
  locale,
  labels,
  section,
}: {
  section?:string;
  job: JobRecord;
  jobs: JobCard[];
  content: CareersContent;
  locale: SiteLocale;
  labels: Record<string, string>;
}) {
  const v = job.content[locale];
  const related = jobs.filter((item) => item.id !== job.id);
  const sections={hero:(
      <PageHero image={v.hero} imageAlt={v.heroAlt}>
        <Breadcrumbs label={labels.breadcrumb} items={[{href:"/",label:labels.home},{href:"/careers",label:labels.careers},{label:v.title}]}/>
        <div className="kicker">{v.department}</div>
        <h1><InlineContent document={v.heading}/></h1>
        <p>{v.summary}</p>
        <HeroActions actions={[{ href: "#apply", label: labels.apply }]} />
      </PageHero>),body:(<section className="band">
        <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1fr) 330px" gap="clamp(40px,6vw,90px)" align="start" className="wrap job-layout">
          <div className="job-prose managed-job-body">
            <ContentRenderer document={v.body} />
          </div>
          <aside className="job-aside">
            <div className="lbl">{labels.roleSummary}</div>
            <dl>
              {(
                [
                  "department",
                  "location",
                  "contract",
                  "experience",
                  "reportsTo",
                  "closing",
                ] as const
              ).map((key) => (
                <Fragment key={key}>
                  <dt>{labels[key]}</dt>
                  <dd>{v[key]}</dd>
                </Fragment>
              ))}
            </dl>
            <a className="btn" href="#apply">
              {labels.apply}
            </a>
            <SmartLink className="back" href="/careers#positions">
              {labels.allJobs}
            </SmartLink>
          </aside>
        </TwoColumns>
      </section>),apply:(<ContentSection theme="tint" id="apply">
        <SectionHeading
          kicker={
            <>
              {labels.apply} · {v.title}
            </>
          }
          title={labels.apply}
          description={labels.applyIntro}
        />
        <ApplicationForm
          locale={locale}
          jobId={job.id}
          jobTitle={v.title}
        />
      </ContentSection>),related:related.length > 0 && (
        <ContentSection>
          <SectionHeading
            kicker={content.jobsKicker[locale]}
            title={<InlineContent document={content.jobsTitle[locale]} />}
          />
          <JobRows jobs={related} locale={locale} labels={labels} />
        </ContentSection>
      )}
  return section?sections[section as keyof typeof sections]:<main id="main">{Object.values(sections)}</main>;
}
