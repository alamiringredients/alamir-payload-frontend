import { TwoColumns } from "@/components/layout/two-columns";
import { ContentImage } from "@/components/site/content-image";
import styles from "./content-blocks.module.css";
import type { ReactNode } from "react";
import type { ContentNode, ContentDocument } from "@/lib/editor/document";

export function ProfileBlock({
  attrs: a,
  renderNode,
}: {
  attrs: Record<string, unknown>;
  renderNode: (node: ContentNode) => ReactNode;
}) {
  const text = (key: string) => String(a[key] ?? "");
  const copy = (key: string) => {
    const value = a[key];
    return value &&
      typeof value === "object" &&
      "type" in value &&
      value.type === "doc" ? (
      renderNode(value as ContentDocument)
    ) : (
      <p>{text(key)}</p>
    );
  };
  return (
    <TwoColumns
      collapseAt={1050}
      columns={String(a.columnWidth ?? "minmax(0,1.12fr) minmax(0,.88fr)")}
      gap="clamp(16px,1.8vw,24px)"
      data-rich-content=""
      className={styles.profile}
      data-media-side={a.mediaSide ? String(a.mediaSide) : undefined}
    >
      <figure className={styles["profile-photo"]}>
        {a.image ? (
          <ContentImage src={text("image")} alt={text("alt")} />
        ) : null}
        <figcaption>
          <b>{text("storyLabel")}</b>
          {copy("story")}
        </figcaption>
      </figure>
      <div className={styles["profile-cards"]}>
        <div
          className={`${styles["profile-card"]} ${styles["profile-card--dark"]}`}
        >
          <b>{text("visionLabel")}</b>
          {copy("vision")}
        </div>
        <div className={styles["profile-card"]}>
          <b>{text("missionLabel")}</b>
          {copy("mission")}
        </div>
      </div>
    </TwoColumns>
  );
}
