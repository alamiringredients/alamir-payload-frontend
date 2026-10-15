import type { Document } from "@/lib/payload/types";
import "server-only";
import {publishedSummary, publishedDocuments, publishedEventSummaries} from "@/lib/payload/public-site";
import { cache } from "react";
import {
  globalContent as global,
  records,
  record,
  recordDocuments,
  recordIdentities,
  translationContent,
  presentRecord,
  recordSource,
  catalogInterfaceLabels,
  mediaDocuments,
  localizedMedia,
  resolveMediaReferences,
} from "@/lib/payload/client";
import type { SiteLocale } from "@/i18n/navigation";
import type {
  HomeCmsData,
  ManagedPageContent,
  WebsiteSettings,
  QualityPageContent,
} from "@/lib/cms/types";
import type {
  Catalog,
  Category,
  Product,
  NavigationCatalog,
  CategoryCard,
  CatalogLabels,
} from "@/lib/catalog/types";
import type { LocalizedValue } from "@/lib/cms/types";
import type {
  CertificationData,
  CertificationType,
  Certification,
} from "@/lib/certifications/types";
import type { EventRecord, EventCard, PublicEventSlot } from "@/lib/events/types";
import type {
  NewsPageContent,
  NewsRecord,
  NewsTaxonomy,
} from "@/lib/news/types";
import type {
  SustainabilityRecord,
  SustainabilityPageContent,
} from "@/lib/sustainability/types";
import type { CareersContent, JobRecord } from "@/lib/careers/types";
import type { SearchResult } from "@/lib/search/match";

import { getInterface } from "@/lib/payload/interface";
import type { DownloadsPageContent } from "@/lib/downloads/types";
import type { NewsVersion } from "@/lib/news/types";
import type { SustainabilityVersion } from "@/lib/sustainability/types";

export type NewsCardVersion = Pick<
  NewsVersion,
  "title" | "summary" | "cardTitle" | "cardSummary" | "hero" | "heroAlt"
>;
export type NewsCardRecord = Pick<NewsRecord, "id" | "slug"> & {
  content: Omit<NewsRecord["content"], "locales">;
  published: Partial<Record<SiteLocale, NewsCardVersion>>;
};
export type JobCard = Omit<JobRecord, "content"> & {
  content: Record<
    SiteLocale,
    Pick<
      JobRecord["content"][SiteLocale],
      | "title"
      | "summary"
      | "department"
      | "location"
      | "contract"
      | "experience"
    >
  >;
};
export type SustainabilityCardVersion = Pick<
  SustainabilityVersion,
  "title" | "cardTitle" | "summary" | "cardSummary" | "badge" | "gallery"
>;
export type SustainabilityCard = Pick<SustainabilityRecord, "id" | "slug"> & {
  content: Omit<SustainabilityRecord["content"], "locales">;
  published: Partial<Record<SiteLocale, SustainabilityCardVersion>>;
};
type PublicNewsRecord = NewsRecord & {
  availableLocales: SiteLocale[];
  draft?: NewsVersion;
};
type PublicSustainabilityArticle = SustainabilityRecord & {
  availableLocales: SiteLocale[];
  draft?: SustainabilityVersion;
};
type NewsMetadataRecord = Pick<PublicNewsRecord, "id" | "slug" | "availableLocales"> & {
  published: Partial<Record<SiteLocale, Pick<NewsVersion, "seoTitle" | "seoDescription" | "hero">>>;
};
type SustainabilityMetadataRecord = Pick<PublicSustainabilityArticle, "id" | "slug" | "availableLocales"> & {
  published: Partial<Record<SiteLocale, Pick<SustainabilityVersion, "seoTitle" | "seoDescription" | "gallery">>>;
};
type ManagedPageKey =
  | "contact"
  | "privacy"
  | "terms"
  | "cookies"
  | "thank-you"
  | "404"
  | "products"
  | "events"
  | "book-a-meeting"
  | "search";

