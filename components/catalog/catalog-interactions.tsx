'use client'

import {useEffect, useRef} from 'react'
import {registerOverlay} from '@/lib/browser/overlay'

export function CatalogInteractions({kind}: {kind: 'view' | 'gallery' | 'rail' | 'dialog'}) {
  const marker = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = marker.current?.parentElement
    if (!root) return
    const find = (selector: string) => [
      ...(root.matches(selector) ? [root] : []),
      ...root.querySelectorAll<HTMLElement>(selector),
    ]
    const cleanups: Array<() => void> = []
    const listen = <T extends EventTarget>(target: T, event: string, handler: EventListener) => {
      target.addEventListener(event, handler)
      cleanups.push(() => target.removeEventListener(event, handler))
    }

    if (kind === 'view') find('.view-switch').forEach(rail=>{
      const tabs=[...rail.querySelectorAll<HTMLButtonElement>('.vtab[data-view]')]
      const section=root
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

    if (kind === 'dialog') find('[data-product-catalog]').forEach(dialog => {
      const owner = dialog.closest('.cms-section') ?? dialog.parentElement ?? dialog
      const triggers = [...owner.querySelectorAll<HTMLButtonElement>('[data-product-catalog-open]')].filter(trigger => trigger.getAttribute('aria-controls') === dialog.id)
      const overlay = registerOverlay(dialog, {triggers, initialFocus: '[data-product-catalog-close]'})
      triggers.forEach(trigger => listen(trigger, 'click', () => overlay.open(trigger)))
      dialog.querySelectorAll<HTMLElement>('[data-product-catalog-close]').forEach(button => listen(button, 'click', overlay.close))
      cleanups.push(overlay.dispose)
    })

    if (kind === 'gallery') find('[data-pgal]').forEach(gallery => {
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

    if (kind === 'rail') find('[data-prail]').forEach(rail => {
      const track=rail.querySelector<HTMLElement>('.prail-track')
      const cards=[...rail.querySelectorAll<HTMLElement>('.pcard')]
      const current=rail.querySelector<HTMLElement>('.prail-count b')
      const progress=rail.querySelector<HTMLElement>('.prail-bar span')
      const previous=rail.querySelector<HTMLButtonElement>('[data-prail-go="prev"]')
      const next=rail.querySelector<HTMLButtonElement>('[data-prail-go="next"]')
      if(!track||!cards.length)return
      const direction=getComputedStyle(track).direction==='rtl'?-1:1
      const update=()=>{
        const max=Math.max(0,track.scrollWidth-track.clientWidth)
        const position=Math.min(max,Math.max(0,track.scrollLeft*direction))
        const offset=(card:HTMLElement)=>(card.offsetLeft-cards[0].offsetLeft)*direction
        const index=cards.reduce((nearest,card,i)=>Math.abs(offset(card)-position)<Math.abs(offset(cards[nearest])-position)?i:nearest,0)
        if(current)current.textContent=String(index+1).padStart(2,'0')
        if(progress)progress.style.width=`${max?Math.max(8,position/max*100):100}%`
        if(previous)previous.disabled=position<=2
        if(next)next.disabled=position>=max-2
      }
      const move=(step:number)=>track.scrollBy({left:step*direction*(cards[0].offsetWidth+parseFloat(getComputedStyle(track).gap||'0')),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})
      if(previous)listen(previous,'click',()=>move(-1))
      if(next)listen(next,'click',()=>move(1))
      listen(track,'scroll',update)
      listen(window,'resize',update)
      update()
    })

    return () => cleanups.forEach(cleanup => cleanup())
  }, [kind])

  return <span ref={marker} hidden/>
}
