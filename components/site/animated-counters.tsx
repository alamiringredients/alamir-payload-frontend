'use client'

import {useEffect, type RefObject} from 'react'

export function useAnimatedCounters(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current
    if (!container) return

    const values = Array.from(container.querySelectorAll<HTMLElement>('.val[data-count]'))
    if (!values.length) return

    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let observer: IntersectionObserver | undefined

    const stop = () => cancelAnimationFrame(frame)
    const finish = () => values.forEach(value => { value.textContent = value.dataset.count! })
    const animate = () => {
      stop()
      const start = performance.now()
      const step = (now: number) => {
        values.forEach((value, index) => {
          const from = Number(value.dataset.from ?? 0)
          const to = Number(value.dataset.count)
          const progress = Math.max(0, Math.min(1, (now - start - index * 110) / 1400))
          value.textContent = progress === 1 ? String(to) : String(Math.round(from + (to - from) * (1 - Math.pow(1 - progress, 4))))
        })
        if (now - start < 1400 + (values.length - 1) * 110) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }
    const configure = () => {
      stop()
      observer?.disconnect()
      finish()
      if (motion.matches || !('IntersectionObserver' in window)) return
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) animate()
          else finish()
        }
      }, {threshold: .35, rootMargin: '0px 0px -12% 0px'})
      observer.observe(container)
    }

    configure()
    motion.addEventListener('change', configure)
    return () => {
      stop()
      observer?.disconnect()
      motion.removeEventListener('change', configure)
    }
  }, [root])
}
