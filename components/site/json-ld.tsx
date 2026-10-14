import {serializeJsonLd,type SchemaNode} from '@/lib/seo/structured-data'

export function JsonLd({data}:{data:SchemaNode}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/>
}