const catalog = cache(async (path = ""): Promise<Catalog> => {
  const [categoryDocs, productDocs, settings] = await Promise.all([
    recordDocuments("categories"),
    recordDocuments("products"),
    global<Catalog["settings"]>("catalog-settings"),
  ]);
  const [, categorySlug, productSlug] = path.split("/");
  const selectedCategory = categoryDocs.find(
    (doc) => doc.slug === categorySlug,
  );
  const children = productDocs.filter(
    (doc) =>
      Number((doc.category as { id: number } | undefined)?.id) ===
      selectedCategory?.id,
  );
  const selectedProduct =
    children.find((doc) => doc.slug === productSlug) ??
    (!productSlug && children.length === 1 ? children[0] : undefined);
  const categories = categoryDocs.map((doc) =>
    presentRecord<Category>(
      "categories",
      doc,
      doc.id === selectedCategory?.id ? undefined : "card",
    ),
  );
  const products = productDocs.map((doc) =>
    presentRecord<Product>(
      "products",
      doc,
      doc.id === selectedProduct?.id ? undefined : "card",
    ),
  );
  const categoryIds = new Set(categories.map((category) => category.id));
  return {
    categories,
    products: products.filter((product) =>
      categoryIds.has(product.category_id),
    ),
    settings,
  };
});
export const getCatalogIdentities = cache(async () => {
  const [categoryDocs, productDocs] = await Promise.all([
    recordIdentities("categories"),
    recordIdentities("products"),
  ]);
  const categoriesById = new Map(categoryDocs.map(doc => [doc.id, doc]));
  return {
    categories: categoryDocs.map(doc => ({id: doc.sourceId ?? doc.id, slug: doc.slug!})),
    products: productDocs.flatMap(doc => {
      const category = categoriesById.get(Number(doc.category));
      return category ? [{
        id: doc.sourceId ?? doc.id,
        slug: doc.slug!,
        category_id: category.sourceId ?? category.id,
      }] : [];
    }),
  };
});
export const getNavigationCatalog = cache(
  async (): Promise<
    NavigationCatalog & {
      categories: CategoryCard[];
      settings: { labels: CatalogLabels };
    }
  > => {
    const [categoryRows, productRows, mediaRows] = await Promise.all([
      publishedSummary("categories"),
      publishedSummary("products"),
      publishedSummary("media"),
    ]);
    const media = new Map(mediaRows.map((doc) => [doc.id, doc]));
    const values = (value: unknown): LocalizedValue =>
      Object.fromEntries(
        ["en", "ar", "fr"].map((locale) => [
          locale,
          (value as Partial<LocalizedValue> | undefined)?.[
            locale as SiteLocale
          ] ?? "",
        ]),
      ) as LocalizedValue;
    const categories = categoryRows.map((doc: Document) => {
      const page = doc.page as {
        artwork?: { enabled?: boolean; images?: { image: number }[] };
      };
      return {
        id: doc.sourceId ?? doc.id,
        slug: doc.slug!,
        content: {
          name: values(doc.name),
          description: values(doc.description),
          icon: String(media.get(Number(doc.icon))?.url ?? ""),
          artwork: {
            key: "artwork",
            label: "",
            enabled: Boolean(page?.artwork?.enabled),
            texts: [],
            links: [],
            assets: (page?.artwork?.images ?? []).map((photo, index) => ({
              id: String(index),
              kind: "image" as const,
              label: "",
              source: "",
              value: String(media.get(photo.image)?.url ?? ""),
            })),
          },
        },
      } as CategoryCard;
    });
    const categoryIds = new Map(
      categoryRows.map((doc: Document) => [
        doc.id,
        doc.sourceId ?? doc.id,
      ]),
    );
    const products = productRows.map((doc: Document) => ({
      id: doc.sourceId ?? doc.id,
      slug: doc.slug!,
      category_id: Number(categoryIds.get(Number(doc.category))),
      content: {
        name: values(doc.name),
        gallery: (
          (doc.gallery as {
            image: number;
            caption: LocalizedValue;
            alt?: LocalizedValue;
          }[]) ?? []
        )
          .slice(0, 1)
          .map((photo) => ({
            ...photo,
            image: String(media.get(photo.image)?.url ?? ""),
          })),
      },
    }));
    return {
      categories,
      products,
      settings: {
        labels: await catalogInterfaceLabels(),
      },
    };
  },
);
const certifications = cache(async (): Promise<CertificationData> => {
  const [typeDocs, certDocs, media, interfaceText] = await Promise.all([
    publishedDocuments("certification-types"),
    publishedDocuments("certifications"),
    mediaDocuments(),
    translationContent(),
  ]);
  const typeIds = new Map(typeDocs.map((doc) => [doc.id, doc]));
  return {
    types: typeDocs.map((doc) =>
      presentRecord<CertificationType>("certification-types", {
        ...doc,
        logo: localizedMedia(doc.logo, media),
        interface: interfaceText,
      }),
    ),
    certifications: certDocs.map((doc) =>
      presentRecord<Certification>("certifications", {
        ...doc,
        certificationType: typeIds.get(Number(doc.certificationType)),
        document: localizedMedia(doc.document, media),
        interface: interfaceText,
      }),
    ),
  };
});

export const getLayoutPayload = cache(async () => {
  const [settings, home, c] = await Promise.all([
    global<WebsiteSettings>("website-settings"),
    global<HomeCmsData>("navigation"),
    getNavigationCatalog(),
  ]);
  return {
    settings,
    home,
    catalog: c,
  };
});

