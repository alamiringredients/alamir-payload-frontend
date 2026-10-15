import type {CSSProperties} from 'react'
import {columnWidths} from '@/components/layout/two-columns'
import {Fragment,type ReactNode} from 'react'
import type {PageBlock} from '@/lib/payload/client'

export function SectionLayout({layout,renderSection}:{layout:PageBlock[];renderSection:(block:PageBlock)=>ReactNode}){
 return <>{layout.filter(block=>block.enabled!==false).map(block=><Fragment key={block.id}><div className="cms-section" data-media-position={block.mediaPosition} data-section-id={block.id} style={{'--cms-two-column-widths':columnWidths[String(block.columnWidth)],'--cms-media-order':block.mediaPosition==='left'?1:block.mediaPosition==='right'?2:undefined} as CSSProperties}>{renderSection(block)}</div>{" "}</Fragment>)}</>
}
