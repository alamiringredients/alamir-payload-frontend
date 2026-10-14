import type {InputHTMLAttributes,ReactNode} from 'react'
import {SmartLink} from '@/components/site/smart-link'
import {FormFieldError} from './form-field-error'

export function FormConsent({id,label,privacyLabel,privacyHref='/privacy',error,errorId,...input}:{id:string;label:ReactNode;privacyLabel:ReactNode;privacyHref?:string;error?:ReactNode;errorId?:string}&Omit<InputHTMLAttributes<HTMLInputElement>,'id'|'type'>){
  return <div className="consent-row"><input {...input} id={id} type="checkbox" aria-describedby={error?errorId:undefined}/><label htmlFor={id}>{label} <SmartLink href={privacyHref}>{privacyLabel}</SmartLink>.</label>{error&&errorId&&<FormFieldError id={errorId}>{error}</FormFieldError>}</div>
}
