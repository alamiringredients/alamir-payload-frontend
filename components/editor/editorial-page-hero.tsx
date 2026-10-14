import { InlineContent } from "./content-renderer";
import { PageHero } from "@/components/site/page-hero";
import { HeroActions } from "@/components/site/hero-actions";
import type { ContentDocument } from "@/lib/editor/document";
import type { ReactNode } from "react";

export function EditorialPageHero({
  kicker,
  title,
  description,
  image,
  imageAlt,
  actions = [],
  mediaPosition,
}: {
  kicker: string;
  title: ContentDocument;
  description: ContentDocument;
  image?: string;
  imageAlt?: string;
  mediaPosition?: "left" | "right";
  actions?: {
    href: string;
    label: ReactNode;
    variant?: "primary" | "secondary";
  }[];
}) {
  return (
    <PageHero image={image} imageAlt={imageAlt} mediaPosition={mediaPosition}>
      <div className="kicker">{kicker}</div>
      <h1>
        <InlineContent document={title} />
      </h1>
      <div className="hero-description">
        <InlineContent document={description} />
      </div>
      {actions.length > 0 && <HeroActions actions={actions} />}
    </PageHero>
  );
}
