import {backendOrigin} from '@/lib/payload/client'
import {presentCareersPage} from '@/lib/cms/page-content'
import {getPublicJobs} from '@/lib/api/public'
import {getInterface} from '@/lib/payload/interface'
import {CareersPageBody} from '@/components/careers/public-content'
import {type SectionArgs} from '../section-utils'

export async function renderSection({block,locale,source,definition}:SectionArgs){
 if(definition.pageSlug!=='careers')return null
 const [ui,jobs]=await Promise.all([getInterface(),definition.name==='jobs'?getPublicJobs():[]])
 return CareersPageBody({content:presentCareersPage(source,backendOrigin(),block),jobs,labels:ui.careers[locale],locale,section:definition.name})
}
