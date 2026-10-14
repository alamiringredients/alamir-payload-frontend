import {Fragment,type ReactNode} from 'react'
import {SmartLink} from './smart-link'

type Breadcrumb={label:ReactNode;href?:string}

export function Breadcrumbs({label,items}:{label:string;items:Breadcrumb[]}){
  return <nav className="ph-crumb" aria-label={label}>{items.map((item,index)=><Fragment key={index}>{index>0&&<> / </>}{item.href?<SmartLink href={item.href}>{item.label}</SmartLink>:<b>{item.label}</b>}</Fragment>)}</nav>
}
