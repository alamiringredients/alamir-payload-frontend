'use client'

import {useEffect, useRef} from 'react'
import {usePathname} from 'next/navigation'

// Each server-rendered browser mounts this marker directly inside its own root.
export function CatalogBrowsingInteractions({initialCategory='',useHash=false}:{initialCategory?:string;useHash?:boolean}) {
  const marker = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const root = marker.current?.parentElement
    if (!root) return
    const cleanups: Array<() => void> = []
    const listen = (target: EventTarget, event: string, handler: EventListener) => {
      target.addEventListener(event, handler)
      cleanups.push(() => target.removeEventListener(event, handler))
    }

    const tabs = [...root.querySelectorAll<HTMLButtonElement>('.tab[data-cat]')]
    const cards = [...root.querySelectorAll<HTMLElement>('.pcard[data-cat]')]
    const search = root.querySelector<HTMLInputElement>('[data-cat-search]')
    const application = root.querySelector<HTMLSelectElement>('[data-cat-app]')
    const concentration = root.querySelector<HTMLSelectElement>('[data-cat-brix]')
    const count = root.querySelector<HTMLElement>('[data-cat-count]')
    const empty = root.querySelector<HTMLElement>('.cat-empty')
    const reset = root.querySelector<HTMLButtonElement>('.cat-reset')
    const categorySelect=root.querySelector<HTMLSelectElement>('[data-cat-select]')
    const categoryDropdown=root.querySelector<HTMLSelectElement>('[data-cat-dropdown]')
    let category = 'all'

    const contains = (card: HTMLElement, name: string, value: string) => !value || (` ${card.getAttribute(name) ?? ''} `).includes(` ${value} `)
    const apply = () => {
      const query = search?.value.trim().toLocaleLowerCase() ?? ''
      let shown = 0
      cards.forEach(card => {
        const visible = (category === 'all' || card.dataset.cat === category)
          && contains(card, 'data-app', application?.value ?? '')
          && contains(card, 'data-brix', concentration?.value ?? '')
          && (!query || (card.dataset.search ?? '').includes(query))
        card.hidden = !visible
        if (visible) shown++
      })
      if (count) {
        const label = `${shown} ${shown === 1 ? count.dataset.singular : count.dataset.plural}`
        if (count.textContent !== label) count.textContent = label
      }
      if (empty) empty.hidden = shown > 0
      if (reset) reset.hidden = category === 'all' && !query && !application?.value && !concentration?.value
    }
    const select = (tab: HTMLButtonElement, focus = false) => {
      category = tab.dataset.cat ?? 'all'
      tabs.forEach(item => item.setAttribute('aria-pressed', String(item === tab)))
      if(categoryDropdown)categoryDropdown.value=category
      apply()
      if (focus) tab.focus()
    }
    tabs.forEach((tab, index) => {
      listen(tab, 'click', () => select(tab))
      listen(tab, 'keydown', ((event: KeyboardEvent) => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
        if (step) {
          event.preventDefault()
          select(tabs[(index + step + tabs.length) % tabs.length], true)
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault()
          select(event.key === 'Home' ? tabs[0] : tabs[tabs.length - 1], true)
        }
      }) as EventListener)
    })
    if (search) listen(search, 'input', apply)
    if (application) listen(application, 'change', apply)
    if (concentration) listen(concentration, 'change', apply)
    if(categorySelect)listen(categorySelect,'change',()=>{if(categorySelect.value)location.assign(categorySelect.value)})
    if(categoryDropdown)listen(categoryDropdown,'change',()=>{
      const tab=tabs.find(item=>item.dataset.cat===categoryDropdown.value)
      if(tab)select(tab)
    })
    if (reset) listen(reset, 'click', () => {
      if (search) search.value = ''
      if (application) application.value = ''
      if (concentration) concentration.value = ''
      if (tabs[0]) select(tabs[0])
      else apply()
    })
    const hashCategory = useHash && location.hash.startsWith('#catalogue-') ? location.hash.slice(11) : ''
    const requestedCategory = hashCategory || initialCategory
    const initial = tabs.find(tab => tab.dataset.cat === requestedCategory&&cards.some(card=>card.dataset.cat===requestedCategory)) ?? tabs[0]
    if (initial) select(initial)
    else apply()

    return () => cleanups.forEach(cleanup => cleanup())
  }, [pathname, initialCategory, useHash])

  return <span ref={marker} hidden/>
}
