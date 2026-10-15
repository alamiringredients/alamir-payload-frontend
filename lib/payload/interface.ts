import "server-only";
import { cache } from "react";
import { globalContent } from "./client";
import type { SiteLocale } from "@/i18n/navigation";
import type { CertificationInterfaceLabels } from "@/lib/certifications/types";

type Interface = {
  certification: Record<SiteLocale, CertificationInterfaceLabels>;
  countries: Record<SiteLocale, { value: string; label: string }[]>;
  news: Record<SiteLocale, Record<string, string>>;
  sustainability: Record<SiteLocale, Record<string, string>>;
  careers: Record<SiteLocale, Record<string, string>>;
  events: Record<SiteLocale, Record<string, string>>;
  search: Record<SiteLocale, Record<string, string>>;
  messages: Record<SiteLocale, Record<string, unknown>>;
};
export const getInterface = cache(() =>
  globalContent<Interface>("interface-text"),
);
