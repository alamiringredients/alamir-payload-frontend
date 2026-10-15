import {richText} from '../editor/lexical.ts'
import {pageSections, type SectionBlock} from '../payload/section-projection.ts'
import {cmsLocales, object, localizedText as text, localizedDocument as document, mediaURL, type Fields} from './fields.ts'
import type {CareersContent} from '../careers/types'
import type {DownloadsPageContent} from '../downloads/types'
import type {NewsPageContent, NewsPageLocale} from '../news/types'
import type {HomeSeoContent} from './types'

type Page = {page: Fields; layout: SectionBlock[]}
function section(page: Page, name: string, selected?: SectionBlock): Fields {
  const blocks = selected ? [selected] : page.layout
  return blocks.filter(block => pageSections.get(block.blockType)?.name === name)
    .at(-1)?.content ?? {}
}
export function pageSeo(page: Page, origin: string): HomeSeoContent {
  const seo = object(page.page.seo)
  return {title: text(seo.title), description: text(seo.description), socialTitle: text(seo.socialTitle),
    socialDescription: text(seo.socialDescription), socialImage: mediaURL(seo.socialImage, origin)}
}

export function presentCareersPage(page: Page, origin: string, selected?: SectionBlock): CareersContent {
  const hero = section(page, 'hero', selected), jobs = section(page, 'jobs', selected), apply = section(page, 'apply', selected)
  return {
    hero: {title: document(hero.title), description: document(hero.description), kicker: text(hero.kicker),
      image: mediaURL(hero.image, origin), alt: text(hero.alt)},
    empty: text(object(page.page.emptyStates).empty),
    jobsTitle: document(jobs.title), jobsIntro: document(jobs.intro), jobsKicker: text(jobs.kicker),
    applyTitle: document(apply.title), applyIntro: document(apply.intro), applyKicker: text(apply.kicker),
    sectionVisibility: {hero: true, jobs: true, apply: true}, seo: pageSeo(page, origin),
  }
}

export function presentDownloadsPage(page: Page, origin: string, selected?: SectionBlock): DownloadsPageContent {
  const hero = section(page, 'hero', selected), product = section(page, 'product', selected), company = section(page, 'company', selected)
  const empty = object(page.page.emptyStates)
  return {
    heroImage: mediaURL(hero.image, origin), heroImageAlt: text(hero.imageAlt),
    heroTitle: text(hero.title), heroAccent: text(hero.accent), heroEyebrow: text(hero.eyebrow),
    heroHeading: document(hero.heading), heroDescription: text(hero.description),
    productTitle: text(product.title), productAccent: text(product.accent), productEyebrow: text(product.eyebrow), productHeading: document(product.heading),
    companyTitle: text(company.title), companyAccent: text(company.accent), companyEyebrow: text(company.eyebrow), companyHeading: document(company.heading), profileLabel: text(company.profileLabel),
    noTds: text(empty.noTds), noCompany: text(empty.noCompany),
    sectionVisibility: {hero: true, products: true, company: true}, seo: pageSeo(page, origin),
  }
}

export function presentNewsPage(page: Page, origin: string, selected?: SectionBlock): NewsPageContent {
  // News Sections own different fields of the same page copy. A selected copy
  // includes only its fields and shared settings, never a sibling's content.
  const copy = Object.assign({}, object(page.page.copy), ...(selected ? [selected] : page.layout)
    .filter(block => pageSections.get(block.blockType)?.pageSlug === 'news').map(block => block.content)) as Fields
  const texts = ['empty', 'kicker', 'heroAlt', 'seoTitle', 'description', 'eventsKicker', 'contactKicker', 'relatedKicker', 'seoDescription', 'eventsDescription', 'contactDescription'] as const
  const headings = ['title', 'eventsTitle', 'contactTitle', 'relatedTitle'] as const
  const localized = Object.fromEntries(cmsLocales.map(locale => [locale, {
    ...Object.fromEntries(texts.map(key => [key, text(copy[key])[locale]])),
    ...Object.fromEntries(headings.map(key => [key, richText(object(copy[key])[locale], undefined, locale)])),
  }])) as Record<(typeof cmsLocales)[number], NewsPageLocale>
  return {...localized, heroImage: mediaURL(copy.heroImage, origin), sectionVisibility: {hero: true, related: true, contact: true, events: true}}
}
