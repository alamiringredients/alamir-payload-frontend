import type {ComponentProps} from 'react'
import {ContentImage} from './content-image'

type HeroImageProps=ComponentProps<typeof ContentImage>&{fit?:'cover'|'contain'}

/** Shared sizing contract for public hero images. */
function HeroImage({fit='cover',className,sizes='(max-width: 700px) calc(100vw - 32px), (max-width: 1050px) min(900px, calc(100vw - 40px)), 50vw',...props}:HeroImageProps){
  return <ContentImage {...props} sizes={sizes} className={`site-hero-image site-hero-image--${fit}${className?` ${className}`:''}`}/>
}

export function HeroMedia({className='ph-media',fit='cover',...props}:HeroImageProps){
  return <figure className={className}><HeroImage {...props} fit={fit}/></figure>
}
