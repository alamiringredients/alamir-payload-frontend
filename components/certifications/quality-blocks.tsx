import type {ContentNode} from '@/lib/editor/document'
import type {CertificationData,CertificationInterfaceLabels,CertificationHolder} from '@/lib/certifications/types'
import type {SiteLocale} from '@/i18n/navigation'
import {CertificationPanel} from './certification-panel'
import {MediaCards} from './media-cards'
import styles from './quality-blocks.module.css'

type MediaCard={image:string;alt:string;title:string;description:string}

export function PillarsBlock({items}:{items:string[]}){
  return <div className={styles.pillars}>{items.map((item,index)=><div key={index}><strong>{item}</strong></div>)}</div>
}

export function CertificationPanelBlock({attrs,data,locale,labels,groupLogo}:{attrs:Record<string,unknown>;data:CertificationData;locale:SiteLocale;labels:CertificationInterfaceLabels;groupLogo:string}){
  return <CertificationPanel data={data} holder={String(attrs.holder) as CertificationHolder} locale={locale} labels={labels} groupLogo={groupLogo}/>
}

export function MediaCardsBlock({attrs}:{attrs:Record<string,unknown>}){
  return <MediaCards items={(attrs.items??[]) as MediaCard[]}/>
}

export function qualityBlockRenderer(data:CertificationData,locale:SiteLocale,labels:CertificationInterfaceLabels,groupLogo:string){
  return (node:ContentNode)=>{
    const attrs=node.attrs??{}
    if(node.type==='certificationPanel')return <CertificationPanelBlock attrs={attrs} data={data} locale={locale} labels={labels} groupLogo={groupLogo}/>
    if(node.type==='mediaCards')return <MediaCardsBlock attrs={attrs}/>
    if(node.type==='pillars')return <PillarsBlock items={(attrs.items??[]) as string[]}/>
    return null
  }
}
