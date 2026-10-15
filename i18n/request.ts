import {getRequestConfig} from 'next-intl/server'
import {locale as getRouteLocale} from 'next/root-params'
import {hasLocale} from 'next-intl'
import {routing} from './routing'
import {getInterface} from '@/lib/payload/interface'

export default getRequestConfig(async (request) => {
  const requested = request.locale ?? await getRouteLocale() ?? await request.requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await getInterface()).messages[locale],
  }
})
