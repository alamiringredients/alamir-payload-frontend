import 'server-only'
import {countries} from './countries'
import {getInterface} from './payload/interface'
import type {SiteLocale} from '@/i18n/navigation'

export async function getCountryOptions(locale: SiteLocale) {
  const labels=(await getInterface()).countries
  const dialCodes=new Map(countries.map(country=>[country.name,country.dialCode]))
  return labels.en.flatMap((country,index)=>{
    const dialCode=dialCodes.get(country.value)
    const name=labels[locale][index]?.label
    return dialCode&&name?[{name,dialCode}]:[]
  })
}
