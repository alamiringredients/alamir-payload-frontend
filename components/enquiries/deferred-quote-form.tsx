'use client'

import {useFormDefinition} from '@/components/forms/forms-provider'
import {useEffect, useRef, useState} from 'react'
import type {QuoteForm} from './quote-form'
import type {ComponentProps} from 'react'

let quoteFormModule: Promise<{QuoteForm: typeof QuoteForm}> | undefined
const loadQuoteForm = () => quoteFormModule ??= import('./quote-form').catch(error => {
  quoteFormModule = undefined
  throw error
})

export function DeferredQuoteForm(props: ComponentProps<typeof QuoteForm>) {
  const container = useRef<HTMLDivElement>(null)
  const [Form, setForm] = useState<typeof QuoteForm>()
  const [failed, setFailed] = useState(false)
  const definition=useFormDefinition('quote',undefined,Boolean(Form)||failed).definition

  useEffect(() => {
    const dialog = container.current?.closest('#rq')
    if (!dialog) return
    let disposed = false
    const prepare = () => {
      void loadQuoteForm().then(module => {
        if (!disposed) {
          setFailed(false)
          setForm(() => module.QuoteForm)
        }
      }).catch(() => { if (!disposed) setFailed(true) })
    }
    const onIntent = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-quote]')) prepare()
    }
    const onOpen = () => { if (dialog.classList.contains('open')) prepare() }
    const observer = new MutationObserver(onOpen)
    observer.observe(dialog, {attributes: true, attributeFilter: ['class']})
    document.addEventListener('pointerover', onIntent)
    document.addEventListener('focusin', onIntent)
    onOpen()
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('pointerover', onIntent)
      document.removeEventListener('focusin', onIntent)
    }
  }, [])

  return <div ref={container} aria-busy={!Form && !failed}>
    {Form ? <Form {...props}/> : failed ? <p role="alert">{definition?.ui?.loadingFailure}</p> : null}
  </div>
}
