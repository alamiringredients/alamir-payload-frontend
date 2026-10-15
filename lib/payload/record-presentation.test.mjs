import assert from 'node:assert/strict'
import test from 'node:test'
import {presentNativeRecord} from './record-presentation.ts'
import {textContent} from '../editor/document.ts'

const origin = 'https://alamir.test'
const paragraph = text => ({type: 'paragraph', children: [{type: 'text', text}]})
const heading = text => ({type: 'heading', tag: 'h2', children: [{type: 'text', text}]})
const lexical = (...children) => ({root: {type: 'root', children}})
const article = {id: 700, slug: 'new-article', title: {en: lexical(paragraph('New article')), fr: lexical(paragraph('Nouvel article'))},
  summary: {en: 'Summary', fr: 'Résumé'}, cardTitle: {fr: lexical(paragraph('Carte'))}, cardSummary: {fr: 'Carte résumé'},
  hero: {en: 1, fr: {url: '/fr.webp'}}, heroAlt: {fr: 'Photo'}, heroCaption: {fr: 'Légende'},
  body: {en: lexical(paragraph('Introduction'), heading('Owned heading'), paragraph('Body'))}, introStyle: 'lead',
  seoTitle: {en: 'SEO'}, seoDescription: {en: 'Description'}, page: {metadata: {date: '2026-10-15', featured: true}},
  relationships: {category: {id: 20, sourceId: 4}, tags: [{id: 21}], previousArticle: {id: 22, slug: 'previous'}, relatedArticles: [{id: 23, slug: 'related'}]},
  mediaRefs: new Map([[1, {url: '/hero.webp'}]])}

test('new News records preserve owned localized copy, media, relationships and body style without a historical ID', () => {
  const result = presentNativeRecord('news', article, origin)
  assert.equal(result.id, 700)
  assert.equal(result.content.categoryId, 4)
  assert.deepEqual(result.content.tagIds, [21])
  assert.equal(result.content.previousSlug, 'previous')
  assert.deepEqual(result.content.relatedSlugs, ['related'])
  assert.equal(result.published.fr.cardSummary, 'Carte résumé')
  assert.equal(textContent(result.published.fr.cardTitle), 'Carte')
  assert.equal(textContent(result.published.en.cardTitle), 'New article')
  assert.equal(result.published.en.hero, `${origin}/hero.webp`)
  assert.equal(result.published.fr.hero, `${origin}/fr.webp`)
  assert.equal(result.published.en.body.content[0].attrs.variant, 'lead')
  assert.equal(result.published.en.body.content[1].attrs.id, 'owned-heading')
  assert.equal(presentNativeRecord('news', {...article, sourceId: 17}, origin).id, 17)
})

test('card and metadata views exclude detail bodies and retain their intended fields', () => {
  const card = presentNativeRecord('news', article, origin, 'card')
  assert.equal(card.content.date, '2026-10-15')
  assert.equal(card.published.en.summary, 'Summary')
  assert.equal('body' in card.published.en, false)
  assert.equal('seoTitle' in card.published.en, false)
  const meta = presentNativeRecord('news', article, origin, 'meta')
  assert.deepEqual(meta.published.en, {seoTitle: 'SEO', seoDescription: 'Description', hero: `${origin}/hero.webp`})
  assert.equal('date' in meta.content, false)
})

test('Sustainability uses owned gallery and heading sections with real relationship references', () => {
  const doc = {...article, gallery: [{image: 1, alt: {fr: 'Champ'}, caption: {fr: 'Récolte'}}],
    relationships: {goals: [{id: 29, reference: 12}], primaryGoal: {id: 29, reference: 12}, relatedArticles: [{id: 30, sourceId: 5}]}}
  const result = presentNativeRecord('sustainability', doc, origin)
  assert.deepEqual(result.content.goalIds, [12])
  assert.equal(result.content.primaryGoal, 12)
  assert.deepEqual(result.content.relatedArticleIds, [5])
  assert.deepEqual(result.published.fr.gallery, [{src: `${origin}/hero.webp`, alt: 'Champ', caption: 'Récolte'}])
  assert.equal(result.published.en.body.content[1].type, 'contentSection')
  assert.equal(result.published.en.body.content[1].attrs.id, 'owned-heading')
  assert.equal(textContent(result.published.en.body), 'IntroductionOwned headingBody')
  const fallback = presentNativeRecord('sustainability', {...article, heroImage: {fr: {url: '/own.webp'}}}, origin, 'meta')
  assert.equal(fallback.published.fr.gallery[0].src, `${origin}/own.webp`)
})

test('Jobs and Events present native ownership, narrow views and authored bodies', () => {
  const job = {...article, name: {en: 'Engineer'}, availability: 'open', department: {en: 'Production'}, page: {code: 'ENG'}}
  const detail = presentNativeRecord('jobs', job, origin)
  assert.equal(detail.status, 'open')
  assert.equal(detail.content.en.title, 'Engineer')
  assert.equal(textContent(detail.content.en.heading), 'New article')
  assert.equal(textContent(detail.content.en.body), 'IntroductionOwned headingBody')
  assert.deepEqual(presentNativeRecord('jobs', job, origin, 'meta').content.en, {title: 'Engineer', summary: 'Summary'})
  const event = {...article, kind: 'event', startsAt: '2026-10-15T12:00:00Z', endsAt: '2026-10-16T12:00:00Z',
    timezone: 'Africa/Cairo', heroImage: {en: 1}, page: {sort_order: 3, seo: {title: {en: 'Event'}}}}
  const full = presentNativeRecord('events', event, origin)
  assert.equal(full.content.heroImage, `${origin}/hero.webp`)
  assert.equal(full.content.body.en.content[0].attrs.variant, 'lead')
  assert.equal(full.starts_at, event.startsAt)
  assert.equal(full.timezone, 'Africa/Cairo')
  assert.equal('body' in presentNativeRecord('events', event, origin, 'card').content, false)
  assert.deepEqual(Object.keys(presentNativeRecord('events', event, origin, 'meta').content), ['seo'])
})

test('certification records and taxonomies use their actual relationships, documents and localized copy', () => {
  const type = presentNativeRecord('certification-types', {id: 41, name: {en: 'Standard'}, description: {fr: 'Norme'}, logo: {en: {url: '/logo.svg'}}, badge: {en: 'ISO'}, kind: {en: 'certification'}}, origin)
  assert.equal(type.content.logo, `${origin}/logo.svg`)
  assert.equal(type.content.description.fr, 'Norme')
  const certificate = presentNativeRecord('certifications', {id: 50, certificationType: {id: 41, sourceId: 7}, standing: 'held', holder: 'group', scope: {en: 'Production'}, document: {en: {url: '/certificate.pdf'}}, page: {sort_order: 2}}, origin)
  assert.equal(certificate.type_id, 7)
  assert.equal(certificate.content.document, `${origin}/certificate.pdf`)
  assert.equal(certificate.sort_order, 2)
  const taxonomy = presentNativeRecord('news-taxonomies', {id: 61, name: {fr: 'Actualités'}, kind: 'category', page: {metadata: {localeTree: {description: {fr: 'Description'}}}}}, origin)
  assert.deepEqual(taxonomy.content.fr, {name: 'Actualités', description: 'Description'})
})
