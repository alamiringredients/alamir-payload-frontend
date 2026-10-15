import assert from 'node:assert/strict'
import test from 'node:test'
import {applyRecordSection, pagePresentationSource, pageSectionTemplate, recordPresentationSource} from './section-projection.ts'

const block = (id, content, extra = {}) => ({id, blockType: 'home-story', content, ...extra})

test('each copied Section presents its own localized content without leaking sibling values', () => {
  const first = block('first', {heading: {en: 'First', ar: 'الأول'}, image: 7})
  const second = block('second', {heading: {en: 'Second', ar: 'الثاني'}}, {mediaPosition: 'left'})
  const page = {id: 1, page: {seo: {title: 'Shared'}}, layout: [first, second]}
  const source = structuredClone(page)
  assert.deepEqual(pagePresentationSource(page, first).page.story.heading, first.content.heading)
  assert.deepEqual(pagePresentationSource(page, second).page.story.heading, second.content.heading)
  assert.equal(pagePresentationSource(page, second).page.story.image, undefined)
  assert.deepEqual(pagePresentationSource({...page, layout: [second, first]}, second).page.story, pagePresentationSource(page, second).page.story)
  assert.deepEqual(page, source)
})

test('presentation retains shared settings and handles cross-page news Sections and disabled content', () => {
  const hero = {id: 'news-copy', blockType: 'news-hero', enabled: false, content: {title: {en: 'Borrowed'}, heroImage: 22}}
  const page = {id: 2, page: {copy: {seoTitle: 'Shared setting'}}, layout: [hero]}
  const result = pagePresentationSource(page, hero).page
  assert.equal(result.copy.seoTitle, 'Shared setting')
  assert.deepEqual(result.copy.title, hero.content.title)
  assert.equal(result.copy.enabled, false)
  assert.equal(result.heroImage, 22)
})

test('selected page presentation skips sibling hydration while retaining positional keys', () => {
  const template = {sections: [{key: 'hero', texts: [{$field: 'page.hero.title'}]}, {key: 'figures', texts: [{$field: 'page.figures.title'}]}]}
  const result = pageSectionTemplate(template, 'home-figures')
  assert.equal(result.sections[0].key, 'hero')
  assert.equal(result.sections[0].enabled, false)
  assert.deepEqual(result.sections[0].texts, [])
  assert.deepEqual(result.sections[1], template.sections[1])
  const reordered = pageSectionTemplate({sections: [...template.sections].reverse()}, 'home-figures')
  assert.deepEqual(reordered.sections[0], template.sections[1])
  assert.equal(reordered.sections[1].enabled, false)
  const editorial = {body: {$localeTree: {type: 'doc', content: [{attrs: {id: 'story'}}, {attrs: {id: 'vision'}}]}}}
  assert.deepEqual(pageSectionTemplate(editorial, 'about-vision').body.$localeTree.content, [{attrs: {id: 'vision'}}])
})

test('record Sections preserve their own fields, localized bodies and shared settings', () => {
  const first = {id: 'one', blockType: 'event-body', data: {bodyCopy: {en: 'First body'}, introStyle: 'body'}}
  const second = {id: 'two', blockType: 'event-body', data: {bodyCopy: {en: 'Second body', fr: 'Deuxième'}, introStyle: 'lead'}}
  const doc = {id: 9, page: {seo: {title: 'Event'}}, layout: [first, second]}
  const aggregate = recordPresentationSource(doc)
  assert.deepEqual(aggregate.body, second.data.bodyCopy)
  assert.deepEqual(applyRecordSection(aggregate, first).body, first.data.bodyCopy)
  assert.equal(applyRecordSection(aggregate, first).introStyle, 'body')
  assert.deepEqual(aggregate.page.seo, {title: 'Event'})
  const product = applyRecordSection({id: 10}, {id: 'p', blockType: 'prd-hero', enabled: false, data: {hero: {heading: {en: 'Product'}}}})
  assert.equal(product.page.hero.enabled, false)
  assert.deepEqual(product.page.hero.heading, {en: 'Product'})
  assert.deepEqual(applyRecordSection(doc, {id: 'generic', blockType: 'text'}), doc)
})
