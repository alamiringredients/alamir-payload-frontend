'use client'
import {ManagedForm} from '@/components/forms/managed-form'
import type {SiteLocale} from '@/i18n/navigation'
export function ApplicationForm({locale,jobId,jobTitle}:{locale:SiteLocale;jobId?:number;jobTitle?:string}){return <ManagedForm purpose="application" locale={locale} ownerId={jobId} jobTitle={jobTitle}/>}
