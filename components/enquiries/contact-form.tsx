'use client'
import {useFormDefinition} from '@/components/forms/forms-provider'
import {ManagedForm} from '@/components/forms/managed-form'
import type {SiteLocale} from '@/i18n/navigation'
export function ContactForm({locale,salesWhatsapp}:{locale:SiteLocale;salesWhatsapp:string}){const labels=useFormDefinition('contact').definition?.ui??{};return <ManagedForm purpose="contact" locale={locale} actions={salesWhatsapp?<a className="btn ghost" href={salesWhatsapp} target="_blank" rel="noopener">{labels.whatsappSales}</a>:null}/>}
