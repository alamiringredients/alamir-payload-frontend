import assert from 'node:assert/strict'
import test from 'node:test'
import {presentCareersPage, presentDownloadsPage, presentNewsPage} from './page-content.ts'
import {textContent} from '../editor/document.ts'

const lexical = text => ({root: {type: 'root', children: [{type: 'paragraph', children: [{type: 'text', text}]}]}})
const origin = 'https://alamir.test'
test('copied Careers and Downloads Sections retain their own content and shared settings', () => {
  const first = {id: 'one', blockType: 'careers-jobs', content: {title: {en: lexical('First jobs')}}}
  const second = {id: 'two', blockType: 'careers-jobs', content: {title: {en: lexical('Other jobs')}, intro: {en: lexical('Only on this copy')}}}
  const page = {page: {emptyStates: {empty: {en: 'No vacancies'}}, seo: {title: {en: 'Careers'}}}, layout: [first, second]}
  const result = presentCareersPage(page, origin, first)
  assert.equal(textContent(result.jobsTitle.en), 'First jobs')
  assert.equal(textContent(result.jobsIntro.en), '')
  assert.equal(result.empty.en, 'No vacancies')
  assert.equal(result.seo.title.en, 'Careers')
  assert.equal(textContent(presentCareersPage({...page, layout: [second, first]}, origin, second).jobsTitle.en), 'Other jobs')
  const hero = {id: 'downloads', blockType: 'downloads-hero', content: {heading: {fr: lexical('Documents')}, image: {url: '/hero.webp'}}}
  const downloads = presentDownloadsPage({page: {emptyStates: {noTds: {fr: 'Aucun document'}}}, layout: [hero]}, origin, hero)
  assert.equal(textContent(downloads.heroHeading.fr), 'Documents')
  assert.equal(downloads.heroImage, 'https://alamir.test/hero.webp')
  assert.equal(downloads.noTds.fr, 'Aucun document')
})

test('News Sections share settings while each selected copy owns its title and media', () => {
  const first = {id: 'first', blockType: 'news-hero', content: {title: {en: lexical('First news')}, heroImage: {url: '/first.webp'}}}
  const second = {id: 'second', blockType: 'news-hero', content: {title: {en: lexical('Second news')}}}
  const page = {page: {copy: {empty: {en: 'No news'}, seoTitle: {en: 'News'}}}, layout: [first, second]}
  const result = presentNewsPage(page, origin, second)
  assert.equal(textContent(result.en.title), 'Second news')
  assert.equal(result.heroImage, '')
  assert.equal(result.en.empty, 'No news')
  assert.equal(result.en.seoTitle, 'News')
  assert.equal(textContent(presentNewsPage(page, origin, first).en.title), 'First news')
})
