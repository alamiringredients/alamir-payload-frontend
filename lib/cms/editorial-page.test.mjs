import assert from "node:assert/strict";
import test from "node:test";
import { presentEditorialPage } from "./editorial-page.ts";
import { textContent, documentHeadings } from "../editor/document.ts";

const localized = (value) => ({ en: value, ar: value, fr: value });
const lexical = (...nodes) =>
  localized({ root: { type: "root", children: nodes } });
const paragraph = (text) => ({
  type: "paragraph",
  children: [{ type: "text", text }],
});
const heading = (text, tag = "h2") => ({
  type: "heading",
  tag,
  children: [{ type: "text", text, format: 2 }],
});
const block = (name, content = {}, fields = {}) => ({
  id: name,
  blockType: name,
  content,
  ...fields,
});
const source = (...layout) => ({
  page: { seo: { title: { fr: "Qualité" }, socialImage: 1 } },
  layout,
  mediaRefs: new Map([
    [1, { url: "/one.webp" }],
    [2, { url: "/two.mp4" }],
  ]),
});
const nodesOfType = (node, type) => [
  ...(node.type === type ? [node] : []),
  ...(node.content ?? []).flatMap((child) => nodesOfType(child, type)),
];

test("About renders owned story copy, localized numeric uploads, statistics and stable styled headings", () => {
  const story = block("about-story", {
    heading: lexical(heading("Our story")),
    body: lexical(paragraph("A story")),
    body2: lexical(heading("Details", "h3"), paragraph("Details body")),
    video: { src: localized(2), poster: localized(1), caption: { ar: "فيلم" } },
    image: { src: localized(1), alt: { fr: "Usine" } },
    figures: { items: [{ value: { fr: "20" }, label: { fr: "Années" } }] },
  });
  const page = source(
    story,
    block("about-story", { heading: lexical(heading("Other copy")) }),
  );
  const result = presentEditorialPage(page, "https://alamir.test", story);
  const doc = result.body.fr;
  assert.equal(textContent(doc).includes("Other copy"), false);
  assert.deepEqual(
    documentHeadings(doc).map((item) => item.id),
    ["story-heading", "story-detail-heading"],
  );
  assert.deepEqual(nodesOfType(doc, "heading")[0].content[0].marks, [
    { type: "italic" },
  ]);
  assert.equal(nodesOfType(doc, "paragraph")[0].attrs.variant, "body");
  assert.equal(
    nodesOfType(doc, "video")[0].attrs.src,
    "https://alamir.test/two.mp4",
  );
  assert.equal(nodesOfType(doc, "video")[0].attrs.autoplay, true);
  assert.equal(nodesOfType(result.body.ar, "video")[0].attrs.caption, "فيلم");
  assert.equal(nodesOfType(doc, "image")[0].attrs.alt, "Usine");
  assert.deepEqual(nodesOfType(doc, "textStatistics")[0].attrs.items, [
    { label: "Années", value: "20" },
  ]);
  assert.equal(result.seo.socialImage, "https://alamir.test/one.webp");
});

test("About preserves authored Section order, disabled state and profile documents without mutating input", () => {
  const page = source(
    block(
      "about-values",
      { values: { items: [{ image: localized(1), title: { ar: "قيم" } }] } },
      { enabled: false },
    ),
    block("about-vision", {
      body: lexical(heading("Mission"), paragraph("Purpose")),
      profile: {
        image: localized(1),
        story: lexical(paragraph("Story")),
        vision: lexical(paragraph("Vision")),
        mission: lexical(paragraph("Mission")),
      },
    }),
    block("about-facility", { video: { src: localized(2) } }),
    block("about-technology", {
      actions: {
        items: [{ label: { fr: "Contact" }, href: { fr: "/contact" } }],
      },
    }),
  );
  const original = structuredClone(page);
  const result = presentEditorialPage(page, "https://alamir.test");
  assert.deepEqual(
    result.body.en.content.map((node) => node.attrs.id),
    ["values", "vision", "facility", "technology"],
  );
  assert.equal(result.body.en.content[0].attrs.visible, false);
  assert.equal(result.body.en.content[0].attrs.theme, "navy");
  assert.equal(
    nodesOfType(result.body.ar, "valuesRail")[0].attrs.items[0].title,
    "قيم",
  );
  assert.equal(
    nodesOfType(result.body.fr, "aboutProfile")[0].attrs.image,
    "https://alamir.test/one.webp",
  );
  assert.equal(
    textContent(nodesOfType(result.body.fr, "aboutProfile")[0].attrs.mission),
    "Mission",
  );
  assert.equal(
    nodesOfType(result.body.fr, "actions")[0].attrs.items[0].label,
    "Contact",
  );
  assert.deepEqual(page, original);
});

test("Quality retains certification holders, themed roadmap, lead copy, media cards and embedded sourcing", () => {
  const page = source(
    block("quality-credentials", {
      heading: lexical(heading("Certificates")),
      body2: lexical(paragraph("Download")),
      certificationPanel: { holder: localized("group") },
    }),
    block("quality-roadmap", {
      body: lexical(paragraph("Current"), paragraph("Future")),
      certificationPanel: { holder: localized("sadat-city") },
    }),
    block("quality-technology", {
      body: lexical(heading("Technology"), paragraph("Tools")),
      technologies: {
        items: [{ image: localized(1), description: { fr: "Outils" } }],
      },
    }),
    block("quality-sourcing", {
      body: lexical(heading("Sourcing")),
      video: {
        src: localized("https://youtu.be/example"),
        poster: localized(1),
      },
      pillars: { items: { item_1: { ar: "مصادر" }, item_2: { ar: "جودة" } } },
    }),
  );
  const result = presentEditorialPage(page, "https://alamir.test");
  assert.deepEqual(
    nodesOfType(result.body.en, "certificationPanel").map(
      (node) => node.attrs.holder,
    ),
    ["group", "sadat-city"],
  );
  assert.equal(result.body.en.content[1].attrs.theme, "navy");
  assert.equal(
    nodesOfType(result.body.en.content[0], "paragraph")[0].attrs.variant,
    "lead",
  );
  assert.equal(
    nodesOfType(result.body.en.content[1], "paragraph")[1].attrs.variant,
    "lead",
  );
  assert.equal(
    nodesOfType(result.body.fr, "mediaCards")[0].attrs.items[0].image,
    "https://alamir.test/one.webp",
  );
  assert.equal(
    nodesOfType(result.body.ar, "pillars")[0].attrs.items[0],
    "مصادر",
  );
  const video = nodesOfType(result.body.en, "video")[0].attrs;
  assert.equal(video.src, "https://youtu.be/example");
  assert.equal(video.poster, "https://alamir.test/one.webp");
  assert.equal(video.source, "embed");
  assert.equal(video.controls, true);
});

test("Editorial hero and rich uploads resolve from actual stored IDs and missing uploads stay empty", () => {
  const hero = block("quality-hero", {
    image: 1,
    title: lexical(paragraph("Quality")),
    description: lexical({ type: "upload", relationTo: "media", value: 1 }),
  });
  const page = source(hero);
  page.mediaRefs.get(1).mimeType = "image/webp";
  const result = presentEditorialPage(page, "https://alamir.test", hero);
  assert.equal(result.hero.image, "https://alamir.test/one.webp");
  assert.equal(result.hero.description.en.content[0].type, "image");
  assert.deepEqual(result.body.en.content, []);
  assert.equal(
    presentEditorialPage(
      source(block("about-hero", { image: 999 })),
      "https://alamir.test",
    ).hero.image,
    "",
  );
});
