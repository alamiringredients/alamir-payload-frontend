import type {ContentDocument} from '@/lib/editor/document'
import type {LocalizedValue,LocalizedDocument,HomeSeoContent,PageHeroContent,EditorialPageContent} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
export type JobLocale={heading:ContentDocument;title:string;summary:string;department:string;location:string;contract:string;experience:string;reportsTo:string;closing:string;hero:string;heroAlt:string;body:ContentDocument}
export type JobContent=Record<SiteLocale,JobLocale>
export type JobRecord={id:number;slug:string;code:string;status:'draft'|'open'|'closed';content:JobContent}
export type PageHero=PageHeroContent
export type AboutContent=EditorialPageContent
export type CareersContent={sectionVisibility:Record<'hero'|'jobs'|'apply',boolean>;hero:PageHero;jobsTitle:LocalizedDocument;jobsIntro:LocalizedDocument;jobsKicker:LocalizedValue;empty:LocalizedValue;applyTitle:LocalizedDocument;applyIntro:LocalizedDocument;applyKicker:LocalizedValue;seo:HomeSeoContent}
