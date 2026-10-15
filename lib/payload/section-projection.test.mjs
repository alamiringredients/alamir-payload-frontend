import assert from 'node:assert/strict'
import test from 'node:test'
import {applyRecordSection, recordPresentationSource} from './section-projection.ts'

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
