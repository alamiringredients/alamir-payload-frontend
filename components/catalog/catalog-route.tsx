import {pageSchema,siteUrl,breadcrumbsSchema} from '@/lib/seo/structured-data'
import {JsonLd} from '@/components/site/json-ld'
import type {Metadata} from 'next'
import {hasLocale} from 'next-intl'
import {notFound} from 'next/navigation'
import {CatalogPageBody} from './catalog-content'
import {getCatalog, getCatalogPayload, getSiteShell, getWebsiteSettings} from '@/lib/api/public'
import {resolveCatalogPage} from '@/lib/catalog/resolve'
import {categoryHeroImage, productHeroImage, productPath} from '@/lib/catalog/types'
import {localizedAlternates} from '@/lib/cms/metadata'
import {locales, localePath, type SiteLocale} from '@/i18n/navigation'
import {SitePage} from '@/components/site/site-page'

type CatalogRouteProps = {params: Promise<{locale: string; category?: string; product?: string}>}

async function resolveParams(params: CatalogRouteProps['params']) {
  const {locale, category, product} = await params
  if (!hasLocale(locales, locale)) notFound()
  return {locale, page: ['products', category, product].filter(Boolean).join('/')}
}

export async function catalogMetadata({params}: CatalogRouteProps) {
  const {locale, page} = await resolveParams(params)
  return getCatalogMetadata(page, locale)
}

export async function CatalogRoute({params}: CatalogRouteProps) {
  const {locale, page} = await resolveParams(params)
  return renderCatalogRoute(page, locale)
}

async function getCatalogMetadata(path: string, locale: SiteLocale): Promise<Metadata> {
  const catalog = await getCatalog(locale,path)
  const resolved = resolveCatalogPage(catalog, path)
  if (!resolved) notFound()

  const record = resolved.product ?? resolved.category
  const canonicalPath = resolved.product && resolved.category
    ? productPath(resolved.product, resolved.category)
    : `/${path}`
  const title = record?.content.seo?.title[locale]
    || record?.content.name[locale]
    || catalog.settings.seo.title[locale]
  const description = record?.content.seo?.description[locale]
    || record?.content.description[locale]
    || catalog.settings.seo.description[locale]
  const image = resolved.product
    ? productHeroImage(resolved.product)
    : resolved.category ? categoryHeroImage(resolved.category) : ''
  const socialImages = image ? [image] : []

  return {
    title,
    description,
    openGraph: {title, description, images: socialImages},
    twitter: {card: 'summary_large_image', title, description, images: socialImages},
    alternates: localizedAlternates(canonicalPath, locale),
  }
}

async function renderCatalogRoute(page: string, locale: SiteLocale) {
  const [{catalog, certifications, certificationLabels}, home, settings] = await Promise.all([
    getCatalogPayload(locale,page),
    getSiteShell(),
    getWebsiteSettings(),
  ])
  const resolved = resolveCatalogPage(catalog, page)
  if (!resolved) notFound()

  const body = <>{resolved.product&&resolved.category&&<JsonLd data={breadcrumbsSchema([{name:resolved.category.content.name[locale],path:`/products/${resolved.category.slug}`},{name:resolved.product.content.name[locale],path:productPath(resolved.product,resolved.category)}],locale)}/>}<CatalogPageBody
      certifications={certifications}
      certificationLabels={certificationLabels}
      catalog={catalog}
      locale={locale}
      settings={settings}
      content={resolved.content}
      category={resolved.category}
      product={resolved.product}
    /></>
  const catalogStyle = resolved.product ? 'product-detail' : resolved.category ? 'product-category' : undefined

  return <SitePage
    structuredData={pageSchema(localePath(resolved.product&&resolved.category?productPath(resolved.product,resolved.category):`/${page}`,locale),locale,(resolved.product??resolved.category)?.content.name[locale]??catalog.settings.seo.title[locale],(resolved.product??resolved.category)?.content.description[locale]??catalog.settings.seo.description[locale],resolved.product?{'@type':'Product',name:resolved.product.content.name[locale],description:resolved.product.content.description[locale],...(productHeroImage(resolved.product)?{image:siteUrl(productHeroImage(resolved.product))}:{}),manufacturer:{'@id':siteUrl('/#organization')}}:undefined)}
    page={page}
    catalogStyle={catalogStyle}
    catalogAppearance={resolved.category?.content.appearance}
    locale={locale}
    home={home}
    settings={settings}
  >{body}</SitePage>
}
