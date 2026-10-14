import styles from './content-blocks.module.css'
import {Fragment, type CSSProperties, type ReactNode} from 'react'
import {type ContentNode, type ContentDocument} from '@/lib/editor/document'
import {renderInlineNode} from './inline-content'
import {AboutProfileBlock,ActionsBlock,CalloutBlock,ColumnBlock,ColumnsBlock,ContentSectionBlock,DataTableBlock,FactsBlock,GalleryBlock,ImageBlock,SectionHeaderBlock,TextStatisticsBlock,ValuesRailBlock,VideoBlock} from './custom-blocks'
export {InlineContent} from './inline-content'
type BlockRenderer = (node: ContentNode) => ReactNode
export function ContentRenderer({document,renderBlock,groupLogo,fullWidth=false}:{document:ContentDocument;renderBlock?:BlockRenderer;groupLogo?:string;fullWidth?:boolean}) {
  return <div data-rich-content="" className={`${styles.document}${fullWidth?` ${styles.fullWidth}`:''}`}>{document.content.map((node,i)=><Fragment key={node.attrs?.id ? String(node.attrs.id) : i}>{renderNode(node,renderBlock,groupLogo)}</Fragment>)}</div>
}
function renderNode(node:ContentNode,renderBlock?:BlockRenderer,groupLogo?:string):ReactNode {
  const a=node.attrs ?? {}
  if(a.visible===false)return null
  const alignment={textAlign:a.textAlign as CSSProperties['textAlign']}
  const children=node.content?.map((child,i)=><Fragment key={i}>{renderNode(child,renderBlock,groupLogo)}</Fragment>)
  const props={node,children,renderNode:(child:ContentNode)=>renderNode(child,renderBlock,groupLogo)}
  switch(node.type) {
    case 'sectionHeader':return <SectionHeaderBlock {...props}/>
    case 'actions':return <ActionsBlock {...props}/>
    case 'aboutProfile':return <AboutProfileBlock {...props}/>
    case 'valuesRail':return <ValuesRailBlock {...props}/>
    case 'contentSection':return <ContentSectionBlock {...props}/>
    case 'dataTable':return <DataTableBlock {...props}/>
    case 'text': return renderInlineNode(node)
    case 'paragraph':return <p style={alignment} className={`${styles.paragraph}${a.variant==='lead'?` ${styles.lede}`:''}`} >{children}</p>
    case 'heading':return a.level===3?<h3 style={alignment} className={styles.heading3} id={a.id?String(a.id):undefined}>{children}</h3>:<h2 style={alignment} className={styles.heading2} id={a.id?String(a.id):undefined}>{children}</h2>
    case 'hardBreak':return <br/>
    case 'horizontalRule':return <hr className={styles.divider}/>
    case 'bulletList':return <ul className={styles.bullets}>{children}</ul>
    case 'orderedList':return <ol className={styles.numbered}>{children}</ol>
    case 'listItem':return <li className={styles.item}>{children}</li>
    case 'blockquote':return <blockquote className={styles.quote}>{children}{a.citation?<cite>{String(a.citation)}</cite>:null}</blockquote>
    case 'image':return <ImageBlock {...props}/>
    case 'gallery':return <GalleryBlock {...props}/>
    case 'facts':return <FactsBlock {...props}/>
    case 'textStatistics':return <TextStatisticsBlock {...props} groupLogo={groupLogo}/>
    case 'columns':return <ColumnsBlock {...props}/>
    case 'column':return <ColumnBlock {...props}/>
    case 'callout':return <CalloutBlock {...props}/>
    case 'video':return <VideoBlock {...props}/>
    default:return renderBlock?.(node) ?? children
  }
}
