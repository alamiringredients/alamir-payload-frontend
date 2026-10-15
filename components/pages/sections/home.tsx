import {type ReactNode} from 'react'
import {backendOrigin,interfaceLabels} from '@/lib/payload/client'
import {presentHomeSection} from '@/lib/cms/home-section'
import {getNavigationCatalog,getCertificationsPayload} from '@/lib/api/public'
import {HomeHero} from '@/components/home/home-hero'
import {KeyFigures} from '@/components/home/key-figures'
import {StorySection} from '@/components/home/story-section'
import {ProductCollection} from '@/components/home/product-collection'
import {CertificationSection} from '@/components/home/certification-section'
import {SourcingSection} from '@/components/home/sourcing-section'
import {ProcessSection} from '@/components/home/process-section'
import {QualitySection} from '@/components/home/quality-section'
import {GlobalReachSection} from '@/components/home/global-reach-section'
import {ContactSection} from '@/components/home/contact-section'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition,settings}:SectionArgs){
 const {name,pageSlug}=definition
 if(pageSlug==='home'){
  const section=presentHomeSection(block,source.interface as Record<string,unknown>,backendOrigin(),source.mediaRefs as Map<number,Record<string,unknown>>)
  const certifications=name==='certifications'?await getCertificationsPayload(locale):undefined
  const productCatalog=name==='products'?await getNavigationCatalog():undefined
  const globeLabel=name==='reach'?(await interfaceLabels('page.shared',locale)).globeLabel:''
  const renderers:Record<string,()=>ReactNode>={
   hero:()=> <HomeHero section={section} locale={locale}/>,
   figures:()=>KeyFigures({section,locale,groupLogo:settings.groupLogo}),story:()=> <StorySection section={section} locale={locale}/>,
   products:()=><ProductCollection catalog={productCatalog!} locale={locale} section={section}/>,
   certifications:()=><CertificationSection data={certifications!.certifications} locale={locale} labels={certifications!.certificationLabels} section={section}/>,
   sourcing:()=> <SourcingSection section={section} locale={locale}/>,process:()=> <ProcessSection section={section} locale={locale}/>,quality:()=> <QualitySection section={section} locale={locale}/>,reach:()=><GlobalReachSection globeLabel={globeLabel} section={section} locale={locale}/>,
   contact:()=><ContactSection locale={locale} company={settings.company} section={section}/>,
  }
  return renderers[name]?.() ?? null
 }

}
