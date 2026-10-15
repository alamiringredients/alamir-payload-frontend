import type {ReactNode} from 'react'
import { InlineContent } from "@/components/editor/content-renderer";
import { formatFileSize } from "@/lib/downloads/format-size";
import { PageHero } from "@/components/site/page-hero";
import type { SiteLocale } from "@/i18n/navigation";
import type { Catalog } from "@/lib/catalog/types";
import type { WebsiteSettings } from "@/lib/cms/types";
import type { DownloadsPageContent } from "@/lib/downloads/types";
import {
  downloadableCertifications,
  type CertificationData,
} from "@/lib/certifications/types";
import { holderLabel } from "@/lib/certifications/labels";
import type { CertificationInterfaceLabels } from "@/lib/certifications/types";
import {
  ContentSection,
  SectionHeading,
} from "@/components/site/content-section";

function Download({
  href,
  name,
  detail,
  bytes,
  locale,
  format,
}: {
  href: string;
  name: string;
  detail?: string;
  bytes?: number;
  locale: SiteLocale;
  format: string;
}) {
  const size = formatFileSize(bytes, locale);
  return (
    <a className="dl" href={href} target="_blank" rel="noreferrer">
      <span className="ext">{format}</span>
      <span>
        <span className="nm">{name}</span>
        <span className="sz">
          {[detail, format, size].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="arrow">↓</span>
    </a>
  );
}
export function DownloadsContent({
  content,
  data,
  catalog,
  settings,
  locale,
  labels,
  fileSizes = {},
  section: selectedSection,
}: {
  content: DownloadsPageContent;
  fileSizes?: Record<string, number>;
  data?: CertificationData;
  catalog?: Catalog;
  settings: WebsiteSettings;
  locale: SiteLocale;
  labels: CertificationInterfaceLabels;
  section?: string;
}) {
  const certificates = data ? downloadableCertifications(data) : [];
  const products = catalog?.products.filter(
    (product) => product.content.tds[locale],
  ) ?? [];
  const sections: Record<string, () => ReactNode> = {
    hero: () => (content.sectionVisibility.hero && (
      <PageHero
        image={content.heroImage}
        imageAlt={content.heroImageAlt[locale]}
      >
        <div className="kicker">{content.heroEyebrow[locale]}</div>
        <h1>
          {content.heroHeading && (
            <InlineContent document={content.heroHeading[locale]} />
          )}
        </h1>
        <p>{content.heroDescription[locale]}</p>
      </PageHero>
    )),
    product: () => (content.sectionVisibility.products && (
      <>
        <SectionHeading
          kicker={content.productEyebrow[locale]}
          title={
            content.productHeading && (
              <InlineContent document={content.productHeading[locale]} />
            )
          }
        />
        <div className="stack reveal">
          {products.length ? (
            products.map((product) => (
              <Download
                locale={locale}
                format={labels.pdf}
                bytes={fileSizes[product.content.tds[locale]]}
                key={product.id}
                href={product.content.tds[locale]}
                name={product.content.name[locale]}
              />
            ))
          ) : (
            <p>{content.noTds[locale]}</p>
          )}
        </div>
      </>
    )),
    company: () => (content.sectionVisibility.company && (
      <>
        <SectionHeading
          id="certificates"
          className={
            !selectedSection && content.sectionVisibility.products
              ? "band-head--separated"
              : ""
          }
          kicker={content.companyEyebrow[locale]}
          title={
            content.companyHeading && (
              <InlineContent document={content.companyHeading[locale]} />
            )
          }
        />
        <div className="stack reveal">
          {(["group", "sadat-city"] as const).flatMap((holder) =>
            certificates
              .filter((record) => record.holder === holder)
              .map((record) => (
                <Download
                  locale={locale}
                  format={labels.pdf}
                  bytes={fileSizes[record.content.document]}
                  key={record.id}
                  href={record.content.document}
                  name={record.type.content.name[locale]}
                  detail={holderLabel(holder, labels)}
                />
              )),
          )}
          {settings.companyProfile[locale] && (
            <Download
              locale={locale}
              format={labels.pdf}
              bytes={fileSizes[settings.companyProfile[locale]]}
              href={settings.companyProfile[locale]}
              name={content.profileLabel[locale]}
            />
          )}
          {!certificates.length && !settings.companyProfile[locale] && (
            <p>{content.noCompany[locale]}</p>
          )}
        </div>
      </>
    ))
  };
  return selectedSection ? sections[selectedSection]?.() ?? null : <main id="main">{sections.hero()}{(content.sectionVisibility.products || content.sectionVisibility.company) && <ContentSection>{sections.product()}{sections.company()}</ContentSection>}</main>;
}
