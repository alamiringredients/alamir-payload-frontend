'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
import {isOverlayOpen, registerOverlay} from '@/lib/browser/overlay'

export function SiteInteractions() {
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.classList.add('js')
    const header = document.getElementById('header')
    const menu = document.getElementById('mobile-menu')
    const menuOpen = document.getElementById('menu-open')
    const quote = document.getElementById('rq')
    const announcement=document.getElementById('announce')
    const menuOverlay = menu ? registerOverlay(menu, {triggers: menuOpen ? [menuOpen] : [], initialFocus: '#menu-close'}) : undefined
    const quoteOverlay = quote ? registerOverlay(quote, {initialFocus: '#rq-close'}) : undefined
    const announcementOverlay = announcement ? registerOverlay(announcement, {
      initialFocus: '#announce-close',
      onDismiss: () => {
        const key = announcement.dataset.eventKey
        if (key) sessionStorage.setItem(`alamir-event-dismissed:${key}`, '1')
      },
    }) : undefined
    let showAnnouncementOnScroll:(()=>void)|undefined

    const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40)
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const target = event.target
      const menuTrigger = target.closest<HTMLElement>('#menu-open')
      const quoteTrigger = target.closest<HTMLElement>('[data-quote]')
      if (menuTrigger) menuOverlay?.open(menuTrigger)
      if (quoteTrigger && quoteOverlay) { event.preventDefault(); quoteOverlay.open(quoteTrigger) }
      else if (target.closest('#menu-close,#mobile-menu a')) menuOverlay?.close()
      if (target.closest('#rq-close,[data-quote-close]')) quoteOverlay?.close()
      const cookieChoice = target.closest<HTMLElement>('[data-cookie]')?.dataset.cookie
      if (cookieChoice) {
        localStorage.setItem('alamir-cookie-choice', cookieChoice)
        document.getElementById('cookie-notice')?.classList.remove('show')
      }
      if (target === announcement || target.closest('[data-ann-close],#announce-close')) {
        announcementOverlay?.close()
      }
    }
    window.addEventListener('scroll', updateHeader, {passive: true})
    document.addEventListener('click', handleClick, true)
    updateHeader()
    if(announcement){
      const key=announcement.dataset.eventKey
      if(key&&!sessionStorage.getItem(`alamir-event-dismissed:${key}`)){
        const show=()=>{
          if(window.scrollY<120||isOverlayOpen())return
          announcementOverlay?.open()
          window.removeEventListener('scroll',show)
        }
        showAnnouncementOnScroll=show
        window.addEventListener('scroll',showAnnouncementOnScroll,{passive:true})
      }
    }

    let observer: IntersectionObserver | undefined
    const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches
    if ('IntersectionObserver' in window && !reduceMotion) {
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer?.unobserve(entry.target) }
      }), {threshold: .15, rootMargin: '0px 0px -6% 0px'})
    }
    const registerReveals=(root:ParentNode|HTMLElement)=>{
      if(reduceMotion)return
      const elements=[
        ...(root instanceof HTMLElement&&root.matches('.reveal')?[root]:[]),
        ...root.querySelectorAll<HTMLElement>('.reveal'),
      ]
      elements.forEach(element=>observer?observer.observe(element):element.classList.add('visible'))
    }
    registerReveals(document)
    const revealChanges=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node instanceof HTMLElement)registerReveals(node)
    })))
    revealChanges.observe(document.body,{childList:true,subtree:true})

    if (!localStorage.getItem('alamir-cookie-choice')) document.getElementById('cookie-notice')?.classList.add('show')

    return () => {
      window.removeEventListener('scroll', updateHeader)
      document.removeEventListener('click', handleClick, true)
      if(showAnnouncementOnScroll)window.removeEventListener('scroll',showAnnouncementOnScroll)
      observer?.disconnect()
      revealChanges.disconnect()
      menuOverlay?.dispose()
      quoteOverlay?.dispose()
      announcementOverlay?.dispose()
    }
  }, [pathname])

  return null
}
