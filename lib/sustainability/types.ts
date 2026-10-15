import type {ContentDocument} from '@/lib/editor/document'
import type {LocalizedValue,LocalizedDocument} from '@/lib/cms/types'
import type {Localized} from '@/lib/news/types'
export type SustainabilityVersion={kicker:string;title:ContentDocument;summary:string;cardTitle:ContentDocument;cardSummary:string;badge:string;railIntro:string;note:string;gallery:{src:string;alt:string;caption:string}[];body:ContentDocument;seoTitle:string;seoDescription:string}
export type SustainabilityContent={date:string;updatedDate:string;sortOrder:number;featured:boolean;goalIds:number[];primaryGoal:number;relatedArticleIds:number[];locales:Localized<SustainabilityVersion>}
export type SustainabilityRecord={id:number;slug:string;revision:number;content:SustainabilityContent;published:Partial<Localized<SustainabilityVersion>>}
export type SustainabilityGoal={id:number;color:string;image:string;name:LocalizedValue;alt:LocalizedValue}
export type SustainabilityPageContent={
  hero:{enabled:boolean;title:LocalizedDocument;description:LocalizedDocument}
  content:{enabled:boolean;kicker:LocalizedValue;title:LocalizedDocument}
  contact:{enabled:boolean;kicker:LocalizedValue;title:LocalizedDocument;description:LocalizedDocument;quoteLabel:LocalizedValue;qualityLabel:LocalizedValue}
  heroIcons:string[];sectionVisibility:Record<'related',boolean>;relatedKicker:LocalizedValue;relatedTitle:Localized<ContentDocument>;goals:SustainabilityGoal[];seo:{title:LocalizedValue;description:LocalizedValue}
}
