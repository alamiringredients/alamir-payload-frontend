import { richText } from "../editor/lexical.ts";
import type { ContentDocument, ContentNode } from "../editor/document";
import {
  pageSections,
  type SectionBlock,
} from "../payload/section-projection.ts";
import {
  cmsLocales,
  object,
  localizedText,
  mediaURL,
  type Fields,
} from "./fields.ts";
import type {
  CmsLocale,
  EditorialPageContent,
  LocalizedDocument,
} from "./types";

type EditorialPage = {
  page: Fields;
  layout: SectionBlock[];
  mediaRefs?: ReadonlyMap<number, Fields>;
};
const node = (
  type: string,
  attrs: Fields = {},
  content?: ContentNode[],
): ContentNode => ({
  type,
  attrs: { visible: true, ...attrs },
  ...(content ? { content } : {}),
});

/** About and Quality own their rendered layout; stored Sections own all copy. */
export function presentEditorialPage(
  page: EditorialPage,
  origin: string,
  selected?: SectionBlock,
): EditorialPageContent {
  const blocks = selected ? [selected] : page.layout;
  const hero = blocks.find(
    (block) => pageSections.get(block.blockType)?.name === "hero",
  );
  const heroFields = hero?.content ?? {};
  const seo = object(page.page.seo);
  const media = (value: unknown) => mediaURL(value, origin, page.mediaRefs);
  function resolveRichMedia(value: unknown): unknown {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(resolveRichMedia);
    const fields = object(value);
    return Object.fromEntries(
      Object.entries(fields).map(([key, item]) => {
        const upload =
          key === "value" &&
          fields.type === "upload" &&
          fields.relationTo === "media";
        if (
          (upload || key === "media" || key === "image") &&
          typeof item === "number"
        )
          return [key, resolveRichMedia(page.mediaRefs?.get(item) ?? null)];
        if (key === "url" && typeof item === "string" && item)
          return [key, new URL(item, origin).href];
        return [key, resolveRichMedia(item)];
      }),
    );
  }
  function rich(
    value: unknown,
    locale: CmsLocale,
    styles: Fields[] = [],
  ): ContentDocument {
    const document = richText(
      resolveRichMedia(object(value)[locale]),
      {
        type: "doc",
        content: styles.map((attrs) => ({ type: "paragraph", attrs })),
      },
      locale,
    );
    return {
      ...document,
      content: document.content.map((item) =>
        item.type === "paragraph"
          ? {
              ...item,
              attrs: { variant: "body", visible: true, ...item.attrs },
            }
          : item,
      ),
    };
  }
  const localizedRich = (value: unknown, styles: Fields[] = []) =>
    Object.fromEntries(
      cmsLocales.map((locale) => [locale, rich(value, locale, styles)]),
    ) as LocalizedDocument;
  const bodyStyle = { variant: "body", visible: true };
  const headingStyle = (id: string, level = 2) => ({
    id,
    level,
    visible: true,
    hideFromContents: false,
  });
  function section(
    block: SectionBlock,
    locale: CmsLocale,
  ): ContentNode | undefined {
    const definition = pageSections.get(block.blockType);
    if (
      !definition ||
      !["about", "quality"].includes(definition.pageSlug) ||
      definition.name === "hero"
    )
      return;
    const { name, pageSlug } = definition;
    const fields = block.content ?? {};
    const text = (value: unknown) => localizedText(value)[locale];
    const richNodes = (key: string, styles: Fields[] = []) =>
      rich(fields[key], locale, styles).content;
    const image = (key: string) => {
      const data = object(fields[key]);
      return node("image", {
        src: media(object(data.src)[locale]),
        alt: text(data.alt),
        caption: text(data.caption),
        captionLabel: text(data.captionLabel),
        ratio: "original",
        position: "center",
        captionPosition: "below",
      });
    };
    const video = (silent = false, embed = false) => {
      const data = object(fields.video);
      return node("video", {
        src: embed ? text(data.src) : media(object(data.src)[locale]),
        poster: media(object(data.poster)[locale]),
        label: text(data.label),
        caption: text(data.caption),
        loop: silent,
        mode: silent ? "silent" : "player",
        muted: silent,
        ratio: silent ? "4/3" : "16/9",
        source: embed ? "embed" : "upload",
        autoplay: silent,
        controls: !silent,
        captionPosition: "below",
        ...(silent ? { captionStyle: "ledger" } : {}),
      });
    };
    const columns = (
      left: ContentNode[],
      right: ContentNode[],
      attrs: Fields = {},
    ) =>
      node("columns", { layout: "equal", verticalAlign: "center", ...attrs }, [
        { type: "column", content: left },
        { type: "column", content: right },
      ]);
    const cards = (key: string) =>
      (Array.isArray(object(fields[key]).items)
        ? (object(fields[key]).items as Fields[])
        : []
      ).map((item) => ({
        alt: text(item.alt),
        image: media(object(item.image)[locale]),
        title: text(item.title),
        description: text(item.description),
      }));
    const header = (content: ContentNode[], attrs: Fields = {}) =>
      node(
        "sectionHeader",
        {
          ctaHref: text(fields.ctaHref),
          eyebrow: text(fields.eyebrow),
          ctaLabel: text(fields.ctaLabel),
          ...attrs,
        },
        content,
      );
    let content: ContentNode[];
    let theme = "plain";
    if (pageSlug === "quality") {
      const key = ["credentials", "roadmap"].includes(name)
        ? "heading"
        : "body";
      content = [
        header(richNodes(key, [headingStyle(`${name}-heading`), bodyStyle]), {
          width: "wide",
          singleLine: true,
        }),
      ];
      if (name === "credentials" || name === "roadmap") {
        content.push(
          ...richNodes("body", [
            bodyStyle,
            ...(name === "roadmap" ? [{ variant: "lead", visible: true }] : []),
          ]),
        );
        content.push(
          node("certificationPanel", {
            holder: text(object(fields.certificationPanel).holder),
          }),
        );
        if (name === "credentials")
          content.push(
            ...richNodes("body2", [{ variant: "lead", visible: true }]),
          );
        if (name === "roadmap") theme = "navy";
      } else if (name === "technology")
        content.push(node("mediaCards", { items: cards("technologies") }));
      else if (name === "sourcing") {
        theme = "tint";
        content.push(
          video(false, true),
          node("pillars", {
            items: ["item_1", "item_2", "item_3", "item_4"].map((key) =>
              text(object(object(fields.pillars).items)[key]),
            ),
          }),
        );
      }
    } else if (name === "story") {
      const figures = object(fields.figures);
      content = [
        header(richNodes("heading", [headingStyle("story-heading")])),
        columns(richNodes("body", []), [video(true)], {
          layout: "prose-media",
        }),
        columns(
          [image("image")],
          richNodes("body2", [
            headingStyle("story-detail-heading", 3),
            bodyStyle,
          ]),
          { mediaSide: "end" },
        ),
        node("textStatistics", {
          items: (Array.isArray(figures.items)
            ? (figures.items as Fields[])
            : []
          ).map((item) => ({
            label: text(item.label),
            value: text(item.value),
          })),
          label: text(figures.label),
          markAlt: text(figures.markAlt),
          markSrc: text(figures.markSrc),
          markHref: text(figures.markHref),
          useGroupLogo: true,
        }),
        image("image2"),
      ];
    } else if (name === "vision") {
      const profile = object(fields.profile);
      content = [
        header(richNodes("body", [headingStyle("vision-heading"), bodyStyle]), {
          width: "wide",
          layout: "split",
        }),
        node("aboutProfile", {
          alt: text(profile.alt),
          image: media(object(profile.image)[locale]),
          story: rich(profile.story, locale),
          vision: rich(profile.vision, locale),
          mission: rich(profile.mission, locale),
          storyLabel: text(profile.storyLabel),
          visionLabel: text(profile.visionLabel),
          missionLabel: text(profile.missionLabel),
        }),
      ];
    } else if (name === "values") {
      theme = "navy";
      content = [
        header(richNodes("heading", [headingStyle("values-heading")])),
        node("valuesRail", { items: cards("values") }),
      ];
    } else if (name === "technology") {
      content = [
        header(richNodes("heading", [headingStyle("technology-heading")])),
        columns(richNodes("body", [bodyStyle, bodyStyle]), [image("image")]),
        columns(
          [image("image2")],
          richNodes("body2", [
            headingStyle("technology-detail-heading", 3),
            bodyStyle,
          ]),
          { mediaSide: "start" },
        ),
        columns(
          [image("image3")],
          richNodes("body3", [
            headingStyle("technology-capability-heading", 3),
            bodyStyle,
          ]),
          { mediaSide: "end" },
        ),
        node("actions", {
          items: (Array.isArray(object(fields.actions).items)
            ? (object(fields.actions).items as Fields[])
            : []
          ).map((item) => ({
            href: text(item.href),
            label: text(item.label),
            variant: "primary",
            visible: true,
          })),
        }),
      ];
    } else if (name === "facility")
      content = [
        header(richNodes("heading", [headingStyle("facility-heading")])),
        video(),
      ];
    else return;
    return node(
      "contentSection",
      { id: name, goals: [], theme, visible: block.enabled !== false },
      content,
    );
  }
  return {
    sectionVisibility: {
      hero: Boolean(hero && hero.enabled !== false),
      body: true,
    },
    hero: {
      alt: localizedText(heroFields.alt),
      image: media(heroFields.image),
      kicker: localizedText(heroFields.kicker),
      title: localizedRich(heroFields.title, [
        {
          visible: true,
          ...(hero?.blockType.startsWith("about-") ? { variant: "body" } : {}),
        },
      ]),
      description: localizedRich(heroFields.description, [bodyStyle]),
    },
    body: Object.fromEntries(
      cmsLocales.map((locale) => [
        locale,
        {
          type: "doc",
          content: blocks.flatMap((block) => {
            const result = section(block, locale);
            return result ? [result] : [];
          }),
        },
      ]),
    ) as LocalizedDocument,
    seo: {
      title: localizedText(seo.title),
      description: localizedText(seo.description),
      socialTitle: localizedText(seo.socialTitle),
      socialDescription: localizedText(seo.socialDescription),
      socialImage: media(seo.socialImage),
    },
  };
}
