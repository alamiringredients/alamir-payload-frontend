import {revalidateTag} from 'next/cache'
import {publicContentResources} from '@/lib/payload/resources'

export async function POST(request: Request) {
  if (!process.env.CMS_REVALIDATION_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CMS_REVALIDATION_SECRET}`) return new Response(null, {status: 401})
  // Older publishers send no body and still need a complete refresh.
  const body = await request.text()
  if (!body) revalidateTag('payload-content', {expire: 0})
  else {
    let resources: unknown
    try { resources = JSON.parse(body).resources } catch { return new Response(null, {status: 400}) }
    const allowed: readonly string[] = [...publicContentResources.collections, ...publicContentResources.globals.map(slug => `globals/${slug}`)]
    if (!Array.isArray(resources) || resources.some(resource => typeof resource !== 'string' || !allowed.includes(resource))) return new Response(null, {status: 400})
    for (const resource of new Set(resources)) revalidateTag(`public-content:${resource}`, {expire: 0})
  }
  return Response.json({revalidated: true})
}
