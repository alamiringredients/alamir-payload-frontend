'use client'

import {useLocale} from 'next-intl'
import {usePathname} from '@/i18n/navigation'
import {routing} from '@/i18n/routing'
import {localePath} from '@/i18n/navigation'

export function LocaleSwitcher({label}:{label:string}) {
  const locale = useLocale()
  const pathname = usePathname()

  return <nav className="locale-switcher" aria-label={label} data-no-translate>
    {routing.locales.map((item) => <a href={localePath(pathname, item)} hrefLang={item} aria-current={locale === item ? 'page' : undefined} key={item}>{item.toUpperCase()}</a>)}
  </nav>
}
