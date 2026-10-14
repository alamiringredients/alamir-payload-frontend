/** Portable, branded content. No font, arbitrary CSS, or raw HTML is persisted. */
export type ContentNode = {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: {type: string; attrs?: Record<string, unknown>}[]
  content?: ContentNode[]
}

export type ContentDocument = ContentNode & {type: 'doc'; content: ContentNode[]}

export const textContent = (node: ContentNode): string => node.text ?? (node.content ?? []).map(textContent).join('')

export function documentHeadings(doc: ContentNode): {id:string; text:string; level:number}[] {
  const found: {id:string; text:string; level:number}[] = []
  const visit = (node: ContentNode,visible=true) => {
    const shown=visible&&node.attrs?.visible!==false
    if (shown&&node.type === 'heading' && node.attrs?.id && !node.attrs.hideFromContents) {
      found.push({id:String(node.attrs.id),text:textContent(node),level:Number(node.attrs.level)})
    }
    node.content?.forEach(child=>visit(child,shown))
  }
  visit(doc)
  return found
}
