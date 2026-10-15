import assert from 'node:assert/strict'
import test from 'node:test'
import {presentSustainabilityPage} from './sustainability-page.ts'
import {textContent} from '../editor/document.ts'

const lexical = text => ({root: {type: 'root', children: [{type: 'paragraph', children: [{type: 'text', text}]}]}})
const origin = 'https://alamir.test'
test('Sustainability copied Sections preserve owned localized copy and shared goals independently of order', () => {
  const first = {id: 'first', blockType: 'sustainability-hero', content: {heading: {values: {fr: lexical('Premier titre')}}, body: {values: {fr: lexical('Introduction')}}, icons: [11, {url: '/second.svg'}, 99]}}
  const second = {id: 'second', blockType: 'sustainability-hero', content: {heading: {values: {fr: lexical('Autre titre')}}}}
  const page = {page: {relatedTitle: {fr: lexical('Autres articles')}, relatedKicker: {fr: 'Lire aussi'}, seo: {title: {fr: 'Durabilité'}}},
    layout: [first, second], mediaRefs: new Map([[11, {url: '/goal.svg'}]]),
    relationships: {goals: [{id: 40, reference: 12, name: {fr: 'Production'}, image: 11, alt: {fr: 'Objectif'}, color: '#123'}]}}
  const result = presentSustainabilityPage(page, origin, first)
  assert.equal(textContent(result.hero.title.fr), 'Premier titre')
  assert.equal(textContent(result.hero.description.fr), 'Introduction')
  assert.deepEqual(result.heroIcons, [`${origin}/goal.svg`, `${origin}/second.svg`])
  assert.equal(result.goals[0].id, 12)
  assert.equal(result.goals[0].image, `${origin}/goal.svg`)
  assert.equal(result.goals[0].name.fr, 'Production')
  assert.equal(result.seo.title.fr, 'Durabilité')
  assert.equal(textContent(result.relatedTitle.fr), 'Autres articles')
  const copy = presentSustainabilityPage({...page, layout: [second, first]}, origin, second)
  assert.equal(textContent(copy.hero.title.fr), 'Autre titre')
  assert.equal(textContent(copy.hero.description.fr), '')
  assert.deepEqual(copy.heroIcons, [])
  assert.equal(copy.content.enabled, false)
})

test('Sustainability Contact uses its owned fields, shared action labels and disabled state', () => {
  const contact = {id: 'contact', blockType: 'sustainability-related', enabled: false, content: {
    text: {values: {ar: 'تواصل'}}, heading: {values: {ar: lexical('العنوان')}}, body: {values: {ar: lexical('الوصف')}},
  }}
  const page = {page: {}, layout: [contact], interface: {page: {events: {requestQuote: {ar: 'طلب عرض'}}, sustainability: {roadmap: {ar: 'الجودة'}}}}}
  const result = presentSustainabilityPage(page, origin, contact)
  assert.equal(result.contact.enabled, false)
  assert.equal(result.contact.kicker.ar, 'تواصل')
  assert.equal(textContent(result.contact.description.ar), 'الوصف')
  assert.equal(result.contact.quoteLabel.ar, 'طلب عرض')
  assert.equal(result.contact.qualityLabel.ar, 'الجودة')
  assert.equal(result.sectionVisibility.related, true)
})
