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

export function SiteFooter({company,locale,menus}:{company:CompanyInformation;locale:SiteLocale;menus?:{explore:NavigationItem[];company:NavigationItem[];legal:NavigationItem[]}}){
  const links=(items:NavigationItem[])=>items.map(item=>{const href=navigationHref(item);return href?<li key={item.id}><SmartLink href={href}>{navigationLabel(item,locale)}</SmartLink></li>:null})
  return <footer className="footer">
    <div className="wrap">
      <div className="footer-grid">
        <div>
          <SmartLink className="brand" href="/"><ContentImage src="/assets/logo-full.svg" alt="Alamir Ingredients"/></SmartLink>
          <p>Tomato, fruit purees and concentrates, manufactured in Sadat City, Egypt.</p>
          <SmartLink className="parent-card" href="https://www.alamireg.com/" target="_blank" rel="noopener">
            <span className="pc-label">Part of</span>
            <span className="pc-logo"><ContentImage src="/assets/logo.webp" alt="Alamir Group" loading="lazy" decoding="async"/></span>
            <span className="pc-go">Visit site <span className="arrow">→</span></span>
          </SmartLink>
        </div>
        <div>
          <div className="footer-title">Explore</div>
          <ul>{links(menus?.explore??[])}</ul>
        </div>
        <div>
          <div className="footer-title">Company</div>
          <ul>{links(menus?.company??[])}</ul>
        </div>
        <div>
          <div className="footer-title">Export team</div>
          <FooterCompanyContact company={company} locale={locale}/>
        </div>
      </div>
      <div className="footer-bottom"><span>(c) 2026 Alamir Ingredients</span><span>From Egyptian fields to global formulas.</span><span className="footer-legal">{(menus?.legal??[]).map(item=>{const href=navigationHref(item);return href?<SmartLink href={href} key={item.id}>{navigationLabel(item,locale)}</SmartLink>:null})}</span></div>
    </div>
  </footer>
}
