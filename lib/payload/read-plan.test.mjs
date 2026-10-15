import assert from 'node:assert/strict'
import test from 'node:test'
import {contentReadResources, pageReadResources} from './read-plan.ts'

test('text-only pages and borrowed Sections load only their required published resources', () => {
  assert.deepEqual(pageReadResources(['careers-hero', 'careers-apply', 'text']), ['pages'])
  assert.deepEqual(pageReadResources(['careers-jobs']), ['pages', 'jobs'])
  assert.deepEqual(contentReadResources('jobs'), ['jobs'])
  assert.deepEqual(pageReadResources(['news-articles', 'careers-jobs'], 'custom-page'), ['pages', 'news', 'news-taxonomies', 'jobs'])
  assert.deepEqual(pageReadResources(), ['pages'])
})

test('mixed and repeated Sections share one batch without loading unrelated content families', () => {
  assert.deepEqual(pageReadResources(['home-products', 'home-certifications', 'home-certifications'], 'home-page'), ['pages', 'events', 'certifications', 'certification-types'])
  assert.deepEqual(pageReadResources(['downloads-product']), ['pages', 'products', 'categories', 'product-applications', 'product-concentrations'])
  assert.deepEqual(pageReadResources(['quality-roadmap', 'quality-credentials']), ['pages', 'certifications', 'certification-types'])
  assert.deepEqual(pageReadResources(['events-hero', 'events-more']), ['pages'])
  assert.deepEqual(pageReadResources(['products-hero']), ['pages'])
  assert.deepEqual(pageReadResources(['products-collection']), ['pages', 'products', 'categories', 'product-applications', 'product-concentrations'])
  assert.deepEqual(pageReadResources(['products-deep']), ['pages', 'certifications', 'certification-types'])
  assert.deepEqual(pageReadResources(['book-a-meeting-bk_band']), ['pages', 'events', 'meeting-slots'])
})
