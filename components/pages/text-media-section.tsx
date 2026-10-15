import {DeferredVideo} from '@/components/site/deferred-video'
import { TwoColumns } from "@/components/layout/two-columns";
import type { SiteLocale } from "@/i18n/navigation";
import {
  richText,
  recordDocuments,
  recordSource,
  presentRecord,
  type PageBlock,
} from "@/lib/payload/client";
import type { NewsCardRecord } from "@/lib/api/public";
import {
  InlineContent,
  ContentRenderer,
} from "@/components/editor/content-renderer";
import { ContentImage } from "@/components/site/content-image";
import { SmartLink } from "@/components/site/smart-link";
import {
  ContentSection,
  SectionHeading,
} from "@/components/site/content-section";
import styles from "./text-media-section.module.css";

export async function TextMediaSection({
  block,
  locale,
}: {
  block: PageBlock;
  locale: SiteLocale;
}) {
  const localized = (value: unknown): unknown =>
    value &&
    typeof value === "object" &&
    ("en" in value || "ar" in value || "fr" in value)
      ? ((value as Record<string, unknown>)[locale] ??
        (value as Record<string, unknown>).en)
      : value;
  const media = block.media as
    { url?: string; mimeType?: string; alt?: unknown } | undefined;
  const poster = block.poster as { url?: string } | undefined;
  const alt = String(localized(block.mediaAlt) || localized(media?.alt) || "");
  const caption = String(localized(block.caption) ?? "");

  const articleIDs = (block.articles ?? []) as (number | { id: number })[];
  const news = articleIDs.length
    ? new Map((await recordDocuments("news")).map((doc) => [doc.id, doc]))
    : new Map();
  const articles = articleIDs.flatMap((value) => {
    const doc = news.get(typeof value === "number" ? value : value.id);
    return doc
      ? [presentRecord<NewsCardRecord>("news", recordSource(doc), "card")]
      : [];
  });
  return (
    <ContentSection
      theme={
        block.theme === "tint"
          ? "tint"
          : block.theme === "deep"
            ? "deep"
            : "plain"
      }
    >
      <TwoColumns
        columns={
          block.mediaPosition === "left"
            ? "minmax(0,.82fr) minmax(0,1fr)"
            : "55-45"
        }
        align="center"
        mediaChild="second"
      >
        <div className={styles.copy}>
          <SectionHeading
            kicker={String(localized(block.eyebrow) ?? "")}
            title={
              <InlineContent
                document={richText(localized(block.heading), undefined, locale)}
              />
            }
          />
          <div className={styles.body}>
            <ContentRenderer
              document={richText(localized(block.body), undefined, locale)}
            />
          </div>
        </div>
        <div>
          {block.rightContent ? (
            <ContentRenderer
              document={richText(
                localized(block.rightContent),
                undefined,
                locale,
              )}
            />
          ) : null}
          {media?.url && (
            <figure className={`${styles.media} reveal`}>
              {media.mimeType?.startsWith("video/") ? (
                <DeferredVideo
                  src={media.url}
                  poster={poster?.url}
                  controls
                  aria-label={alt}
                />
              ) : (
                <ContentImage src={media.url} alt={alt} />
              )}
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          )}
        </div>
      </TwoColumns>
      {articles.length > 0 && (
        <div className={`${styles.articles} reveal`}>
          {articles.map((article) => {
            const content = article.published[locale];
            return content ? (
              <article key={article.id}>
                <SmartLink href={`/news/${article.slug}`}>
                  {content.hero && (
                    <ContentImage src={content.hero} alt={content.heroAlt} />
                  )}
                  <h3>
                    <InlineContent
                      document={content.cardTitle ?? content.title}
                    />
                  </h3>
                  <p>{content.cardSummary || content.summary}</p>
                  <span>
                    {String(localized(block.articleLinkLabel) ?? "")}{" "}
                    {locale === "ar" ? "←" : "→"}
                  </span>
                </SmartLink>
              </article>
            ) : null;
          })}
        </div>
      )}
    </ContentSection>
  );
}
