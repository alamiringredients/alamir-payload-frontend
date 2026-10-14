'use client'

import {useEffect,useRef,type ReactNode} from 'react'
import styles from './content-blocks.module.css'

/** Each rail owns its observer, including when several rails appear on one page. */
export function ValuesRail({children}:{children:ReactNode}) {
  const root=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const rail=root.current
    if(!rail||!('IntersectionObserver' in window))return
    const items=rail.querySelectorAll<HTMLElement>('[data-value-index]')
    const photos=rail.querySelectorAll<HTMLElement>('[data-value-photo]')
    const number=rail.querySelector('[data-value-number]')
    const title=rail.querySelector('[data-value-title]')
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue
        const index=entry.target.getAttribute('data-value-index')
        items.forEach(item=>{item.dataset.active=String(item.dataset.valueIndex===index)})
        photos.forEach(photo=>{
          const active=photo.dataset.valuePhoto===index
          photo.dataset.active=String(active)
          photo.setAttribute('aria-hidden',String(!active))
        })
        if(number)number.textContent=String(Number(index)+1).padStart(2,'0')
        if(title)title.textContent=entry.target.querySelector('h3')?.textContent??''
      }
    },{rootMargin:'-48% 0px -48% 0px',threshold:0})
    items.forEach(item=>observer.observe(item))
    return()=>observer.disconnect()
  },[children])
  return <div ref={root} data-rich-content="" className={styles.values}>{children}</div>
}
