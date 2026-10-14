'use client'

import {useEffect,useRef} from 'react'


export function SustainabilityRing({icons}:{icons:string[]}){
  const iconCount=icons.length
  const canvasRef=useRef<HTMLCanvasElement>(null)

  useEffect(()=>{
    const canvas=canvasRef.current
    const box=canvas?.parentElement
    const context=canvas?.getContext('2d')
    if(!canvas||!box||!context||!iconCount)return

    const reduced=matchMedia('(prefers-reduced-motion: reduce)')
    const images=icons.map(src=>{
      const image=new Image()
      image.decoding='async'
      image.fetchPriority='low'
      image.src=src
      return image
    })
    const ratio=Math.min(2,devicePixelRatio||1)
    let width=0,height=0,rotation=0,last=0,frame=0,running=false

    const roundedRect=(x:number,y:number,size:number,radius:number)=>{
      context.beginPath()
      context.roundRect(x,y,size,size,Math.min(radius,size/2))
      context.closePath()
    }
    const paint=()=>{
      context.setTransform(ratio,0,0,ratio,0,0)
      context.clearRect(0,0,width,height)
      const centreX=width/2,centreY=height/2
      const radius=Math.min(width,height)*.5*.82
      const size=Math.min(78*Math.min(1,Math.max(.55,Math.min(width,height)/620)),Math.PI*2*radius*.92/iconCount)
      images.forEach((image,index)=>{
        const angle=rotation+index/iconCount*Math.PI*2
        const x=centreX+Math.cos(angle)*radius
        const y=centreY-Math.sin(angle)*radius
        context.save()
        context.translate(x,y)
        context.rotate(-angle-Math.PI/2)
        roundedRect(-size/2,-size/2,size,size*.25)
        context.clip()
        if(image.complete&&image.naturalWidth)context.drawImage(image,-size/2,-size/2,size,size)
        else{context.fillStyle='rgba(255,255,255,.06)';context.fillRect(-size/2,-size/2,size,size)}
        context.restore()
      })
    }
    const resize=()=>{
      width=box.clientWidth||600
      height=box.clientHeight||600
      canvas.width=Math.floor(width*ratio)
      canvas.height=Math.floor(height*ratio)
      canvas.style.width=`${width}px`
      canvas.style.height=`${height}px`
      paint()
    }
    const animate=(now:number)=>{
      const elapsed=last?(now-last)/1000:0
      last=now
      rotation=(rotation+Math.PI*2*.02*Math.min(elapsed,.1))%(Math.PI*2)
      paint()
      frame=requestAnimationFrame(animate)
    }
    const start=()=>{
      if(running||reduced.matches)return
      running=true
      last=0
      frame=requestAnimationFrame(animate)
    }
    const stop=()=>{
      running=false
      cancelAnimationFrame(frame)
    }
    const resizeObserver=new ResizeObserver(resize)
    const visibilityObserver=new IntersectionObserver(entries=>entries[0]?.isIntersecting?start():stop(),{rootMargin:'120px'})
    const onVisibility=()=>document.hidden?stop():start()
    images.forEach(image=>image.addEventListener('load',paint))
    resizeObserver.observe(box)
    visibilityObserver.observe(canvas)
    document.addEventListener('visibilitychange',onVisibility)
    resize()

    return()=>{
      stop()
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange',onVisibility)
      images.forEach(image=>image.removeEventListener('load',paint))
    }
  },[icons,iconCount])

  return <div className="ph-vortex-media" aria-hidden="true" data-sustainability-ring>
    <canvas ref={canvasRef} data-spiral data-shape="circle" data-count={iconCount} data-ring=".82" data-size="78"/>
  </div>
}
