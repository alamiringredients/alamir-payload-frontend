'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'

export function CatalogInteractions() {
  const pathname = usePathname()

  useEffect(() => {
    const cleanups: Array<() => void> = []
    const listen = <T extends EventTarget>(target: T, event: string, handler: EventListener) => {
      target.addEventListener(event, handler)
      cleanups.push(() => target.removeEventListener(event, handler))
    }

    document.querySelectorAll<HTMLElement>('.view-switch').forEach(rail=>{
      const tabs=[...rail.querySelectorAll<HTMLButtonElement>('.vtab[data-view]')]
      const section=rail.closest('section')??document
      const panels=[...section.querySelectorAll<HTMLElement>('[data-view-panel]')]
      const show=(view:string,focus=false)=>{
        tabs.forEach(tab=>{
          const active=tab.dataset.view===view
          tab.setAttribute('aria-pressed',String(active))
          if(active&&focus)tab.focus()
        })
        panels.forEach(panel=>panel.classList.toggle('on',panel.dataset.viewPanel===view))
      }
      tabs.forEach((tab,index)=>{
        listen(tab,'click',()=>show(tab.dataset.view??'products'))
        listen(tab,'keydown',((event:KeyboardEvent)=>{
          const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0
          if(!step)return
          event.preventDefault()
          const next=tabs[(index+step+tabs.length)%tabs.length]
          show(next?.dataset.view??'products',true)
        }) as EventListener)
      })
      show('products')
    })

    document.querySelectorAll<HTMLElement>('#catalogue,[data-product-catalog]').forEach(root => {
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
      const hashCategory = root.id==='catalogue'&&location.hash.startsWith('#catalogue-') ? location.hash.slice(11) : ''
      const ownCategory=root.dataset.productCatalog!==undefined?root.dataset.open:''
      const requestedCategory=hashCategory||ownCategory
      const initial = tabs.find(tab => tab.dataset.cat === requestedCategory&&cards.some(card=>card.dataset.cat===requestedCategory)) ?? tabs[0]
      if (initial) select(initial)
      else apply()
    })

    document.querySelectorAll<HTMLButtonElement>('[data-product-catalog-open]').forEach(trigger=>{
      const id=trigger.getAttribute('aria-controls')
      const dialog=id?document.getElementById(id):null
      if(!dialog)return
      const closeButton=dialog.querySelector<HTMLButtonElement>('[data-product-catalog-close]')
      let lastFocus:HTMLElement|null=null
      const open=()=>{
        lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null
        dialog.classList.add('open')
        dialog.setAttribute('aria-hidden','false')
        trigger.setAttribute('aria-expanded','true')
        document.body.style.overflow='hidden'
        closeButton?.focus()
      }
      const close=()=>{
        dialog.classList.remove('open')
        dialog.setAttribute('aria-hidden','true')
        trigger.setAttribute('aria-expanded','false')
        document.body.style.overflow=''
        lastFocus?.focus()
      }
      listen(trigger,'click',open)
      dialog.querySelectorAll<HTMLElement>('[data-product-catalog-close]').forEach(button=>listen(button,'click',close))
      listen(document,'keydown',((event:KeyboardEvent)=>{if(event.key==='Escape'&&dialog.classList.contains('open'))close()}) as EventListener)
      cleanups.push(()=>{if(dialog.classList.contains('open'))document.body.style.overflow=''})
    })

    document.querySelectorAll<HTMLElement>('[data-pgal]').forEach(gallery => {
      const slides = [...gallery.querySelectorAll<HTMLElement>('.pgal-slide')]
      const dots = [...gallery.querySelectorAll<HTMLButtonElement>('.pgal-dots button')]
      const caption = gallery.querySelector<HTMLElement>('.pgal-cap')
      const current = gallery.querySelector<HTMLElement>('.pgal-count b')
      let active = 0
      const load = (index: number) => {
        const slide = slides[index]
        if (!slide || slide.querySelector('img')) return
        const value = slide.dataset.pgalImage
        if (!value) return
        const image = document.createElement('img')
        const props = JSON.parse(value) as {src: string; srcSet?: string; sizes?: string; alt: string}
        image.src = props.src
        image.alt = props.alt
        image.width = 1600
        image.height = 1200
        image.loading = 'lazy'
        image.fetchPriority = 'low'
        if (props.srcSet) image.srcset = props.srcSet
        if (props.sizes) image.sizes = props.sizes
        slide.append(image)
        delete slide.dataset.pgalImage
      }
      const show = (index: number) => {
        const next = (index + slides.length) % slides.length
        load(next)
        slides.forEach((slide, i) => slide.classList.toggle('is-on', i === next))
        dots.forEach((dot, i) => {
          dot.classList.toggle('on', i === next)
          dot.setAttribute('aria-current', String(i === next))
        })
        if (caption) caption.textContent = slides[next]?.dataset.cap ?? ''
        if (current) current.textContent = String(next + 1).padStart(2, '0')
        active = next
        load((next + 1) % slides.length)
      }
      dots.forEach((dot, index) => listen(dot, 'click', () => show(index)))
      gallery.querySelectorAll<HTMLButtonElement>('[data-pgal-go]').forEach(button => listen(button, 'click', () => show(active + (button.dataset.pgalGo === 'next' ? 1 : -1))))
    })

    document.querySelectorAll<HTMLElement>('[data-prail]').forEach(rail => {
      const track=rail.querySelector<HTMLElement>('.prail-track')
      const cards=[...rail.querySelectorAll<HTMLElement>('.pcard')]
      const current=rail.querySelector<HTMLElement>('.prail-count b')
      const progress=rail.querySelector<HTMLElement>('.prail-bar span')
      const previous=rail.querySelector<HTMLButtonElement>('[data-prail-go="prev"]')
      const next=rail.querySelector<HTMLButtonElement>('[data-prail-go="next"]')
      if(!track||!cards.length)return
      const update=()=>{
        const left=track.scrollLeft,max=Math.max(0,track.scrollWidth-track.clientWidth)
        const index=cards.reduce((nearest,card,i)=>Math.abs(card.offsetLeft-left)<Math.abs(cards[nearest].offsetLeft-left)?i:nearest,0)
        if(current)current.textContent=String(index+1).padStart(2,'0')
        if(progress)progress.style.width=`${max?Math.max(8,left/max*100):100}%`
        if(previous)previous.disabled=left<=2
        if(next)next.disabled=left>=max-2
      }
      const move=(direction:number)=>track.scrollBy({left:direction*((cards[0]?.offsetWidth??0)+parseFloat(getComputedStyle(track).gap||'0')),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})
      if(previous)listen(previous,'click',()=>move(-1))
      if(next)listen(next,'click',()=>move(1))
      listen(track,'scroll',update)
      listen(window,'resize',update)
      update()
    })

    return () => cleanups.forEach(cleanup => cleanup())
  }, [pathname])

  return <span hidden data-catalog-interactions=""/>
}
