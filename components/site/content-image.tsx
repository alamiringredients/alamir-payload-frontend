import Image, {type ImageProps} from 'next/image'
import assetDimensions from '@/lib/asset-dimensions.json'
import {mediaDimensions} from '@/lib/payload/client'

type ContentImageProps = Omit<ImageProps, 'width' | 'height'> & {
  width?: number | `${number}`
  height?: number | `${number}`
}

const dimensions: Record<string, {width: number; height: number}> = assetDimensions

function knownDimensions(src:string){
 try{return dimensions[decodeURIComponent(new URL(src,'http://local').pathname)]}catch{return undefined}
}
async function MediaImage(props:ContentImageProps){
 const intrinsic=(await mediaDimensions()).get(String(props.src))??{width:1,height:1}
 return image(props,intrinsic)
}
export function ContentImage(props:ContentImageProps){
 const path=typeof props.src==='string'?props.src:''
 const intrinsic=path&&(!props.width||!props.height)?knownDimensions(path):{width:1,height:1}
 return intrinsic?image(props,intrinsic):<MediaImage {...props}/>
}
function image({src,alt,width,height,sizes,...props}:ContentImageProps,intrinsic:{width:number;height:number}){
 const path=typeof src==='string'?src:''
  const hint = `${path} ${props.className || ''}`
  const inferredSizes = /logo|icon|mark|thumb|certs/.test(hint)
    ? '(max-width: 900px) 96px, 160px'
    : /(?:^|\s)(?:pa-|tomato-|f-|k-|p-)/.test(hint)
      ? '(max-width: 900px) 35vw, 240px'
      : '(max-width: 900px) 100vw, 50vw'

  return <Image
    {...props}
    fetchPriority={props.fetchPriority ?? (props.preload || props.priority ? 'high' : undefined)}
    src={src}
    alt={alt}
    width={width ? Number(width) : intrinsic.width}
    height={height ? Number(height) : intrinsic.height}
    sizes={sizes || inferredSizes}
  />
}
