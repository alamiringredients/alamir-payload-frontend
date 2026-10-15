import { placeMedia } from "@/lib/editor/media-position";
import { backendOrigin } from "@/lib/payload/client";
import { presentEditorialPage } from "@/lib/cms/editorial-page";
import { getInterface } from "@/lib/payload/interface";
import { ContentRenderer } from "@/components/editor/content-renderer";
import { EditorialPageHero } from "@/components/editor/editorial-page-hero";
import { qualityBlockRenderer } from "@/components/certifications/quality-blocks";
import { getCertificationsPayload } from "@/lib/api/public";
import { type SectionArgs } from "../section-utils";

export async function renderSection({
  block,
  locale,
  source,
  definition,
  settings,
}: SectionArgs) {
  const { name, pageSlug } = definition;
  if (pageSlug === "about" || pageSlug === "quality") {
    const content = presentEditorialPage(source, backendOrigin(), block);
    if (name === "hero")
      return (
        <EditorialPageHero
          {...{
            kicker: content.hero.kicker[locale],
            title: content.hero.title[locale],
            description: content.hero.description[locale],
            image: content.hero.image,
            imageAlt: content.hero.alt[locale],
            mediaPosition: block.mediaPosition === "left" ? "left" : "right",
          }}
        />
      );
    const nodes = content.body[locale].content.filter(
      (node) => node.attrs?.id === name,
    );
    const document = placeMedia(
      { type: "doc", content: nodes },
      block.mediaPosition,
    );
    if (pageSlug === "quality") {
      const needsCertifications = nodes.some(
        (node) =>
          node.attrs?.visible !== false &&
          node.content?.some(
            (child) =>
              child.type === "certificationPanel" &&
              child.attrs?.visible !== false,
          ),
      );
      const data = needsCertifications
        ? await getCertificationsPayload(locale)
        : {
            certifications: { types: [], certifications: [] },
            certificationLabels: (await getInterface()).certification[locale],
          };
      return (
        <ContentRenderer
          fullWidth
          document={document}
          renderBlock={qualityBlockRenderer(
            data.certifications,
            locale,
            data.certificationLabels,
            settings.groupLogo,
          )}
        />
      );
    }
    return (
      <ContentRenderer
        fullWidth
        document={document}
        groupLogo={settings.groupLogo}
      />
    );
  }
}
