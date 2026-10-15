"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { CmsForm, FormPurpose, FormScope } from "@/lib/forms/types";
import type { CountryOption } from "@/lib/countries";
import type { SiteLocale } from "@/i18n/navigation";
import {selectFormDefinition} from '@/lib/forms/ownership';
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
  const refresh = useCallback((scope?: FormScope) => {
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
  }, [locale]);
  return (
    <Context.Provider value={{ forms: definitions, countries:countryOptions, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function useFormDefinition(purpose: FormPurpose, ownerId?: number, enabled=true) {
  const { forms, countries, refresh } = useContext(Context);
  const pathname = usePathname();
  const {definition, scope} = selectFormDefinition(forms, purpose, pathname, ownerId);
  useEffect(() => {
    if (enabled && !definition) refresh(scope);
  }, [purpose, ownerId, pathname, Boolean(definition), enabled, refresh]);
  return {definition, countries};
}
