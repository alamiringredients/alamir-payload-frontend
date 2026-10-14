'use client'

import {useEffect,useRef,type ReactNode} from 'react'

export function CertificationCarouselFrame({label,children}:{label:string;children:ReactNode}){
  const ref=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    const box=ref.current
    if(!box)return
    const cards=[...box.querySelectorAll<HTMLElement>('.cf-card')]
    if(!cards.length)return
    const calm=matchMedia('(prefers-reduced-motion: reduce)').matches
    const perspective=1600
    const maximumVisibleRank=3
    let active=0
    let locked=false
    let paused=false
    let unlockTimer:ReturnType<typeof setTimeout>|undefined

    const radians=(degrees:number)=>degrees*Math.PI/180
    const foreshortening=(rank:number)=>perspective/(perspective+rank*240)
    const halfWidth=(rank:number,width:number,height:number)=>{
      const scale=Math.max(.4,1-rank*.16)
      const rotatedWidth=width*scale*Math.cos(radians(12*rank))
      const rotatedHeight=height*scale
      const angle=radians(8*rank)
      return (rotatedWidth*Math.cos(angle)+rotatedHeight*Math.sin(angle))/2
    }
    const layout=()=>{
      const width=cards[0]?.offsetWidth||400
      const height=cards[0]?.offsetHeight||400
      const containerHalf=box.clientWidth/2
      const preferredStep=Math.max(width*.6,box.clientWidth*.22)
      let cappedStep=Infinity
      for(let rank=1;rank<=maximumVisibleRank;rank++){
        const limit=((containerHalf-28)/foreshortening(rank)-halfWidth(rank,width,height))/rank
        cappedStep=Math.min(cappedStep,limit)
      }
      const step=Math.max(0,Math.min(preferredStep,cappedStep))
      cards.forEach((card,index)=>{
        let relative=index-active
        if(relative>cards.length/2)relative-=cards.length
        if(relative<-cards.length/2)relative+=cards.length
        const rank=Math.abs(relative)
        const visible=rank<=maximumVisibleRank
        const scale=Math.max(.4,1-rank*.16)
        card.style.transform=`translate(-50%,-50%) translateX(${relative*step}px) translateZ(${-rank*240}px) rotateY(${-relative*12}deg) rotateZ(${relative*8}deg) scale(${scale})`
        card.style.opacity=visible?'1':'0'
        card.style.pointerEvents=visible?'auto':'none'
        card.setAttribute('aria-hidden',String(!visible))
        card.classList.toggle('is-active',relative===0)
      })
    }
    const go=(index:number)=>{
      if(locked)return
      active=(index+cards.length)%cards.length
      layout()
      if(calm)return
      locked=true
      unlockTimer=setTimeout(()=>{locked=false},600)
    }
    const clickHandlers=cards.map((card,index)=>{
      const handler=()=>go(index===active?active+1:index)
      card.addEventListener('click',handler)
      return handler
    })
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==='ArrowRight'){event.preventDefault();go(active+1)}
      else if(event.key==='ArrowLeft'){event.preventDefault();go(active-1)}
    }
    const pause=()=>{paused=true}
    const resume=()=>{paused=false}
    box.addEventListener('keydown',keydown)
    box.addEventListener('mouseenter',pause)
    box.addEventListener('mouseleave',resume)
    box.addEventListener('focusin',pause)
    box.addEventListener('focusout',resume)
    box.addEventListener('touchstart',pause,{passive:true})
    const resizeObserver='ResizeObserver' in window?new ResizeObserver(layout):undefined
    resizeObserver?.observe(box)
    if(!resizeObserver)window.addEventListener('resize',layout)
    layout()
    const autoplay=calm?undefined:setInterval(()=>{if(!paused&&!document.hidden)go(active+1)},2500)

    return ()=>{
      cards.forEach((card,index)=>card.removeEventListener('click',clickHandlers[index]))
      box.removeEventListener('keydown',keydown)
      box.removeEventListener('mouseenter',pause)
      box.removeEventListener('mouseleave',resume)
      box.removeEventListener('focusin',pause)
      box.removeEventListener('focusout',resume)
      box.removeEventListener('touchstart',pause)
      resizeObserver?.disconnect()
      if(!resizeObserver)window.removeEventListener('resize',layout)
      if(autoplay)clearInterval(autoplay)
      if(unlockTimer)clearTimeout(unlockTimer)
    }
  },[])

  return <div ref={ref} className="certflow reveal" tabIndex={0} role="group" aria-roledescription="carousel" aria-label={label}>{children}</div>
}
