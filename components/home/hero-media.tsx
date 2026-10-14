'use client'

import Image from 'next/image'
import {useEffect, useRef} from 'react'

export function HeroMedia({poster = '', clips = []}: {poster?: string; clips?: string[]}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLVideoElement>(null)
  const secondRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const first = firstRef.current
    const second = secondRef.current
    if (!container || !first || !second || clips.length === 0) return

    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || connection?.saveData) return

    let active = first
    let queued = second
    let index = 0
    let changing = false
    let disposed = false
    let queuedPrepared = false
    let cancelStart = () => {}

    const prepare = (video: HTMLVideoElement, clipIndex: number) => {
      video.preload = 'auto'
      video.src = clips[clipIndex % clips.length]
      video.load()
    }
    const queueNext = () => {
      if (queuedPrepared) return
      prepare(queued, index + 1)
      queuedPrepared = true
    }

    const changeClip = async () => {
      if (changing || disposed) return
      changing = true
      try { await queued.play() } catch { changing = false; return }
      queued.classList.add('on')
      active.classList.remove('on')
      const previous = active
      active = queued
      queued = previous
      index = (index + 1) % clips.length
      queuedPrepared = false
      queued.pause()
      queued.removeAttribute('src')
      queued.load()
      changing = false
    }
    const watchPlayback = () => {
      if (!Number.isFinite(active.duration)) return
      const remaining = active.duration - active.currentTime
      if (remaining <= 4) queueNext()
    }
    const start = async () => {
      if (disposed) return
      prepare(active, 0)
      try {
        await active.play()
        if (disposed) return
        active.classList.add('on')
        container.classList.add('is-playing')
      } catch {
        active.removeAttribute('src')
        active.load()
      }
    }
    const handleVisibility = () => {
      if (document.hidden) { active.pause(); queued.pause() }
      else if (container.classList.contains('is-playing')) void active.play()
    }

    first.addEventListener('timeupdate', watchPlayback)
    second.addEventListener('timeupdate', watchPlayback)
    first.addEventListener('ended', changeClip)
    second.addEventListener('ended', changeClip)
    document.addEventListener('visibilitychange', handleVisibility)
    const scheduleStart = () => {
      if ('requestIdleCallback' in window) {
        const idleCallback = window.requestIdleCallback(start)
        cancelStart = () => window.cancelIdleCallback(idleCallback)
      } else {
        const timer = globalThis.setTimeout(start, 1)
        cancelStart = () => globalThis.clearTimeout(timer)
      }
    }
    if (document.readyState === 'complete') scheduleStart()
    else {
      window.addEventListener('load', scheduleStart, {once: true})
      cancelStart = () => window.removeEventListener('load', scheduleStart)
    }

    return () => {
      disposed = true
      cancelStart()
      first.removeEventListener('timeupdate', watchPlayback)
      second.removeEventListener('timeupdate', watchPlayback)
      first.removeEventListener('ended', changeClip)
      second.removeEventListener('ended', changeClip)
      document.removeEventListener('visibilitychange', handleVisibility)
      first.pause(); second.pause()
    }
  }, [clips])

  return <div ref={containerRef} className="hero-media" aria-hidden="true">
    {poster && <Image className="hero-poster" src={poster} alt="" fill preload sizes="100vw" />}
    <video ref={firstRef} className="hv" muted playsInline preload="none" tabIndex={-1} />
    <video ref={secondRef} className="hv" muted playsInline preload="none" tabIndex={-1} />
  </div>
}
