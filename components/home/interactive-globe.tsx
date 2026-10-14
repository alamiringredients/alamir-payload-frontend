'use client'

import {useEffect, useRef} from 'react'
import type {LandData} from './globe-renderer'

export function InteractiveGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const abortController = new AbortController()
    let dispose: (() => void) | undefined

    const load = () => Promise.all([
      import('./globe-renderer'),
      fetch('/assets/data/land.json', {signal: abortController.signal})
      .then((response) => {
        if (!response.ok) throw new Error(`Land data request failed with ${response.status}`)
        return response.json() as Promise<LandData>
      })
    ]).then(([{initGlobe}, geo]) => {
        if (abortController.signal.aborted) return
        dispose = initGlobe(container, geo, {
          oceanColor: '#0f2136',
          dotColor: '#c9dae8',
          dotOpacity: .88,
          outlineColor: '#1e3a5c',
          graticuleColor: '#1e3a5c',
          markerColor: '#f2b19d',
          markers: [
            {lat: 30.4, lng: 30.5},
            {lat: 48.8, lng: 9.2},
            {lat: 24.5, lng: 51.2},
            {lat: 32.6, lng: 5.4},
            {lat: 22.4, lng: 110},
          ],
        })
        container.querySelector('.gfb')?.remove()
      })
      .catch((error: unknown) => {
        if (!abortController.signal.aborted) console.warn('[globe] WebGL globe unavailable, keeping SVG fallback:', error)
      })

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      void load()
    }, {rootMargin: '300px'})
    observer.observe(container)

    return () => {
      observer.disconnect()
      abortController.abort()
      dispose?.()
    }
  }, [])

  return <div ref={containerRef} className="globe-3d" id="globe3d" role="img" aria-label="Interactive globe showing Alamir export regions">
    <svg className="gfb" width={280} height={280} viewBox="0 0 240 240" aria-hidden="true">
      <circle cx={120} cy={120} r={98} fill="none" stroke="rgba(201,218,232,.34)" strokeWidth="1.2" />
      <ellipse cx={120} cy={120} rx={98} ry={38} fill="none" stroke="rgba(201,218,232,.2)" strokeWidth={1} />
      <ellipse cx={120} cy={120} rx={98} ry={70} fill="none" stroke="rgba(201,218,232,.14)" strokeWidth={1} />
      <ellipse cx={120} cy={120} rx={40} ry={98} fill="none" stroke="rgba(201,218,232,.2)" strokeWidth={1} />
      <ellipse cx={120} cy={120} rx={72} ry={98} fill="none" stroke="rgba(201,218,232,.14)" strokeWidth={1} />
      <line x1={22} y1={120} x2={218} y2={120} stroke="rgba(201,218,232,.2)" strokeWidth={1} />
      <g stroke="rgba(242,177,157,.6)" strokeWidth="1.1" fill="none" strokeDasharray="3 3">
        <path d="M120 120 L108 72" /><path d="M120 120 L150 104" /><path d="M120 120 L96 132" /><path d="M120 120 L176 146" />
      </g>
      <g fill="#f2b19d">
        <circle cx={108} cy={72} r={5} /><circle cx={150} cy={104} r={5} /><circle cx={96} cy={132} r={5} /><circle cx={176} cy={146} r={5} /><circle cx={120} cy={120} r="3.4" fill="#fff" />
      </g>
    </svg>
  </div>
}
