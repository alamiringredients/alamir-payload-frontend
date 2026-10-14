'use client'

import {useState, type AnchorHTMLAttributes, type ReactNode} from 'react'
import {Link} from '@/i18n/navigation'

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children?: ReactNode
}

export function SmartLink({href, children, onMouseEnter, onFocus, ...props}: SmartLinkProps) {
  const [prefetch, setPrefetch] = useState(false)

  if (href === 'sitemap.xml' || href === '/sitemap.xml') {
    return <a href="/sitemap.xml" onMouseEnter={onMouseEnter} onFocus={onFocus} {...props}>{children}</a>
  }
  if (/^(?:[a-z]+:|\/\/|#)/i.test(href) || 'download' in props) {
    return <a href={href} onMouseEnter={onMouseEnter} onFocus={onFocus} {...props}>{children}</a>
  }

  return <Link
    href={href}
    prefetch={prefetch}
    onMouseEnter={(event) => { setPrefetch(true); onMouseEnter?.(event) }}
    onFocus={(event) => { setPrefetch(true); onFocus?.(event) }}
    {...props}
  >{children}</Link>
}
