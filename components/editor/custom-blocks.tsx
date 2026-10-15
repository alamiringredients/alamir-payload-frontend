import {TwoColumns} from '@/components/layout/two-columns'
import { Fragment, type ReactNode } from "react";
import { ContentImage } from "@/components/site/content-image";
import { SmartLink } from "@/components/site/smart-link";
import type { ContentNode } from "@/lib/editor/document";
import { DeferredVideo } from "@/components/site/deferred-video";
import { EmbeddedVideo } from "./embedded-video";
import { AnimatedStatistics } from "./animated-statistics";
import { ProfileBlock } from "./profile-block";
import { ValuesBlock } from "./values-block";
import styles from "./content-blocks.module.css";

type RenderNode = (node: ContentNode) => ReactNode;
type BlockProps = {
  node: ContentNode;
  children?: ReactNode;
  renderNode: RenderNode;
};

export function SectionHeaderBlock({ node, children }: BlockProps) {
  const a = node.attrs ?? {};
  return (
    <TwoColumns as="header" collapseAt={1050} style={a.layout==='split'?undefined:{display:'block'}} columns={String(a.columnWidth??'50-50')} align="end" gap="0 clamp(28px,4vw,72px)"
      className={`${styles["section-header"]} ${a.width === "wide" ? styles["section-header--wide"] : ""} ${a.singleLine ? styles["section-header--nowrap"] : ""} ${a.layout === "split" ? styles["section-header--split"] : ""} reveal`}
    >
      {a.eyebrow ? (
        <div className={styles.eyebrow}>{String(a.eyebrow)}</div>
      ) : null}
      <div className={styles["section-header-content"]}>{children}</div>
      {a.ctaLabel && a.ctaHref ? (
        <SmartLink className={styles.button} href={String(a.ctaHref)}>
          {String(a.ctaLabel)}
        </SmartLink>
      ) : null}
    </TwoColumns>
  );
}

export function ActionsBlock({ node }: BlockProps) {
  const items = (node.attrs?.items ?? []) as {
    label: string;
    href: string;
    variant: "primary" | "secondary";
    visible?: boolean;
  }[];
  return (
    <div className={`${styles.actions} reveal`}>
      {items
        .filter((item) => item.visible !== false && item.label && item.href)
        .map((item) => (
          <SmartLink
            className={item.variant === "secondary" ? "btn ghost" : "btn"}
            href={item.href}
            key={`${item.href}-${item.label}`}
          >
            {item.label}
          </SmartLink>
        ))}
    </div>
  );
}

export function AboutProfileBlock({ node, renderNode }: BlockProps) {
  return <ProfileBlock attrs={node.attrs ?? {}} renderNode={renderNode}/>;
}
export function ValuesRailBlock({ node }: BlockProps) {
  return (
    <ValuesBlock
      items={
        (node.attrs?.items ?? []) as {
          image: string;
          alt: string;
          title: string;
          description: string;
        }[]
      }
    />
  );
}

export function ContentSectionBlock({ node, children }: BlockProps) {
  const a = node.attrs ?? {};
  return (
    <section
      id={a.id ? String(a.id) : undefined}
      className={`${styles["content-section"]} ${styles[`content-section--${String(a.theme ?? "plain")}`] ?? ""}`}
      data-content-section=""
      data-goals={((a.goals ?? []) as number[]).join(" ")}
    >
      <div className={styles["content-section-inner"]}>{children}</div>
    </section>
  );
}

