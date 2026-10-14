import {InlineContent} from '@/components/editor/inline-content'
import {sectionText} from '@/lib/cms/section-text'
import type {HomeSectionContent} from '@/lib/cms/types'
import {navigationHref,navigationLabel} from '@/lib/cms/navigation'
import type {NavigationItem} from '@/lib/cms/types'
import type {CompanyInformation} from '@/lib/cms/types'
import type {SiteLocale} from '@/i18n/navigation'
import {ContentImage} from './content-image'
import {SmartLink} from './smart-link'
import {SocialLinks} from './social-links'

function FooterCompanyContact({company,locale}:{company:CompanyInformation;locale:SiteLocale}) {
  return <><ul>{[company.exportPhone,company.secondaryPhone].filter(Boolean).map(phone=><li key={phone}><SmartLink href={`tel:${phone.replace(/[^+\d]/g,'')}`} dir="ltr">{phone}</SmartLink></li>)}<li style={{whiteSpace:'pre-line'}}>{company.address[locale]}</li></ul><SocialLinks urls={company.socialLinks} locale={locale}/></>
}

export function SiteFooter({company,locale,menus,section}:{section:HomeSectionContent;company:CompanyInformation;locale:SiteLocale;menus?:{explore:NavigationItem[];company:NavigationItem[];legal:NavigationItem[]}}){
  const copy = (source: string) => sectionText(section, source, locale)
  const description = section.richTexts?.find(field => field.source === 'Tomato, fruit purees and concentrates, manufactured in Sadat City, Egypt.')
  const links=(items:NavigationItem[])=>items.map(item=>{const href=navigationHref(item);return href?<li key={item.id}><SmartLink href={href}>{navigationLabel(item,locale)}</SmartLink></li>:null})
  return <footer className="footer">
    <div className="wrap">
      <div className="footer-grid">
        <div>
          <SmartLink className="brand" href="/"><ContentImage src="/assets/logo-full.svg" alt={copy("Alamir Ingredients")}/></SmartLink>
          {description && <p><InlineContent document={description.values[locale]}/></p>}
          <SmartLink className="parent-card" href="https://www.alamireg.com/" target="_blank" rel="noopener">
            <span className="pc-label">{copy("Part of")}</span>
            <span className="pc-logo"><ContentImage src="/assets/logo.webp" alt={copy("Alamir Group")} loading="lazy" decoding="async"/></span>
            <span className="pc-go">{copy("Visit site")} <span className="arrow">→</span></span>
          </SmartLink>
        </div>
        <div>
          <div className="footer-title">{copy("Explore")}</div>
          <ul>{links(menus?.explore??[])}</ul>
        </div>
        <div>
          <div className="footer-title">{copy("Company")}</div>
          <ul>{links(menus?.company??[])}</ul>
        </div>
        <div>
          <div className="footer-title">{copy("Export team")}</div>
          <FooterCompanyContact company={company} locale={locale}/>
        </div>
      </div>
      <div className="footer-bottom"><span>{copy("(c) 2026 Alamir Ingredients")}</span><span>{copy("From Egyptian fields to global formulas.")}</span><span className="footer-legal">{(menus?.legal??[]).map(item=>{const href=navigationHref(item);return href?<SmartLink href={href} key={item.id}>{navigationLabel(item,locale)}</SmartLink>:null})}</span></div>
    </div>
  </footer>
}
