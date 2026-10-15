import {backendOrigin} from '@/lib/payload/client'
import {presentDownloadsPage} from '@/lib/cms/page-content'
import {getCatalog,getCertificationsPayload} from '@/lib/api/public'
import {getInterface} from '@/lib/payload/interface'
import {DownloadsContent} from '@/components/certifications/downloads-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 if(definition.pageSlug!=='downloads')return null
 const name=definition.name
 const [ui,catalog,certs]=await Promise.all([
  getInterface(),name==='product'?getCatalog():undefined,
  name==='company'?getCertificationsPayload(locale):undefined,
 ])
 return <DownloadsContent content={presentDownloadsPage(source,backendOrigin(),block)} data={certs?.certifications} catalog={catalog} settings={settings} locale={locale} labels={ui.certification[locale]} section={name}/>
}
