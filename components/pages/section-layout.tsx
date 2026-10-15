import type {CSSProperties} from 'react'
import {columnWidths} from '@/components/layout/two-columns'
import {Fragment,type ReactNode} from 'react'
import type {PageBlock} from '@/lib/payload/client'
import type {SiteLocale} from '@/i18n/navigation'
import {BasicSection} from './basic-section'

export function SectionLayout({layout,locale,renderSection}:{layout:PageBlock[];locale:SiteLocale;renderSection:(block:PageBlock)=>ReactNode}){
 return <>{layout.filter(block=>block.enabled!==false).map(block=><Fragment key={block.id}><div className="cms-section" data-media-position={block.mediaPosition} data-section-id={block.id} style={{'--cms-two-column-widths':columnWidths[String(block.columnWidth)],'--cms-media-order':block.mediaPosition==='left'?1:block.mediaPosition==='right'?2:undefined} as CSSProperties}>{['hero','text','text-media','gallery','call-to-action'].includes(block.blockType)?<BasicSection block={block} locale={locale}/>:renderSection(block)}</div>{" "}</Fragment>)}</>
}