export const getHomepagePayload = cache(async (locale: SiteLocale) => {
  const ui = await getInterface();
  const [home, certs, events, media] = await Promise.all([
    global<HomeCmsData>("home-page", "meta"),
    certifications(),
    publishedEventSummaries(),
    mediaDocuments(),
  ]);
  return {
    home,
    certifications: certs,
    certificationLabels: ui.certification[locale],
    countries: ui.countries[locale],
    meetingEvent:
      events
        .map((doc) =>
          presentRecord<EventCard>(
            "events",
            recordSource(
              resolveMediaReferences(
                { ...doc, interface: undefined },
                media,
              ) as Document,
            ),
            "card",
          ),
        )
        .find(
          (event) =>
            event.kind === "event" && new Date(event.ends_at) > new Date(),
        ) ?? null,
  };
});

export const getCatalogPayload = cache(
  async (locale: SiteLocale, page: string) => {
    const ui = await getInterface();
    const [c, certs] = await Promise.all([
      catalog(page),
      certifications(),
    ]);
    return {
      catalog: c,
      certifications: certs,
      certificationLabels: ui.certification[locale],
    };
  },
);

export const getNewsPayload = cache(
  async (locale: SiteLocale, slug?: string) => {
    const ui = await getInterface();
    const [articles, page, taxonomies] = await Promise.all([
      getNewsCards(),
      global<NewsPageContent>("news-page"),
      records<NewsTaxonomy>("news-taxonomies"),
    ]);
    return {
      cards: articles,
      source: slug ? await getPublicNewsArticle(locale, slug) : null,
      page,
      taxonomies,
      labels: ui.news[locale],
    };
  },
);

export const getSustainabilityPayload = cache(
  async (locale: SiteLocale, slug?: string) => {
    const ui = await getInterface();
    const [articles, page] = await Promise.all([
      getSustainabilityCards(),
      global<SustainabilityPageContent>("sustainability-page"),
    ]);
    return {
      articles,
      record: slug ? await getPublicSustainabilityArticle(locale, slug) : null,
      page,
      labels: ui.sustainability[locale],
    };
  },
);

export const getCareersPayload = cache(
  async (locale: SiteLocale, slug?: string) => {
    const ui = await getInterface();
    const [jobs, content] = await Promise.all([
      getPublicJobs(),
      global<CareersContent>("careers-page"),
    ]);
    return {
      jobs,
      job: slug ? await getPublicJob(locale, slug) : null,
      content,
      labels: ui.careers[locale],
    };
  },
);

export const getEventsPayload = cache(
  async (locale: SiteLocale, page = "events", slug?: string) => {
    const ui = await getInterface();
    const [events, slotDocs, managedContent, eventDocs] = await Promise.all([
      getPublicEvents(),
      page === "book-a-meeting" ? publishedDocuments("meeting-slots") : [],
      global<ManagedPageContent>(
        page === "book-a-meeting" ? "booking-page" : "events-page",
      ),
      page === "book-a-meeting" ? recordDocuments("events") : [],
    ]);
    const eventIds = new Map(
      eventDocs.map((event) => [event.id, event.sourceId ?? event.id]),
    );
    const slots: PublicEventSlot[] = slotDocs
      .filter((slot) => eventIds.has(Number(slot.event)))
      .map((slot) => ({
        id: slot.id,
        eventId: eventIds.get(Number(slot.event))!,
        startsAt: String(slot.startsAt),
        endsAt: String(slot.endsAt),
        status: slot.reserved ? "reserved" : "available",
      }));
    return {
      events,
      event: slug ? await getPublicEvent(locale, slug) : null,
      slots,
      managedContent,
      labels: ui.events[locale],
    };
  },
);

