import {Fragment, type ReactNode} from 'react'
import {SmartLink} from '@/components/site/smart-link'
import type {ContentDocument, ContentNode} from '@/lib/editor/document'

export function renderInlineNode(node: ContentNode): ReactNode {
  if (node.type === 'hardBreak') return <br/>
  return (node.marks ?? []).reduce<ReactNode>((text, mark) =>
    mark.type === 'bold' ? <strong>{text}</strong>
      : mark.type === 'italic' ? <em>{text}</em>
        : mark.type === 'underline' ? <u>{text}</u>
          : mark.type === 'strike' ? <s>{text}</s>
            : mark.type === 'code' ? <code>{text}</code>
          : mark.type === 'link' ? <SmartLink href={String(mark.attrs?.href ?? '')}>{text}</SmartLink>
            : text, node.text)
}

export function InlineContent({document}: {document: ContentDocument}) {
  return <>{document.content.map((node, i) => <Fragment key={i}>
    {i > 0 && <br/>}
    {(node.content ?? [node]).map((child, j) => <Fragment key={j}>{renderInlineNode(child)}</Fragment>)}
  </Fragment>)}</>
}
