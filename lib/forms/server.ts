import 'server-only'
import {cache} from 'react'
import type {SiteLocale} from '@/i18n/navigation'
import type {CmsForm, FormOwner, FormScope} from './types'
import {findFormOwner} from './ownership'
import {publishedForms, publishedIdentities} from '@/lib/payload/public-site'
import {pageIdentities, resolveMediaReferences, mediaDocuments} from '@/lib/payload/client'
import {getCountryOptions} from '@/lib/countries.server'

type StoredForm = Omit<CmsForm, 'owner'> & {owner?: {relationTo: FormScope['collection']; value: number}}

function presentForm({id, ui, purpose, title, fields, submitButtonLabel, confirmationType, confirmationMessage, redirect}: StoredForm, media: Awaited<ReturnType<typeof mediaDocuments>>): CmsForm {
  const form = resolveMediaReferences({id, ui, purpose, title, fields, submitButtonLabel, confirmationType, confirmationMessage, redirect}, media) as CmsForm
  form.fields = form.fields.map(field => {
    if (field.blockType !== 'product-select') return field
    const value = field.defaultValue && typeof field.defaultValue === 'object' ? String(field.defaultValue.id) : String(field.defaultValue ?? '')
    return {...field, defaultValue: field.options?.some(option => option.value === value) ? value : undefined}
  })
  return form
}
export async function getFormCountries(forms: CmsForm[], locale: SiteLocale) {
  return forms.some(form => form.fields.some(field => field.blockType === 'country' || field.includeDialCode)) ? getCountryOptions(locale) : []
}
const formOwners = cache(async (collection: FormScope['collection']): Promise<FormOwner[]> =>
  collection === 'pages' ? pageIdentities() : publishedIdentities(collection))

export const getForms = cache(async (locale: SiteLocale, scope?: FormScope): Promise<CmsForm[]> => {
  const collection = scope?.collection ?? 'pages'
  const owners = await formOwners(collection)
  const owner = scope ? findFormOwner(owners, scope) : undefined
  if (scope && !owner) return []
  const [docs, media] = await Promise.all([
    publishedForms(locale, scope?.purpose ?? 'quote', collection, owner?.id),
    mediaDocuments(),
  ])
  const ownersById = new Map(owners.map(owner => [owner.id, owner]))
  return (docs as unknown as StoredForm[]).flatMap(doc => {
    const resolvedOwner = doc.owner && ownersById.get(Number(doc.owner.value))
    if (!doc.owner || !resolvedOwner) return []
    const {id, sourceId, slug, sourceKey} = resolvedOwner
    return [{...presentForm(doc, media), owner: {relationTo: doc.owner.relationTo, value: {id, sourceId, slug, sourceKey}}}]
  })
})
export const getCustomForms = cache(async (locale: SiteLocale, ids: number[]): Promise<CmsForm[]> => {
  if (!ids.length) return []
  const [docs, media] = await Promise.all([publishedForms(locale, 'custom'), mediaDocuments()])
  const selected = new Set(ids)
  return (docs as unknown as StoredForm[]).filter(form => selected.has(form.id)).map(form => presentForm(form, media))
})
