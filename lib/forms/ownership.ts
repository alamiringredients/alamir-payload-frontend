import type {CmsForm, FormPurpose, FormScope, FormOwner} from './types'

const purposes: Record<FormPurpose, {page: string; collection?: FormScope['collection']; preload?: boolean}> = {
  home: {page: 'home-page'},
  contact: {page: 'contact-page', preload: true},
  quote: {page: 'contact-page', collection: 'products'},
  application: {page: 'careers-page', collection: 'jobs', preload: true},
  reservation: {page: 'book-a-meeting-page', collection: 'events'},
  search: {page: 'search-page', preload: true},
}

export function pageFormScope(page: FormOwner): FormScope | undefined {
  const purpose = (Object.keys(purposes) as FormPurpose[]).find(purpose => purposes[purpose].preload && purposes[purpose].page === page.sourceKey)
  return purpose ? {purpose, collection: 'pages', ownerId: page.id} : undefined
}

export function parseFormScope(params: URLSearchParams): FormScope | undefined | null {
  const purpose = params.get('purpose')
  if (!purpose) return undefined
  const collection = params.get('collection')
  const ownerId = params.has('ownerId') ? Number(params.get('ownerId')) : undefined
  const slug = params.get('slug') || undefined
  if (!Object.hasOwn(purposes, purpose)) return null
  const policy = purposes[purpose as FormPurpose]
  if ((collection !== 'pages' && collection !== policy.collection) || (!slug && (!ownerId || !Number.isSafeInteger(ownerId) || ownerId < 1))) return null
  return {purpose: purpose as FormPurpose, collection: collection as FormScope['collection'], ownerId, slug}
}

export function findFormOwner(owners: readonly FormOwner[], scope: FormScope): FormOwner | undefined {
  return owners.find(owner => scope.slug ? owner.slug === scope.slug : (owner.sourceId ?? owner.id) === scope.ownerId)
}

export function selectFormDefinition(forms: readonly CmsForm[], purpose: FormPurpose, pathname: string, ownerId?: number): {definition?: CmsForm; scope?: FormScope} {
  const path = pathname.replace(/^\/(en|ar|fr)(?=\/|$)/, '')
  const policy = purposes[purpose]
  const collection = policy.collection ?? 'products'
  const productSlug = purpose === 'quote' && path.startsWith('/products/') && path.split('/').filter(Boolean).length === 3 ? path.split('/').at(-1) : undefined
  const relevant = forms.filter(form => form.purpose === purpose)
  if (ownerId || productSlug) {
    const definition = relevant.find(form => form.owner?.relationTo === collection && (ownerId
      ? (form.owner.value.sourceId ?? form.owner.value.id) === ownerId
      : form.owner.value.slug === productSlug))
    return {definition, scope: {purpose, collection, ownerId, slug: productSlug}}
  }
  const page = relevant.find(form => form.owner?.relationTo === 'pages' && (`/${form.owner.value.slug ?? ''}` === path || (path === '/' && form.owner.value.sourceKey === 'home-page')))
  const fallback = relevant.find(form => form.owner?.relationTo === 'pages' && form.owner.value.sourceKey === policy.page)
  return {
    definition: page ?? fallback,
    scope: purpose === 'quote' ? undefined : {purpose, collection: 'pages', slug: path.replace(/^\//, '') || 'home'},
  }
}
