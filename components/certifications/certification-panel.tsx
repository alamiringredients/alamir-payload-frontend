import {getWebsiteSettings} from '@/lib/api/public';
import { ContentImage } from "@/components/site/content-image";
import { SmartLink } from "@/components/site/smart-link";
import type { SiteLocale } from "@/i18n/navigation";
import {
  certificationEntries,
  downloadableCertifications,
  effectiveStatus,
  type CertificationData,
  type CertificationHolder,
} from "@/lib/certifications/types";
import { holderLabel, statusLabel } from "@/lib/certifications/labels";
import type { CertificationInterfaceLabels } from "@/lib/certifications/types";
import { CertificationCarouselFrame } from "./certification-carousel";
import "./certification-panel.css";

export async function CertificationPanel({
  data,
  holder,
  locale,
  labels,
  groupLogo,
}: {
  data: CertificationData;
  holder: CertificationHolder;
  locale: SiteLocale;
  labels: CertificationInterfaceLabels;
  groupLogo?: string;
}) {
  const records = certificationEntries(data, holder);
  if (!records.length) return null;
  const siteName=(await getWebsiteSettings(locale)).siteName[locale];
  const title = holder === "group"
    ? `${holderLabel(holder, labels)} — ${labels.heldToday}`
    : `${siteName} — ${labels.programme}`;
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "numeric",
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || undefined,
    }).format(new Date(`${value}T00:00:00Z`));
  return (
    <div className="crd-panel reveal">
      <div className="crd-bar">
        <span>{title}</span>
        {holder === "group" ? (
          <a
            className="crd-bar-logo"
            href="https://www.alamireg.com/"
            target="_blank"
            rel="noreferrer"
            aria-label={holderLabel("group",labels)}
          >
            {groupLogo && <ContentImage src={groupLogo} alt={holderLabel("group",labels)} />}
          </a>
        ) : (
          <span className="end">
            {records.length} {labels.entries}
          </span>
        )}
      </div>
      <ul className="crd-logos">
        {records.map((record) => {
          const status = effectiveStatus(record);
          return (
            <li key={record.id} className="crd-logo">
              <span
                className={`plate${record.type.content.logo ? "" : " mono"}`}
              >
                {record.type.content.logo ? (
                  <ContentImage
                    src={record.type.content.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  record.type.content.badge
                )}
              </span>
              <span>
                <span className="nm">{record.type.content.name[locale]}</span>
                <span className="st">
                  {record.content.scope[locale] ||
                    record.type.content.description[locale]}
                </span>
                <span className="tag">{statusLabel(status, labels)}</span>
                {(status === "planned" || status === "in-progress") && (
                  <span className="dt">
                    {record.content.target_date ? (
                      <>
                        {labels.target}{" "}
                        <time dateTime={record.content.target_date}>
                          {date(record.content.target_date)}
                        </time>
                      </>
                    ) : (
                      labels.unconfirmed
                    )}
                  </span>
                )}
                {record.content.issue_date && (
                  <span className="dt">
                    {labels.issued}{" "}
                    <time dateTime={record.content.issue_date}>
                      {date(record.content.issue_date)}
                    </time>
                  </span>
                )}
                {record.content.expiry_date && (
                  <span className="dt">
                    {labels.expires}{" "}
                    <time dateTime={record.content.expiry_date}>
                      {date(record.content.expiry_date)}
                    </time>
                  </span>
                )}
                {record.content.certificate_number && (
                  <span className="dt">
                    {record.content.certificate_number}
                  </span>
                )}
                {status === "held" && record.content.document && (
                  <a
                    className="dt"
                    href={record.content.document}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {labels.download} ↓
                  </a>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {(holder === "sadat-city" ||
        !!downloadableCertifications(data, holder).length) && (
        <SmartLink className="crd-download" href="/downloads#certificates">
          <span className="nm">{labels.downloads}</span>
          <span className="no">{labels.pdf} ↓</span>
        </SmartLink>
      )}
    </div>
  );
}

export function CertificationCarousel({
  data,
  locale,
  labels,
}: {
  data: CertificationData;
  locale: SiteLocale;
  labels: CertificationInterfaceLabels;
  groupLogo?: string;
}) {
  const records = certificationEntries(data, "sadat-city");
  if (!records.length) return null;
  return (
    <CertificationCarouselFrame label={labels.marks}>
      <div className="cf-stage">
        {records.map((record,index) => (
          <div className={`cf-card${index===0?" is-active":""}`} aria-hidden={index===0?"false":"true"} style={index===0?undefined:{opacity:0,pointerEvents:"none"}} key={record.id}>
            {record.type.content.logo ? (
              <ContentImage
                src={record.type.content.logo}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="certification-text-badge">
                {record.type.content.badge}
              </span>
            )}
            <span className="cf-title">
              {record.type.content.name[locale]} ·{" "}
              {statusLabel(effectiveStatus(record), labels)}
            </span>
            <span className="cf-dim" />
          </div>
        ))}
      </div>
    </CertificationCarouselFrame>
  );
}
