import assert from 'node:assert/strict'
import test from 'node:test'
import {presentCatalogRecord,presentCatalogPageSection} from './presentation.ts'
import {textContent} from '../editor/document.ts'

const localized=value=>({en:value,ar:`ar ${value}`,fr:`fr ${value}`})
const rich=value=>({root:{type:'root',children:[{type:'paragraph',children:[{type:'text',text:value}]}]}})
const heading=value=>Object.fromEntries(['en','ar','fr'].map(locale=>[locale,rich(`${locale} ${value}`)]))
const hero=(id,value)=>({id,blockType:'prd-hero',data:{hero:{text4:{values:localized(value)},image:{value:5}}}})
const record=layout=>({id:901,slug:'new-product',name:localized('New product'),title:heading('Product'),category:{id:70,sourceId:7},page:{artwork:{enabled:false,images:[{image:{url:'https://example.com/card.webp'}}]}},mediaRefs:new Map([[5,{id:5,url:'https://example.com/hero.webp'}]]),layout})

test('new catalog records and copied Sections display their own native content independent of order or historical IDs',()=>{
  const first=hero('first','First introduction'),second=hero('second','Second introduction')
  const doc=record([first,second]),original=structuredClone(doc)
  const present=layout=>presentCatalogRecord('products',{...doc,layout},first)
  for(const layout of [[first,second],[second,first]]){
    const product=present(layout)
    assert.equal(product.id,901)
    assert.equal(product.category_id,7)
    assert.equal(product.content.page.hero.description.en,'First introduction')
    assert.equal(product.content.page.hero.image,'https://example.com/hero.webp')
    assert.equal(textContent(product.content.page.hero.heading.ar),'ar Product')
  }
  assert.equal(presentCatalogRecord('products',doc,second).content.page.hero.description.fr,'fr Second introduction')
  assert.deepEqual(doc,original)
  const details={id:'details',blockType:'prd-info',data:{documents:{heading:heading('Documents'),items:[{body:heading('Original document')}]}}}
  const emptyCopy={id:'empty-details',blockType:'prd-info',data:{overview:{heading:heading('Copied overview')}}}
  const copied=presentCatalogRecord('products',record([details,emptyCopy]),emptyCopy)
  assert.equal(textContent(copied.content.page.folds.at(-1).heading.en),'')
  assert.deepEqual(copied.content.page.folds.at(-1).items,[])
})

test('catalog detail preserves authored fold bodies, specification rows, gallery captions and disabled artwork',()=>{
  const doc=record([{id:'details',blockType:'prd-info',data:{overview:{heading:heading('Overview'),items:[{body:heading('Body')}]},specifications:{heading:heading('Specifications'),pairs:[{label:localized('Brix'),value:localized('28–30')}]}}},{id:'gallery',blockType:'prd-gallery',data:{galleryIntro:{text5:{values:localized('Gallery introduction')}},gallery:[{image:{url:'https://example.com/gallery.webp'},caption:localized('Photo caption'),alt:localized('Photo alt')}]}}])
  const product=presentCatalogRecord('products',doc)
  assert.equal(product.content.artwork.enabled,false)
  assert.equal(textContent(product.content.page.folds[0].items[0].en),'en Body')
  assert.deepEqual(product.content.page.specifications.pairs,[{label:localized('Brix'),value:localized('28–30')}])
  assert.equal(product.content.page.gallery.description.en,'Gallery introduction')
  assert.deepEqual(product.content.gallery,[{image:'https://example.com/gallery.webp',caption:localized('Photo caption'),alt:localized('Photo alt')}])
})

test('narrow catalog views retain card content without exposing incomplete detail content',()=>{
  const doc={...record([hero('hero','Introduction')]),sourceId:12,relationships:{applications:[{key:'juice'}],concentrations:[{key:'28'}]}}
  for(const view of ['card','meta']){
    const product=presentCatalogRecord('products',doc,undefined,view)
    assert.equal(product.id,12)
    assert.equal(product.content.name.en,'New product')
    assert.deepEqual(product.content.applications,['juice'])
    assert.equal(product.content.page,undefined)
  }
})

test('both product tables include every selected concentration and authored specification row',()=>{
  const pairs=[{label:localized('Origin'),value:localized('Egypt')}]
  const options=['28–30 °Bx','36–38 °Bx','40–42 °Bx'].map((value,index)=>({key:String(index),name:localized(value)}))
  for(const count of [0,1,3]){
    const concentrations=options.slice(0,count)
    const doc={...record([{id:'details',blockType:'prd-info',data:{specifications:{heading:heading('Specifications'),pairs}}}]),relationships:{concentrations},interface:{page:{shared:{concentration:localized('Concentration')}}}}
    const original=structuredClone(doc)
    const page=presentCatalogRecord('products',doc).content.page
    const expected=[...concentrations.map(item=>({label:localized('Concentration'),value:item.name})),...pairs]
    assert.deepEqual(page.specifications.pairs,expected)
    assert.deepEqual(page.folds.find(item=>textContent(item.heading.en)==='en Specifications').pairs,expected)
    assert.deepEqual(doc,original)
  }
})

test('catalog page Sections use their owned named heading, body and empty-state content',()=>{
  const section=presentCatalogPageSection({heading:{values:heading('Heading')},body:{values:heading('Products')},body2:{values:heading('Categories')},text10:{values:localized('No matches')}})
  assert.equal(textContent(section.heading.en),'en Heading')
  assert.equal(textContent(section.body.ar),'ar Products')
  assert.equal(textContent(section.categoryBody.fr),'fr Categories')
  assert.equal(section.emptyMessage.en,'No matches')
})
