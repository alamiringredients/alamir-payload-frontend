import 'server-only'
import {countries} from './countries'
import {translateContent} from './content-translations'
import type {SiteLocale} from '@/i18n/navigation'

export function getCountryOptions(locale: SiteLocale) {
  return countries.map(country => ({...country, name: translateContent(locale, country.name)}))
}
