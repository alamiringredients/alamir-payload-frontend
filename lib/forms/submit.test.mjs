import assert from 'node:assert/strict'
import test from 'node:test'
import {createServer} from 'node:http'
import {once} from 'node:events'
import {submitBuilderForm} from './submit.ts'

test('form transport sends typed values once, preserves retry identity, files and backend errors', async () => {
  const requests = []
  const server = createServer(async (incoming, outgoing) => {
    const chunks = []
    for await (const chunk of incoming) chunks.push(chunk)
    const request = new Request(`http://localhost${incoming.url}`, {method: 'POST', headers: incoming.headers, body: Buffer.concat(chunks)})
    const multipart = request.headers.get('content-type').startsWith('multipart/')
    const body = multipart ? await request.formData() : await request.json()
    requests.push(body)
    if (requests.length === 2) {
      outgoing.writeHead(400, {'content-type': 'application/json'}).end(JSON.stringify({errors: [{data: {errors: [{path: 'slot'}]}}]}))
    } else outgoing.writeHead(201, {'content-type': 'application/json'}).end(JSON.stringify({doc: {bookingReceipt: {event: 'Meet us', startsAt: '2026-11-01T10:00:00Z'}}}))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const previous = process.env.NEXT_PUBLIC_BACKEND_URL
  process.env.NEXT_PUBLIC_BACKEND_URL = `http://127.0.0.1:${server.address().port}`
  try {
    const definition = {id: 8, confirmationType: 'redirect', redirect: {url: '/thank-you'}, fields: [{name: 'name', blockType: 'text'}, {name: 'consent', blockType: 'checkbox'}, {name: 'phone', blockType: 'text', includeDialCode: true}, {name: 'hidden', blockType: 'text', visible: false}, {name: 'cv', blockType: 'upload'}]}
    const values = {name: 'Buyer', consent: true, phone: '123', dialCode: '+20', hidden: 'ignored', key: 'same-retry-key', slotId: 12, locale: 'ar'}
    const success = await submitBuilderForm(definition, values, 42)
    assert.equal(success.ok, true)
    assert.equal(success.data.event, 'Meet us')
    assert.equal(success.data.redirectTo, '/thank-you')
    assert.deepEqual(requests[0].submissionData, [{field: 'name', value: 'Buyer'}, {field: 'consent', value: 'true'}, {field: 'phone', value: '123'}, {field: 'dialCode', value: '+20'}])
    assert.equal(requests[0].page, 42)
    assert.equal(requests[0].slotId, 12)
    const failure = await submitBuilderForm(definition, values, 42)
    assert.deepEqual(failure.errors, {slotId: ['invalid']})
    assert.equal(requests[0].key, requests[1].key)
    const uploaded = await submitBuilderForm(definition, {...values, cv: new File(['PDF contents'], 'cv.pdf', {type: 'application/pdf'})})
    assert.equal(uploaded.ok, true)
    assert.equal(requests[2].get('cv').name, 'cv.pdf')
    assert.equal(await requests[2].get('cv').text(), 'PDF contents')
    assert.equal(JSON.parse(requests[2].get('_payload')).form, 8)
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL
    else process.env.NEXT_PUBLIC_BACKEND_URL = previous
    server.close()
    server.closeAllConnections()
    await once(server, 'close')
  }
})
