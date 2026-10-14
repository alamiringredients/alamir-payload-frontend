import {Children,isValidElement,type ReactNode} from 'react'
import type definitions from '@/lib/payload/sections.json'
import type {CmsPage,PageBlock} from '@/lib/payload/client'
import type {WebsiteSettings} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
export type PageContext={query?:string;tag?:string}
export type SectionArgs={block:PageBlock;locale:SiteLocale;source:CmsPage;definition:(typeof definitions)[number];settings:WebsiteSettings;context:PageContext}
export function mainSections(node:ReactNode):ReactNode[]{
 if(!isValidElement(node))return []
 const props=node.props as {children?:ReactNode}
 return Children.toArray(props.children).filter(child=>typeof child!=='string'||child.trim())
}
