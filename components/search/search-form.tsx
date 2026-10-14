'use client'
import {useFormDefinition} from '@/components/forms/forms-provider'
export function SearchForm({query,action}:{query:string;action:string}){
 const {definition}=useFormDefinition('search')
 if(!definition)return null
 return <form className="search-bar reveal" role="search" action={action} method="get">{definition.fields.filter(field=>field.visible!==false).map(field=><span key={field.name} style={{display:'contents'}}><label className="sr-only" htmlFor={field.name}>{field.label}</label><input id={field.name} name={field.name} type="search" defaultValue={field.name==='q'?query:String(field.defaultValue??'')} placeholder={field.placeholder} required={field.required} autoComplete="off"/></span>)}<button className="btn" type="submit">{definition.submitButtonLabel}</button></form>
}
