import type definitions from '@/lib/payload/sections.json'
import type {CmsPage,PageBlock} from '@/lib/payload/client'
import type {WebsiteSettings} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
export type PageContext={query?:string;tag?:string}
export type SectionArgs={block:PageBlock;locale:SiteLocale;source:CmsPage;definition:(typeof definitions)[number];settings:WebsiteSettings;context:PageContext}
