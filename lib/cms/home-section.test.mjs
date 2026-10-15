import assert from 'node:assert/strict'
import test from 'node:test'
import {presentHomeSection} from './home-section.ts'

const lexical = text => ({root: {type: 'root', children: [{type: 'paragraph', children: [{type: 'text', text}]}]}})
test('copied home Sections render their own named localized fields without historical templates', () => {
  const first = {id: 'first', blockType: 'home-story', content: {text: {values: {en: 'Our story', ar: 'قصتنا'}}, heading: {values: {en: lexical('First')}}, image: {value: {url: '/first.webp'}}}}
  const second = {id: 'second', blockType: 'home-story', content: {heading: {values: {en: lexical('Second')}}}}
  const translations = {page: {shared: {aboutUs: {en: 'Read our story', ar: 'اقرأ قصتنا'}}}}
  const source = structuredClone(first)
  const a = presentHomeSection(first, translations, 'https://alamir.test')
  const b = presentHomeSection(second, translations, 'https://alamir.test')
  assert.equal(a.text.kicker.ar, 'قصتنا')
  assert.equal(a.text.aboutLabel.en, 'Read our story')
  assert.equal(a.rich.heading.en.content[0].content[0].text, 'First')
  assert.equal(b.rich.heading.en.content[0].content[0].text, 'Second')
  assert.equal(a.image, 'https://alamir.test/first.webp')
  assert.equal(b.image, '')
  assert.equal(b.text.kicker.en, '')
  assert.deepEqual(first, source)
})

test('home media and figures retain authored order, localized labels and values', () => {
  const hero = presentHomeSection({id: 'hero', blockType: 'home-hero', content: {videos: {item_1: {url: '/one.mp4'}, item_2: null, item_3: {url: '/three.mp4'}}}}, {}, 'https://alamir.test')
  assert.deepEqual(hero.videos, ['https://alamir.test/one.mp4', '', 'https://alamir.test/three.mp4'])
  const figures = presentHomeSection({id: 'figures', blockType: 'home-figures', content: {figures: [{id: 'one', value: 24, unit: '+', label: {fr: 'Années'}, unitLabel: {en: 'years'}}]}}, {}, 'https://alamir.test')
  assert.equal(figures.figures[0].value, 24)
  assert.equal(figures.figures[0].label.fr, 'Années')
  assert.equal(figures.figures[0].unitLabel.en, 'years')
})

test('stored home upload IDs resolve through shared media without changing authored order', () => {
  const block = {id: 'hero', blockType: 'home-hero', content: {
    image: {value: 12}, videos: {item_1: 23, item_2: 99, item_3: {url: '/existing.mp4'}, item_4: 24},
  }}
  const refs = new Map([[12, {url: '/poster.webp'}], [23, {url: '/one.mp4'}], [24, {url: 'https://cdn.alamir.test/last.mp4'}]])
  const section = presentHomeSection(block, {}, 'https://alamir.test', refs)
  assert.equal(section.image, 'https://alamir.test/poster.webp')
  assert.deepEqual(section.videos, ['https://alamir.test/one.mp4', '', 'https://alamir.test/existing.mp4', 'https://cdn.alamir.test/last.mp4'])
  const withoutReferences = presentHomeSection(block, {}, 'https://alamir.test')
  assert.equal(withoutReferences.image, '')
  assert.deepEqual(withoutReferences.videos, ['', '', 'https://alamir.test/existing.mp4', ''])
})
