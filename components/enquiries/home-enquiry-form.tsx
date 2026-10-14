'use client'
import {ManagedForm} from '@/components/forms/managed-form'
import type {SiteLocale} from '@/i18n/navigation'
export function HomeEnquiryForm({locale}:{locale:SiteLocale}){return <ManagedForm purpose="home" locale={locale}/>}
