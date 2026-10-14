"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { CmsForm, FormPurpose } from "@/lib/forms/types";
import type { CountryOption } from "@/lib/countries";
import type { SiteLocale } from "@/i18n/navigation";
import type { FormScope } from '@/lib/forms/server';
const Context = createContext<{
  forms: CmsForm[];
  countries: readonly CountryOption[];
  refresh: (scope?: FormScope) => void;
}>({ forms: [], countries: [], refresh: () => {} });
export function FormScopeProvider({ forms, countries, children }: { forms: CmsForm[]; countries?:readonly CountryOption[]; children: ReactNode }) {
  const parent = useContext(Context);
  return <Context.Provider value={{ ...parent, countries:countries?.length?countries:parent.countries, forms: [...parent.forms, ...forms] }}>{children}</Context.Provider>;
}
export function FormsProvider({
  children,
  forms,
  countries,
  locale,
}: {
  children: ReactNode;
  forms: CmsForm[];
  countries: readonly CountryOption[];
  locale: SiteLocale;
}) {
  const [definitions, setDefinitions] = useState(forms);
  const [countryOptions,setCountryOptions]=useState(countries);
  const pending = useRef(new Set<string>());
  useEffect(() => setDefinitions(forms), [forms]);
  const refresh = (scope?: FormScope) => {
    const params = new URLSearchParams({ locale });
    if (scope) for (const [key,value] of Object.entries(scope)) if (value !== undefined) params.set(key,String(value));
    const key = params.toString();
    if (pending.current.has(key)) return;
    pending.current.add(key);
    void fetch(`/api/forms?${params}`)
      .then(async (response) => {
        if (response.ok) {
          const {forms:added,countries:loadedCountries}: {forms:CmsForm[];countries:CountryOption[]} = await response.json();
          if(loadedCountries.length)setCountryOptions(loadedCountries);
          setDefinitions(previous => [...previous.filter(form => !added.some(item => item.id === form.id)), ...added]);
        }
      })
      .catch(() => {})
      .finally(() => {
        pending.current.delete(key);
      });
  };
  return (
    <Context.Provider value={{ forms: definitions, countries:countryOptions, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function useFormDefinition(purpose: FormPurpose, ownerId?: number, enabled=true) {
  const { forms, countries, refresh } = useContext(Context);
  const pathname = usePathname().replace(/^\/(en|ar|fr)(?=\/|$)/, "");
  const collection =
    purpose === "application"
      ? "jobs"
      : purpose === "reservation"
        ? "events"
        : "products";
  const idMatches = (form: CmsForm) =>
    (form.owner?.value?.sourceId ?? form.owner?.value?.id) === ownerId;
  const relevant = forms.filter((form) => form.purpose === purpose);
  const specific = ownerId
    ? relevant.find(
        (form) => form.owner?.relationTo === collection && idMatches(form),
      )
    : purpose === "quote" && pathname.startsWith("/products/")
      ? relevant.find(
          (form) =>
            form.owner?.relationTo === "products" &&
            form.owner?.value?.slug === pathname.split("/").at(-1),
        )
      : undefined;
  const productSlug = purpose === 'quote' && pathname.split('/').filter(Boolean).length === 3 && pathname.startsWith('/products/') ? pathname.split('/').at(-1) : undefined;
  const page = relevant.find(
    (form) =>
      form.owner?.relationTo === "pages" &&
      ("/" + (form.owner?.value?.slug ?? "") === pathname ||
        (pathname === "/" && form.owner?.value?.sourceKey === "home-page")),
  );
  const fallback = relevant.find(
    (form) =>
      form.owner?.relationTo === "pages" &&
      form.owner?.value?.sourceKey ===
        {
          home: "home-page",
          contact: "contact-page",
          quote: "contact-page",
          application: "careers-page",
          reservation: "book-a-meeting-page",
          search: "search-page",
        }[purpose],
  );
  const definition = ownerId || productSlug ? specific : (page ?? fallback);
  useEffect(() => {
    if (enabled && !definition) refresh(ownerId || productSlug ? { purpose, collection, ownerId, slug: productSlug } : purpose==='quote'?undefined:{purpose,collection:'pages',slug:pathname.replace(/^\//,'')||'home'});
  }, [purpose, ownerId, pathname, Boolean(definition), enabled]);
  return { definition, countries };
}
