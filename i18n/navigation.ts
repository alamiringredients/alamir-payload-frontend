import {createNavigation} from 'next-intl/navigation'
import {routing} from './routing'

const navigation=createNavigation(routing)

export const {Link, usePathname, getPathname} = navigation
export const locales=routing.locales
export type SiteLocale=(typeof routing.locales)[number]
export const localePath=(href:string,locale:SiteLocale)=>navigation.getPathname({href,locale})
