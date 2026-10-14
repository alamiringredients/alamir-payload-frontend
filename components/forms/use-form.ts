'use client'
import {useRef,useState} from 'react'
import type {FormResult} from '@/lib/api/forms'

// Frontend state only. Payload performs the authoritative validation on submission.
export function useForm<T extends Record<string,unknown>>(options:{initialValues:T;submitter:(args:{formData:FormData;values:T})=>Promise<FormResult>}) {
  const [values,setValues]=useState(options.initialValues)
  const [submitting,setSubmitting]=useState(false)
  const [lastSubmission,setLastSubmission]=useState<FormResult|null>(null)
  const pending=useRef(false)
  const errors=lastSubmission?.errors??{}
  return {
    values,submitting,lastSubmission,valid:lastSubmission?.valid??true,
    errors:{has:(name:string)=>Boolean(errors[name]?.length),first:(name:string)=>errors[name]?.[0],flatten:()=>errors},
    setValue:(name:string,value:unknown)=>setValues(current=>({...current,[name]:value})),
    reset:(value:T)=>{setValues(value);setLastSubmission(null)},
    async submit() {
      if(pending.current)return lastSubmission??{ok:false,valid:false,status:409,values,errors:{}}
      pending.current=true
      setSubmitting(true)
      try {
        const formData=new FormData()
        for(const [key,value] of Object.entries(values))if(value!==undefined)formData.set(key,value instanceof File?value:String(value))
        const result=await options.submitter({formData,values})
        setLastSubmission(result)
        return result
      } finally {pending.current=false;setSubmitting(false)}
    },
  }
}
