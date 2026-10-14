import {ValuesRail} from './values-rail'
import {ContentImage} from '@/components/site/content-image'
import styles from './content-blocks.module.css'

type ValueItem={image:string;alt:string;title:string;description:string}

export function ValuesBlock({items}:{items:ValueItem[]}) {
  if(!items.length)return null
  return <ValuesRail>
    <div className={styles['values-media']}>
      <div className={styles['values-frame']}>{items.map((item,index)=>item.image?<ContentImage key={index} src={item.image} alt={item.alt} aria-hidden={index!==0} className={styles['values-photo']} data-active={index===0} data-value-photo={index} width={1500} height={2000}/>:null)}</div>
      <div className={styles['values-caption']}><span data-value-number="">01</span><span data-value-title="">{items[0]?.title}</span><i className={styles['values-caption-line']} aria-hidden="true" /></div>
    </div>
    <ol className={styles['values-list']}>{items.map((item,index)=><li key={index} data-value-index={index} data-active={index===0} className={styles['values-item']}>
      <span className={styles['values-number']}>{String(index+1).padStart(2,'0')}</span><h3>{item.title}</h3>{item.description&&<p>{item.description}</p>}
    </li>)}</ol>
  </ValuesRail>
}