export function DataTableBlock({ node }: BlockProps) {
  const a = node.attrs ?? {},
    headers = (a.headers ?? []) as string[],
    rows = (a.rows ?? []) as string[][];
  return (
    <div className={styles["content-table-scroll"]}>
      <table className={styles["content-table"]}>
        {a.caption ? <caption>{String(a.caption)}</caption> : null}
        <thead>
          <tr>
            {headers.map((header) => (
              <th scope="col" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.join("\u0000") || rowIndex}>
              {row.map((cell, columnIndex) =>
                columnIndex === 0 ? (
                  <th scope="row" key={`${columnIndex}-${cell}`}>
                    {cell}
                  </th>
                ) : (
                  <td key={`${columnIndex}-${cell}`}>
                    {a.statusColumn && columnIndex === row.length - 1 ? (
                      <span className={styles.status}>{cell}</span>
                    ) : (
                      cell
                    )}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Caption({
  attrs,
  variant = "ledger",
}: {
  attrs: Record<string, unknown>;
  variant?: "ledger" | "video";
}) {
  if (!attrs.caption) return null;
  const parts = String(attrs.caption)
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (variant === "video") {
    return (
      <figcaption className={styles["caption--video"]}>
        {parts.join(" ")}
      </figcaption>
    );
  }

  return (
    <figcaption className={styles.caption}>
      {attrs.captionLabel ? (
        <span className={styles["caption-index"]}>
          {String(attrs.captionLabel)}
        </span>
      ) : null}
      {parts[0] ? (
        <span className={styles["caption-text"]}>{parts[0]}</span>
      ) : null}
      {parts.length > 0 ? (
        <i className={styles["caption-line"]} aria-hidden="true" />
      ) : null}
      {parts.slice(1).map((part, index) => (
        <span className={styles["caption-text"]} key={`${part}-${index}`}>
          {part}
        </span>
      ))}
    </figcaption>
  );
}

export function ImageBlock({ node }: BlockProps) {
  const a = node.attrs ?? {};
  if (!a.src) return null;
  return (
    <figure className={`${styles["content-image"]} reveal`}>
      {a.captionPosition === "above" && <Caption attrs={a} />}
      <ContentImage
        src={String(a.src)}
        alt={String(a.alt)}
        style={{
          height: "auto",
          aspectRatio: a.ratio === "original" ? undefined : String(a.ratio),
          objectFit: "cover",
          objectPosition: String(a.position),
        }}
      />
      {a.captionPosition !== "above" && <Caption attrs={a} />}
    </figure>
  );
}

export function GalleryBlock({ node }: BlockProps) {
  const a = node.attrs ?? {},
    images = (a.images ?? []) as { src: string; alt: string; caption?:string }[];
  return (
    <figure className={styles.gallery}>
      {a.captionPosition === "above" && <Caption attrs={a} />}{" "}
      {images
        .filter((image) => image.src)
        .map((image) => (
          image.caption?<figure key={`${image.src}-${image.alt}`}><ContentImage src={image.src} alt={image.alt}/><figcaption className={styles["caption--video"]}>{image.caption}</figcaption></figure>:<ContentImage key={`${image.src}-${image.alt}`} src={image.src} alt={image.alt}/>
        ))}{" "}
      {a.captionPosition !== "above" && (
        <Caption attrs={a} variant="video" />
      )}
    </figure>
  );
}

export function FactsBlock({ node }: BlockProps) {
  const a = node.attrs ?? {},
    items = (a.items ?? []) as { label: string; value: string }[];
  return (
    <div className={styles.facts}>
      <div className={styles.eyebrow}>{String(a.label)}</div>
      <dl>
        {items.map((item) => (
          <Fragment key={`${item.label}-${item.value}`}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

export function TextStatisticsBlock({ node, children, groupLogo }: BlockProps & {groupLogo?:string}) {
  const a = node.attrs ?? {};
  const markSrc = a.useGroupLogo ? groupLogo : a.markSrc;
  const items = (a.items ?? []) as { value: string; label: string }[];
  const markHref = String(a.markHref ?? "");
  const markAlt = String(a.markAlt ?? "");
  const hasHeader = Boolean(a.label || markSrc);
  const externalMark = /^https?:\/\//i.test(markHref);
  return (
    <section
      className={`${styles["content-statistics"]} ${hasHeader ? styles["content-statistics--with-header"] : ""} reveal`}
    >
      {hasHeader ? (
        <div className={styles["statistics-header"]} data-statistics-header="">
          {a.label ? (
            <div className={styles["statistics-label"]}>{String(a.label)}</div>
          ) : (
            <span />
          )}
          {markSrc && markHref ? (
            <SmartLink
              className={styles["statistics-mark"]}
              href={markHref}
              target={externalMark ? "_blank" : undefined}
              rel={externalMark ? "noopener noreferrer" : undefined}
              aria-label={markAlt || String(a.label || "Statistics")}
            >
              <ContentImage src={String(markSrc)} alt={markAlt} />
            </SmartLink>
          ) : markSrc ? (
            <span className={styles["statistics-mark"]}>
              <ContentImage src={String(markSrc)} alt={markAlt} />
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
      {items.length > 0 && (
        <div className={styles["content-statistics-grid"]}>
          <AnimatedStatistics items={items} />
        </div>
      )}
    </section>
  );
}

function isMediaStory(node: ContentNode) {
  if (node.content?.length !== 2) return false;
  const types = node.content.map((column) =>
    (column.content ?? []).map((child) => child.type),
  );
  return (
    types.some((items) => items.length === 1 && items[0] === "image") &&
    types.some((items) => items.includes("heading"))
  );
}

function MediaStory({ node, renderNode }: BlockProps) {
  const columns = node.content ?? [],
    mediaColumn = columns.find(
      (column) =>
        column.content?.length === 1 && column.content[0].type === "image",
    ),
    bodyColumn = columns.find((column) => column !== mediaColumn);
  const image = mediaColumn?.content?.[0],
    attrs = image?.attrs ?? {};
  if (!image || !attrs.src || !bodyColumn) return null;
  const side = String(node.attrs?.mediaSide ?? "start");
  return (
    <TwoColumns as="figure" collapseAt={700} columns={String(node.attrs?.columnWidth??(side==='end'?'minmax(0,1.05fr) minmax(0,.95fr)':'minmax(0,.95fr) minmax(0,1.05fr)'))} align="center"
      className={`${styles["media-story"]} reveal`}
      data-media-story=""
      firstSide={side==='end'?'end':'start'}
    >
      <div className={styles["media-story-image"]}>
        <ContentImage
          src={String(attrs.src)}
          alt={String(attrs.alt ?? "")}
          width={1600}
          height={1067}
          style={{ objectPosition: String(attrs.position ?? "center") }}
        />
      </div>
      <figcaption className={styles["media-story-body"]}>
        {Boolean(attrs.caption) && (
          <div className={styles["media-story-caption"]}>
            {Boolean(attrs.captionLabel) && (
              <span>{String(attrs.captionLabel)}</span>
            )}
            <span>{String(attrs.caption)}</span>
            <i />
          </div>
        )}
        {(bodyColumn.content ?? []).map((child, index) => (
          <Fragment key={child.attrs?.id ? String(child.attrs.id) : index}>
            {renderNode(child)}
          </Fragment>
        ))}
      </figcaption>
    </TwoColumns>
  );
}

export function ColumnsBlock(props: BlockProps) {
  const {node,children}=props,a=node.attrs??{};
  if(isMediaStory(node))return <MediaStory {...props}/>;
  const className=`${styles["content-columns"]} ${styles[`content-columns--${String(a.layout??"equal")}`]??""} reveal`;
  if(node.content?.length!==2)return <div className={className} data-count={node.content?.length}>{children}</div>;
  const columns=String(a.columnWidth??({'wide-start':'60-40','wide-end':'40-60','prose-media':'minmax(0,1.05fr) minmax(0,.95fr)'} as Record<string,string>)[String(a.layout)]??'50-50');
  return <TwoColumns collapseAt={a.layout==='prose-media'?900:700} columns={columns} className={className} align={a.verticalAlign==='center'?'center':a.verticalAlign==='end'?'end':a.verticalAlign==='stretch'?'stretch':'start'} gap={a.layout==='prose-media'?'clamp(36px,5vw,72px)':'clamp(20px,3vw,40px)'}>{children}</TwoColumns>;
}

export function ColumnBlock({ children }: BlockProps) {
  return <div className={styles["content-column"]}>{children}</div>;
}

export function CalloutBlock({ node, children }: BlockProps) {
  const a = node.attrs ?? {};
  return (
    <aside
      className={`${styles["content-callout"]} ${styles[`content-callout--${String(a.variant ?? "soft")}`] ?? ""}`}
    >
      {children}
    </aside>
  );
}

export function VideoBlock({ node }: BlockProps) {
  const a = node.attrs ?? {};
  const captionVariant = a.captionStyle === "ledger" ? "ledger" : "video";
  if (!a.src) return null;
  return (
    <figure className={styles["content-video"]}>
      {a.captionPosition === "above" && (
        <Caption attrs={a} variant={captionVariant} />
      )}{" "}
      {a.source === "embed" ? (
        <EmbeddedVideo
          src={String(a.src)}
          label={String(a.label)}
          ratio={String(a.ratio)}
          poster={a.poster ? String(a.poster) : undefined}
        />
      ) : (
        <DeferredVideo
          src={String(a.src)}
          poster={a.poster ? String(a.poster) : undefined}
          controls={Boolean(a.controls)}
          autoPlay={Boolean(a.autoplay)}
          muted={Boolean(a.muted)}
          loop={Boolean(a.loop)}
          playsInline
          preload={a.autoplay ? "metadata" : "none"}
          aria-label={String(a.label)}
          style={{ aspectRatio: String(a.ratio) }}
        />
      )}{" "}
      {a.captionPosition !== "above" && (
        <Caption attrs={a} variant={captionVariant} />
      )}
    </figure>
  );
}
