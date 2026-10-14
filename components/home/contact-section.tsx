import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'
import {HomeEnquiryForm} from '@/components/enquiries/home-enquiry-form'
import type {SiteLocale} from '@/i18n/navigation'
import type {CompanyInformation} from '@/lib/cms/types'

function CompanyPhone({phone}:{phone:string}) {
  return phone ? <SmartLink href={`tel:${phone.replace(/[^+\d]/g,'')}`} dir="ltr">{phone}</SmartLink> : null
}



export function ContactSection({locale, company}: {locale: SiteLocale; company: CompanyInformation}){return (<section className="contact" id="contact">
  <div className="wrap">
    <div className="contact-card reveal">
      <div className="contact-media" aria-hidden="true">
        <ContentImage src="/assets/photos/contact-field.webp" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="contact-pitch">
        <span className="contact-badge">Start a conversation</span>
        <h2>Let's <em>get in touch.</em></h2>
        <p>Send us the product, the volume, the target Brix and the destination port. Our export desk comes back with specification, lead time and pricing.</p>
        <SmartLink className="contact-button" href="/contact"><span>Contact the team</span></SmartLink>
      </div>
      <aside className="enquiry-panel" aria-label="Enquiry details">
        <div className="enquiry-index"><span>Export desk</span></div>
        <h3>Start with four details.</h3>
        <HomeEnquiryForm locale={locale}/>
        <div className="enquiry-foot">
          <p>Industrial and export enquiries</p>
          <CompanyPhone phone={company.exportPhone}/>
        </div>
      </aside>
    </div>
  </div>
</section>
)}
