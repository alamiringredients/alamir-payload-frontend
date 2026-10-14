import {ContentImage} from '@/components/site/content-image'
import styles from './content-blocks.module.css'
import {ContentRenderer} from './content-renderer'
import type {ContentDocument} from '@/lib/editor/document'

export function ProfileBlock({attrs:a}:{attrs:Record<string,unknown>}) {
  const text=(key:string)=>String(a[key]??'')
  const copy=(key:string)=>{
    const value=a[key]
    return value && typeof value==='object' && 'type' in value && value.type==='doc'
      ? <ContentRenderer document={value as ContentDocument}/>
      : <p>{text(key)}</p>
  }
  return <div data-rich-content="" className={styles.profile} data-media-side={a.mediaSide?String(a.mediaSide):undefined}>
    <figure className={styles['profile-photo']}>
      {a.image?<ContentImage src={text('image')} alt={text('alt')}/>:null}
      <figcaption><b>{text('storyLabel')}</b>{copy('story')}</figcaption>
    </figure>
    <div className={styles['profile-cards']}>
      <div className={`${styles['profile-card']} ${styles['profile-card--dark']}`}><b>{text('visionLabel')}</b>{copy('vision')}</div>
      <div className={styles['profile-card']}><b>{text('missionLabel')}</b>{copy('mission')}</div>
    </div>
  </div>
}
