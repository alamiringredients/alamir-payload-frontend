'use client'
import {useFormDefinition} from '@/components/forms/forms-provider'
import {ManagedForm} from '@/components/forms/managed-form'
import type {SiteLocale} from '@/i18n/navigation'
export function QuoteForm({locale}:{locale:SiteLocale}){const labels=useFormDefinition('quote').definition?.ui??{};return <ManagedForm purpose="quote" locale={locale} actions={<button className="btn ghost" type="button" data-quote-close>{labels.cancel}</button>}/>}
