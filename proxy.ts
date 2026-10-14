import createMiddleware from 'next-intl/middleware'
import type {NextRequest} from 'next/server'
import {routing} from './i18n/routing'
import {fontStylesheets} from './lib/site-font-delivery'

const handleI18n = createMiddleware(routing)
export function proxy(request:NextRequest){
  const response=handleI18n(request)
  const locale=new URL(response.headers.get('x-middleware-rewrite')??request.url).pathname.split('/')[1]
  const stylesheet=fontStylesheets[locale==='ar'?'arabic':'latin']
  response.headers.append('Link',`<${stylesheet}>; rel=preload; as=style`)
  return response
}

export const config = {
  matcher: ['/((?!api|storage|_next|_vercel|.*\\..*).*)'],
}
