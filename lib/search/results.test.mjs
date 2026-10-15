import assert from 'node:assert/strict'
import test from 'node:test'
import {searchResults} from './results.ts'

const lexical = text => ({root: {type: 'root', children: [{type: 'paragraph', children: [{type: 'text', text}]}]}})
const content = {
  categories: {docs: [{id: 20, slug: 'tomato'}]},
  products: {docs: [{id: 1, slug: 'paste', category: 20, name: {en: 'Tomato', ar: 'طماطم', fr: 'Tomate'}, description: {en: 'Cold break', ar: 'وصف', fr: 'Description'}}]},
  news: {docs: [{id: 2, slug: 'harvest', title: {en: lexical('The harvest'), fr: lexical('La récolte')}, summary: {en: 'Tomato season', fr: 'Tomate de saison'}}]},
  sustainability: {docs: []},
  jobs: {docs: [{id: 3, slug: 'closed', availability: 'closed', name: {en: 'Tomato buyer'}}, {id: 4, slug: 'buyer', availability: 'open', name: {en: 'Tomato buyer'}}]},
  events: {docs: [{id: 5, slug: 'show', title: {en: lexical('Tomato exhibition')}}]},
}

test('search matches localized titles and summaries, with stable grouping and valid destinations', () => {
  const english = searchResults(content, ' ToMaTo ', 'en', {products: 'Products', careers: 'Careers'})
  assert.deepEqual(english.map(row => row.href), ['/products/tomato/paste', '/news/harvest', '/careers/buyer', '/events/show'])
  assert.equal(english[1].title, 'The harvest')
  assert.equal(english[2].section, 'Careers')
  assert.equal(searchResults(content, 'طماطم', 'ar', {})[0].title, 'طماطم')
  assert.equal(searchResults(content, 'saison', 'fr', {})[0].description, 'Tomate de saison')
  assert.deepEqual(searchResults(content, '   ', 'en', {}), [])
})

test('search excludes products without a published category and does not search article bodies', () => {
  const withoutCategory = {...content, categories: {docs: []}, news: {docs: [{id: 9, slug: 'private-keyword', title: {en: lexical('Article')}, body: 'Tomato'}]}}
  assert.deepEqual(searchResults(withoutCategory, 'tomato', 'en', {}).map(row => row.href), ['/careers/buyer', '/events/show'])
})
