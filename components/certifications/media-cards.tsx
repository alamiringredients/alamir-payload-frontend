'use client'
import {useState} from 'react'
import Image from 'next/image'
import {SiteIcon} from '@/components/site/site-icon'
import styles from './quality-blocks.module.css'
import type {CSSProperties,TransitionEvent} from 'react'

type MediaCard={image:string;alt:string;title:string;description:string}

export function MediaCards({items}:{items:MediaCard[]}){
  const count=items.length
  const [position,setPosition]=useState(count)
  const [instant,setInstant]=useState(false)
  if(!count)return null
  const logical=((position%count)+count)%count
  const copies=[...items,...items,...items]
  const show=(next:number)=>{setInstant(false);setPosition(next)}
  const settle=(event:TransitionEvent<HTMLDivElement>)=>{
    if(event.target!==event.currentTarget||event.propertyName!=='transform')return
    const centred=position<count?position+count:position>=count*2?position-count:position
    if(centred===position)return
    setInstant(true)
    setPosition(centred)
    requestAnimationFrame(()=>requestAnimationFrame(()=>setInstant(false)))
  }
  const trackStyle={'--media-position':position} as CSSProperties
  return <div className={`${styles.mediaCards}${instant?` ${styles.instant}`:''}`} data-media-cards dir="ltr" role="group" aria-roledescription="carousel" tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();show(position+1)}else if(event.key==='ArrowLeft'){event.preventDefault();show(position-1)}}}>
    <div className={styles.viewport}>
      <div className={styles.track} style={trackStyle} onTransitionEnd={settle}>{copies.map((item,index)=>{
        const original=index>=count&&index<count*2
        return <article dir="auto" key={`${index}-${item.image}`} className={`${styles.card}${index===position?` ${styles.active}`:''}`} {...(original?{'data-media-card':'','data-active':index===position}: {'data-media-clone':'','aria-hidden':true})} tabIndex={original?0:-1} onClick={()=>show(index)} onKeyDown={event=>{if(original&&(event.key==='Enter'||event.key===' ')){event.preventDefault();show(index)}}}>
          <figure className={styles.shot}>{item.image&&<Image src={item.image} alt={original?item.alt:''} width={900} height={700} loading="lazy"/>}</figure>
          <div className={styles.cardBody}><div className={styles.cardTop}><h3>{item.title}</h3><span className={styles.cardIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 5.6C9.4 4.6 7.6 4 5.5 4H3v14h2.5c2.1 0 3.9.6 5.5 1.6V5.6Zm2 0v14c1.6-1 3.4-1.6 5.5-1.6H21V4h-2.5c-2.1 0-3.9.6-5.5 1.6Z"/></svg></span></div><div className={styles.cardFoot}><p>{item.description}</p></div></div>
        </article>
      })}</div>
    </div>
    <div className={styles.controls}>
      <button type="button" className={styles.arrow} data-media-go="prev" aria-label={items[(logical-1+count)%count].title} onClick={()=>show(position-1)}><SiteIcon name="arrow-left"/></button>
      <div className={styles.dots}>{items.map((item,index)=><button type="button" className={index===logical?styles.current:''} data-media-step={index} aria-label={item.title} aria-current={index===logical?'true':undefined} onClick={()=>show(count+index)} key={index}/>)}</div>
      <button type="button" className={styles.arrow} data-media-go="next" aria-label={items[(logical+1)%count].title} onClick={()=>show(position+1)}><SiteIcon name="arrow-right"/></button>
    </div>
  </div>
}
