import {ContentRenderer} from '@/components/editor/content-renderer'
import {EditorialPageHero} from '@/components/editor/editorial-page-hero'
import type {CertificationData,CertificationInterfaceLabels} from '@/lib/certifications/types'
import type {QualityPageContent} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
import {qualityBlockRenderer} from './quality-blocks'

export function QualityPageBody({content,data,locale,labels,groupLogo}:{content:QualityPageContent;data:CertificationData;locale:SiteLocale;labels:CertificationInterfaceLabels;groupLogo:string}){
 return <main id="main">
  {content.sectionVisibility.hero&&<EditorialPageHero kicker={content.hero.kicker[locale]} title={content.hero.title[locale]} description={content.hero.description[locale]} image={content.hero.image} imageAlt={content.hero.alt[locale]}/>}
  {content.sectionVisibility.body&&<ContentRenderer document={content.body[locale]} renderBlock={qualityBlockRenderer(data,locale,labels,groupLogo)}/>}
 </main>
}
