import {type ReactNode} from 'react'
import {sectionContent} from '@/lib/payload/client'
import type {HomeCmsData} from '@/lib/cms/types'
import {getHomeCatalog,getHomepagePayload} from '@/lib/api/public'
import {renderManagedSection} from '@/lib/cms/render'
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
  const content=sectionContent<HomeCmsData>(source,block),section=content.sections.find(section=>section.key===name)!
  const home=await getHomepagePayload(locale)
  const productCatalog=name==='products'?await getHomeCatalog(locale):undefined
  const renderers:Record<string,()=>ReactNode>={
   hero:()=>HomeHero({poster:section.assets.find(asset=>asset.source==='/assets/hero-poster.webp')?.value,videos:section.videos?.filter(Boolean)}),
   figures:()=>KeyFigures({section,locale,groupLogo:settings.groupLogo}),story:StorySection,
   products:()=>ProductCollection({catalog:productCatalog!,locale}),
   certifications:()=>CertificationSection({data:home.certifications,locale,labels:home.certificationLabels}),
   sourcing:SourcingSection,process:ProcessSection,quality:QualitySection,reach:GlobalReachSection,
   contact:()=>ContactSection({locale,company:settings.company}),
  }
  return name==='figures'?renderers[name]():renderManagedSection(renderers[name](),section,locale)
 }

}
