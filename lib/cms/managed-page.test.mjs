import assert from 'node:assert/strict'
import test from 'node:test'
import {presentManagedPage} from './managed-page.ts'
import {textContent} from '../editor/document.ts'

const lexical = text => ({root: {type: 'root', children: [{type: 'paragraph', children: [{type: 'text', text}]}]}})
const group = text => ({values: {en: text}})
const origin = 'https://alamir.test'

test('managed Section copies retain named owned fields, translated labels and upload IDs', () => {
  const first = {id: 'first', blockType: 'contact-hero', content: {heading: group(lexical('First contact')), image: {value: 8}}}
  const second = {id: 'second', blockType: 'contact-hero', content: {heading: group(lexical('Second contact'))}}
  const page = {page: {seo: {title: {en: 'Contact'}}}, layout: [first, second], mediaRefs: new Map([[8, {url: '/contact.webp'}]]), interface: {page: {shared: {email: {en: 'Email us'}}}}}
  const result = presentManagedPage(page, origin, first)
  assert.equal(result.sections.length, 1)
  assert.equal(textContent(result.sections[0].rich.heading.en), 'First contact')
  assert.equal(result.sections[0].images.image, 'https://alamir.test/contact.webp')
  assert.equal(result.sections[0].text.email.en, 'Email us')
  assert.equal(result.seo.title.en, 'Contact')
  assert.equal(presentManagedPage(page, origin, second).sections[0].images.image, undefined)
  assert.equal(textContent(presentManagedPage({...page, layout: [second, first]}, origin, second).sections[0].rich.heading.en), 'Second contact')
})

test('booking, legal and recovery Sections expose authored fields without matching source sentences', () => {
  const booking = {id: 'booking', blockType: 'book-a-meeting-bk_band', content: {text29: group('Edited calendar title'), heading2: group(lexical('Confirmed')), body8: group(lexical('Receipt'))}}
  const page = {page: {}, layout: [], interface: {page: {shared: {monday: {en: 'Monday'}, browseDownloads: {en: 'Downloads'}}, notFoundTranslations: {item_1: {translations: {en: 'Home'}}}}}}
  const result = presentManagedPage(page, origin, booking)
  assert.equal(result.sections.length, 1)
  assert.equal(result.sections[0].text.text29.en, 'Edited calendar title')
  assert.equal(textContent(result.sections[0].rich.heading2.en), 'Confirmed')
  assert.equal(result.sections[0].text.monday.en, 'Monday')
  assert.equal(result.interface.backHome.en, 'Home')
  const cards = presentManagedPage(page, origin, {id:'recovery', blockType:'404-related', enabled:false, content:{cards:[{reference:'catalog',title:{ar:'المنتجات'},description:{fr:'Catalogue'}}]}}).sections[0]
  assert.equal(cards.enabled, false)
  assert.equal(cards.cards[0].id, 'catalog')
  assert.equal(cards.cards[0].title.ar, 'المنتجات')
})
