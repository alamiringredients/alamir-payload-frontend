import type {ComponentProps,ReactNode} from 'react'
import {BasicSection} from './basic-section'

export function Section({renderSection,...props}:ComponentProps<typeof BasicSection>&{renderSection?:()=>ReactNode|Promise<ReactNode>}){
 if(!renderSection || ['hero','text','text-media','gallery','call-to-action'].includes(props.block.blockType))return <BasicSection {...props}/>
 return renderSection()
}
