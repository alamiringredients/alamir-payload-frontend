import {
  textContent,
  type ContentNode,
  type ContentDocument,
} from "./document";
type LexicalNode = {
  type: string;
  text?: string;
  format?: number | string;
  tag?: string;
  listType?: string;
  fields?: Record<string, unknown>;
  value?: {
    url?: string;
    mimeType?: string;
    filename?: string;
    alt?: string | Record<string, string>;
    width?: number;
    height?: number;
  };
  children?: LexicalNode[];
};
export function richText(
  value: unknown,
  attributes?: ContentNode,
  locale = "en",
): ContentDocument {
  const root = (value as { root?: LexicalNode } | null)?.root;
  function convert(n: LexicalNode, original?: ContentNode): ContentNode {
    let type = n.type;
    if (type === "root") type = "doc";
    if (type === "list")
      type = n.listType === "number" ? "orderedList" : "bulletList";
    if (type === "listitem") type = "listItem";
    if (type === "quote") type = "blockquote";
    if (type === "linebreak") type = "hardBreak";
    if (type === "horizontalrule") type = "horizontalRule";
    if (type === "table") {
      const plain = (node: LexicalNode): string =>
        node.text ?? node.children?.map(plain).join("") ?? "";
      const rows = (n.children ?? []).map((row) =>
        (row.children ?? []).map(plain),
      );
      return {
        type: "dataTable",
        attrs: {
          headers: rows[0] ?? [],
          rows: rows.slice(1),
          statusColumn: true,
        },
      };
    }
    if (type === "block" && n.fields) {
      const fields = n.fields;
      const body = richText(fields.body, undefined, locale).content;
      const heading = richText(fields.heading, undefined, locale).content;
      const photo = (media: unknown, caption?: unknown): ContentNode => {
        const image = media as
          | {
              url?: string;
              alt?: string | Record<string, string>;
              mimeType?: string;
            }
          | undefined;
        return {
          type: image?.mimeType?.startsWith("video/") ? "video" : "image",
          attrs: {
            src: image?.url ?? "",
            alt:
              typeof image?.alt === "string"
                ? image.alt
                : (image?.alt?.[locale] ?? ""),
            caption,
            ratio: "original",
            position: "center",
          },
        };
      };
      if (fields.blockType === "facts")
        return {
          type: "facts",
          attrs: {
            label: textContent({ type: "doc", content: heading }),
            items: fields.items,
          },
        };
      if (fields.blockType === "figures")
        return { type: "textStatistics", attrs: { items: fields.items } };
      if (fields.blockType === "callout")
        return { type: "callout", content: body };
      if (fields.blockType === "gallery")
        return {
          type: "gallery",
          attrs: {
            caption: textContent({ type: "doc", content: body }),
            images: (
              (fields.images ?? []) as {
                image: { url?: string };
                caption?: string;
                alt?: string;
              }[]
            ).map((row) => ({
              src: row.image?.url ?? "",
              caption: row.caption ?? "",
              alt: row.alt ?? "",
            })),
          },
        };
      const content = [...heading, ...body];
      if (fields.blockType === "text-media") {
        const media=fields.rightContent?richText(fields.rightContent,undefined,locale).content:[photo(fields.media,fields.caption)];
        const text={type:'column',content:[...heading,...body]} as ContentNode;
        const other={type:'column',content:media} as ContentNode;
        const mediaFirst=(fields.mediaPosition==='left')!==(locale==='ar');
        return {type:'columns',attrs:{layout:'prose-media',columnWidth:fields.columnWidth==='original'?undefined:fields.columnWidth,verticalAlign:'center'},content:mediaFirst?[other,text]:[text,other]};
      }
      if (fields.blockType === "call-to-action")
        content.push({ type: "actions", attrs: { items: fields.actions } });
      return { type: "contentSection", content };
    }
    if (type === "upload" && n.value?.url) {
      const media = n.value;
      const src = new URL(media.url!, process.env.NEXT_PUBLIC_BACKEND_URL).href;
      const alt = String(
        n.fields?.alt ??
          (typeof media.alt === "string"
            ? media.alt
            : (media.alt?.[locale] ?? "")),
      );
      if (media.mimeType?.startsWith("video/"))
        return { type: "video", attrs: { src, label: alt } };
      if (media.mimeType?.startsWith("image/"))
        return {
          type: "image",
          attrs: {
            src,
            alt,
            width: media.width,
            height: media.height,
            ratio: "original",
            position: "center",
            caption: n.fields?.caption,
            captionLabel: n.fields?.captionLabel,
          },
        };
      return {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: media.filename ?? "",
            marks: [{ type: "link", attrs: { href: src } }],
          },
        ],
      };
    }
    const node: ContentNode = {
      type,
      ...(original?.attrs ? { attrs: original.attrs } : {}),
    };
    if (
      typeof n.format === "string" &&
      ["left", "right", "center", "justify", "start", "end"].includes(n.format)
    )
      node.attrs = { ...node.attrs, textAlign: n.format };
    if (type === "heading")
      node.attrs = {
        ...node.attrs,
        level: Number(n.tag?.slice(1) ?? 2),
        id:
          node.attrs?.id ??
          (n.children ?? [])
            .map((child) => child.text ?? "")
            .join("")
            .normalize("NFKD")
            .toLowerCase()
            .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
            .replace(/^-|-$/g, ""),
      };
    if (n.text !== undefined) {
      node.text = n.text;
      node.marks = (
        [
          ["bold", 1],
          ["italic", 2],
          ["strike", 4],
          ["underline", 8],
          ["code", 16],
        ] as const
      )
        .filter(([, flag]) => (Number(n.format ?? 0) & flag) !== 0)
        .map(([type]) => ({ type }));
    }
    if (n.children)
      node.content = n.children.flatMap((child, i) => {
        if (child.type === "link" || child.type === "autolink")
          return (child.children ?? []).map((linkChild) => {
            const converted = convert(linkChild);
            return {
              ...converted,
              marks: [
                ...(converted.marks ?? []),
                {
                  type: "link",
                  attrs: { href: String(child.fields?.url ?? "") },
                },
              ],
            };
          });
        return [convert(child, original?.content?.[i])];
      });
    return node;
  }
  return root
    ? (convert(root, attributes) as ContentDocument)
    : { type: "doc", content: [] };
}
