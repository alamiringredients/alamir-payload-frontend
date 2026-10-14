import '@/styles/pages/article.css'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {hasLocale} from 'next-intl'
import {EventsRoute} from '@/components/events/events-route'
import {getPublicEvent} from '@/lib/api/public'
import {localePath,locales} from '@/i18n/navigation'
type Props={params:Promise<{locale:string;slug:string}>}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {locale,slug}=await params;if(!hasLocale(locales,locale))return {};const event=await getPublicEvent(locale,slug);if(!event)return {};const seo=event.content.seo;return {title:seo.title[locale],description:seo.description[locale],openGraph:{title:seo.socialTitle[locale],description:seo.socialDescription[locale],images:seo.socialImage?[seo.socialImage]:[]},alternates:{canonical:localePath(`/events/${slug}`,locale)}}}
export default async function Page({params}:Props){const {locale,slug}=await params;if(!hasLocale(locales,locale))notFound();return <EventsRoute locale={locale} slug={slug}/>}

import {getPublicEvents} from '@/lib/api/public'
import type {SiteLocale} from '@/i18n/navigation'
export async function generateStaticParams({params}:{params:{locale:string}}){return (await getPublicEvents(params.locale as SiteLocale)).map(({slug})=>({slug}))}
