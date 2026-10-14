import type {
  HomeSeoContent,
  LocalizedDocument,
  LocalizedValue,
} from "@/lib/cms/types";

export type EventKind = "event" | "recap";
export type EventContent = {
  seedVersion?: number;
  title: LocalizedDocument;
  eyebrow: LocalizedValue;
  summary: LocalizedValue;
  location: LocalizedValue;
  venue: LocalizedValue;
  stand: LocalizedValue;
  body: LocalizedDocument;
  heroImage: string;
  heroAlt: LocalizedValue;
  heroCaption: LocalizedValue;
  seo: HomeSeoContent;
};
export type EventRecord = {
  id: number;
  slug: string;
  kind: EventKind;
  published: boolean;
  sort_order: number;
  starts_at: string;
  ends_at: string;
  timezone?: string;
  content: EventContent;
  created_at?: string;
  updated_at?: string;
};
export type EventSlotStatus = "available" | "reserved";
export type PublicEventSlot = {
  id: number;
  eventId: number;
  startsAt: string;
  endsAt: string;
  status: EventSlotStatus;
};
