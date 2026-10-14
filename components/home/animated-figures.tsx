'use client'

import {useAnimatedCounters} from '@/components/site/animated-counters'
import {useRef, type ReactNode} from 'react'

// Numeric values and notation are independent of the CMS translation fields.
export function FigureValue({index, value, from, unit, children}: {index: number; value: number; from?: number; unit?: string; children?: ReactNode}) {
  return <>
    <span className="ix">{String(index).padStart(2, '0')}</span>
    <span className="fig"><span className="val" data-count={value} data-from={from}>{value}</span>{unit && <span className="unit">{unit}</span>}{children}</span>
  </>
}

export function AnimatedFigures({children}: {children: ReactNode}) {
  const ref = useRef<HTMLOListElement>(null)
  useAnimatedCounters(ref)

  return <ol ref={ref} className="numbers-grid reveal" data-animated-counters>{children}</ol>
}
