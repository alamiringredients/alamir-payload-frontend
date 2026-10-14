'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'

export function SiteInteractions() {
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.classList.add('js')
    const header = document.getElementById('header')
    const menu = document.getElementById('mobile-menu')
    const menuOpen = document.getElementById('menu-open')
    const quote = document.getElementById('rq')
    const announcement=document.getElementById('announce')
    let showAnnouncementOnScroll:(()=>void)|undefined

    const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40)
    const setMenu = (open: boolean) => {
      menu?.classList.toggle('open', open)
      menu?.setAttribute('aria-hidden', String(!open))
      menuOpen?.setAttribute('aria-expanded', String(open))
      document.body.classList.toggle('menu-open', open)
    }
    const setQuote = (open: boolean) => {
      quote?.classList.toggle('open', open)
      quote?.setAttribute('aria-hidden', String(!open))
      document.body.classList.toggle('menu-open', open)
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('#menu-open')) setMenu(true)
      if (target.closest('#menu-close') || target.closest('#mobile-menu a')) setMenu(false)
      if (target.closest('[data-quote]')) { event.preventDefault(); setQuote(true) }
      if (target.closest('#rq-close,[data-quote-close]')) setQuote(false)
      const cookieChoice = target.closest<HTMLElement>('[data-cookie]')?.dataset.cookie
      if (cookieChoice) {
        localStorage.setItem('alamir-cookie-choice', cookieChoice)
        document.getElementById('cookie-notice')?.classList.remove('show')
      }
      if (target === announcement || target.closest('[data-ann-close],#announce-close')) {
        announcement?.classList.remove('open')
        announcement?.setAttribute('aria-hidden','true')
        const key=announcement?.dataset.eventKey;if(key)sessionStorage.setItem(`alamir-event-dismissed:${key}`,'1')
      }
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenu(false); setQuote(false) }
    }
    window.addEventListener('scroll', updateHeader, {passive: true})
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKey)
    updateHeader()
    if(announcement){
      const key=announcement.dataset.eventKey
      if(key&&!sessionStorage.getItem(`alamir-event-dismissed:${key}`)){
        const show=()=>{
          if(window.scrollY<120||document.body.classList.contains('menu-open'))return
          announcement.classList.add('open')
          announcement.setAttribute('aria-hidden','false')
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
      document.removeEventListener('keydown', handleKey)
      if(showAnnouncementOnScroll)window.removeEventListener('scroll',showAnnouncementOnScroll)
      observer?.disconnect()
      revealChanges.disconnect()
      document.body.classList.remove('menu-open')
    }
  }, [pathname])

  return null
}
