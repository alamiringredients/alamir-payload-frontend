import "server-only";
import { cache } from "react";
import type { SiteLocale } from "@/i18n/navigation";
import type { CmsForm, FormPurpose } from "./types";
import {recordDocuments,pageIdentities,resolveMediaReferences,mediaDocuments,request} from '@/lib/payload/client';
import {getCountryOptions} from '@/lib/countries.server';
function normalizeFields(fields: CmsForm['fields']) {
  return fields.map(field => {
    if (field.blockType !== 'product-select') return field;
    const value = field.defaultValue && typeof field.defaultValue === 'object' ? String(field.defaultValue.id) : String(field.defaultValue ?? '');
    return {...field, defaultValue: field.options?.some(option => option.value === value) ? value : undefined};
  });
}
export async function getFormCountries(forms:CmsForm[],locale:SiteLocale){
 return forms.some(form=>form.fields.some(field=>field.blockType==='country'||('includeDialCode' in field&&field.includeDialCode)))?getCountryOptions(locale):[];
}
export type FormScope = { purpose: FormPurpose; collection: 'pages' | 'jobs' | 'events' | 'products'; ownerId?: number; slug?: string };
export const getForms = cache(
  async (locale: SiteLocale, scope?: FormScope): Promise<CmsForm[]> => {
    const params = new URLSearchParams({ locale, depth: '0', pagination: 'false', joins: 'false' });
    params.set('where[owner.relationTo][equals]', scope?.collection ?? 'pages');
    params.set('where[purpose][equals]',scope?.purpose??'quote');
    if (scope) {
      const owner = (scope.collection==='pages'?await pageIdentities():await recordDocuments(scope.collection)).find(doc => scope.slug ? doc.slug === scope.slug : (doc.sourceId ?? doc.id) === scope.ownerId);
      if (!owner) return [];
      params.set('where[owner.value][equals]', String(owner.id));
      params.set('where[purpose][equals]', scope.purpose);
    }
    for (const field of ['ui', 'purpose', 'title', 'fields', 'submitButtonLabel', 'confirmationType', 'confirmationMessage', 'redirect', 'owner']) params.set(`select[${field}]`, 'true');
    const data = await request(`forms?${params}`);
    const media=await mediaDocuments();
    const formDocs=(data.docs as unknown as CmsForm[]).map(form=>resolveMediaReferences(form,media) as CmsForm);
    const owners=scope && scope.collection!=='pages'?await recordDocuments(scope.collection):await pageIdentities();
    return formDocs.flatMap(
        ({
          ui,
          id,
          purpose,
          title,
          fields,
          submitButtonLabel,
          confirmationType,
          confirmationMessage,
          redirect,
          owner,
        }: CmsForm) => {
          if (!owner) return [];
          const resolvedOwner=owners.find(doc=>doc.id===Number(owner.value));
          if(!resolvedOwner)return [];
          return [{
          ui,
          id,
          purpose,
          title,
          fields:normalizeFields(fields),
          submitButtonLabel,
          confirmationType,
          confirmationMessage,
          redirect,
          owner: { relationTo: owner.relationTo, value: { id: resolvedOwner.id, sourceId: resolvedOwner.sourceId, slug: resolvedOwner.slug, sourceKey: resolvedOwner.sourceKey as string|undefined } },
        }];
        },
      );
  },
);

export const getCustomForms = cache(async (locale: SiteLocale, ids: number[]): Promise<CmsForm[]> => {
  if (!ids.length) return [];
  const params = new URLSearchParams({locale, depth: '0', pagination: 'false', 'where[purpose][equals]': 'custom'});
  for (const field of ['ui', 'purpose', 'title', 'fields', 'submitButtonLabel', 'confirmationType', 'confirmationMessage', 'redirect']) params.set(`select[${field}]`, 'true');
  const [data, media] = await Promise.all([request(`forms?${params}`), mediaDocuments()]);
  const selected = new Set(ids);
  return (data.docs as CmsForm[]).filter(form => selected.has(form.id)).map(form => ({...resolveMediaReferences(form, media) as CmsForm, fields: normalizeFields(form.fields)}));
});
