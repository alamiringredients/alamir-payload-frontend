import type {ReactNode} from 'react'

export function FormFieldError({id,children}:{id:string;children:ReactNode}){
  return <small className="form-field-error" id={id} role="alert">{children}</small>
}
