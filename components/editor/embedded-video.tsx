'use client'

import {useState} from 'react'

export function EmbeddedVideo({src,label,ratio,poster}:{src:string;label:string;ratio:string;poster?:string}) {
  const [playing,setPlaying]=useState(false)
  return playing
    ? <iframe src={src} title={label} allow="fullscreen; picture-in-picture" allowFullScreen style={{aspectRatio:ratio}}/>
    : <button type="button" className="embedded-video-preview" onClick={()=>setPlaying(true)} style={{aspectRatio:ratio,backgroundImage:poster?`url(${JSON.stringify(poster)})`:undefined}}>
        <span aria-hidden="true">▶</span><span>{label}</span>
      </button>
}
