'use client'

import {useState} from 'react'
import Image from 'next/image'

export function EmbeddedVideo({src,label,ratio,poster}:{src:string;label:string;ratio:string;poster?:string}) {
  const [playing,setPlaying]=useState(false)
  const videoURL=new URL(src)
  videoURL.searchParams.set('autoplay','1')
  return playing
    ? <iframe src={videoURL.href} title={label} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen style={{aspectRatio:ratio}}/>
    : <button type="button" className="embedded-video-preview" onClick={()=>setPlaying(true)} style={{aspectRatio:ratio}}>
        {poster&&<Image src={poster} alt="" fill loading="lazy" sizes="100vw"/>}
        <span aria-hidden="true">▶</span><span>{label}</span>
      </button>
}