export const getSearchPayload = cache(
  async (query: string, locale: SiteLocale) => {
    const ui = await getInterface();
    if (!query.trim())
      return {
        content: await global<ManagedPageContent>("search-page"),
        labels: ui.search[locale],
        results: [],
      };
    const [c, news, jobs, events, sustainability, content] = await Promise.all([
      catalog(),
      getNewsCards(),
      getPublicJobs(),
      getPublicEvents(),
      getSustainabilityCards(),
      global<ManagedPageContent>("search-page"),
    ]);
    const results: SearchResult[] = [];
    const categoriesByID = new Map(
      c.categories.map((category) => [category.id, category]),
    );
    for (const product of c.products) {
      const category = categoriesByID.get(product.category_id);
      if (category)
        results.push({
          href: `/products/${category.slug}/${product.slug}`,
          title: product.content.name[locale],
          description: product.content.description[locale],
          section: ui.search[locale].products ?? "",
          text: "",
        });
    }
    for (const [items, base] of [
      [news, "news"],
      [sustainability, "sustainability"],
    ] as const)
      for (const item of items) {
        const v = item.published[locale];
        if (v)
          results.push({
            href: `/${base}/${item.slug}`,
            title: plain(v.title),
            description: v.summary,
            section: ui.search[locale][base] ?? "",
            text: "",
          });
      }
    for (const job of jobs)
      if (job.status === "open")
        results.push({
          href: `/careers/${job.slug}`,
          title: job.content[locale].title,
          description: job.content[locale].summary,
          section: ui.search[locale].careers ?? "",
          text: "",
        });
    for (const event of events)
      results.push({
        href: `/events/${event.slug}`,
        title: plain(event.content.title[locale]),
        description: event.content.summary[locale],
        section: ui.search[locale].events ?? "",
        text: "",
      });
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    return {
      content,
      labels: ui.search[locale],
      results: normalizedQuery
        ? results.filter((result) =>
            `${result.title} ${result.description}`
              .toLocaleLowerCase(locale)
              .includes(normalizedQuery),
          )
        : [],
    };
  },
);

export const getQualityPayload = cache(async (locale: SiteLocale) => {
  const ui = await getInterface();
  const [content, certs] = await Promise.all([
    global<QualityPageContent>("quality-page"),
    certifications(),
  ]);
  return { content, certifications: certs, labels: ui.certification[locale] };
});
export const getDownloadsPayload = cache(async (locale: SiteLocale) => {
  const ui = await getInterface();
  const [content, c, certs] = await Promise.all([
    global<DownloadsPageContent>("downloads-page"),
    catalog(),
    certifications(),
  ]);
  return {
    content,
    catalog: c,
    certifications: certs,
    labels: ui.certification[locale],
    fileSizes: {},
  };
});

export const getSiteShell = async () => (await getLayoutPayload()).home;
export const getWebsiteSettings = async () => {
  return (await getLayoutPayload()).settings;
};
export const getManagedPageContent = (
  key: ManagedPageKey,
  locale: SiteLocale,
) => {
  if (key === "events" || key === "book-a-meeting") {
    return getEventsPayload(locale, key).then((data) => {
      if (!data.managedContent) throw new Error("Managed event page missing");
      return data.managedContent;
    });
  }
  return global<ManagedPageContent>(
    `${key === "404" ? "not-found" : key}-page` as Parameters<typeof global>[0],
  );
};
export const getCatalog = (locale: SiteLocale, page: string) =>
  getCatalogPayload(locale, page).then((data) => data.catalog);
export const getPublicEvents = () =>
  records<EventCard>("events", "card");
export const getPublicEvent = (locale: SiteLocale, slug: string) =>
  record<EventRecord>("events", slug);
export const getNewsCards = () =>
  records<NewsCardRecord>("news", "card");
export const getPublicNewsArticle = (locale: SiteLocale, slug: string) =>
  record<PublicNewsRecord>("news", slug);
export const getPublicNewsPage = () =>
  global<NewsPageContent>("news-page");
export const getPublicJobs = cache(async () =>
  (await records<JobCard>("jobs", "card")).filter(job => job.status === "open"));
export const getPublicJob = (locale: SiteLocale, slug: string) =>
  record<JobRecord>("jobs", slug);
export const getSustainabilityCards = () =>
  records<SustainabilityCard>("sustainability", "card");


export const getPublicSustainabilityArticle = (locale: SiteLocale, slug: string) =>
  record<PublicSustainabilityArticle>("sustainability", slug);
export const getPublicSustainabilityPage = () =>
  global<SustainabilityPageContent>("sustainability-page");
export const getNewsArticleMetadata = (locale: SiteLocale, slug: string) =>
  record<NewsMetadataRecord>("news", slug, "meta");
export const getSustainabilityArticleMetadata = (locale: SiteLocale, slug: string) =>
  record<SustainabilityMetadataRecord>("sustainability", slug, "meta");
export const getEventMetadata = (locale: SiteLocale, slug: string) =>
  record<{content: Pick<EventRecord["content"], "seo">}>("events", slug, "meta");

export const getJobMetadata = (locale: SiteLocale, slug: string) =>
  record<{content: Record<SiteLocale, Pick<JobRecord["content"][SiteLocale], "title" | "summary">>}>("jobs", slug, "meta");

function plain(node: { text?: string; content?: unknown[] }): string {
  return (
    node.text ??
    (node.content ?? [])
      .map((child) => plain(child as Parameters<typeof plain>[0]))
      .join("")
  );
}
