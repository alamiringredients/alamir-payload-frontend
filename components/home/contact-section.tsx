import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'
import {HomeEnquiryForm} from '@/components/enquiries/home-enquiry-form'
import type {CompanyInformation} from '@/lib/cms/types'

function CompanyPhone({phone}:{phone:string}) {
  return phone ? <SmartLink href={`tel:${phone.replace(/[^+\d]/g,'')}`} dir="ltr">{phone}</SmartLink> : null
}



export function ContactSection({locale, company,section}: SectionContentProps & {company: CompanyInformation}){return (<section className="contact" id="contact">
  <div className="wrap">
    <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1fr) minmax(340px,.72fr)" gap="clamp(26px,3vw,54px)" align="center" className="contact-card reveal">
      <div className="contact-media" aria-hidden="true">
        {section.assets[0]?.value && <ContentImage src={section.assets[0].value} alt="" loading="lazy" decoding="async" />}
      </div>
      <div className="contact-pitch">
        <span className="contact-badge">{section.texts[0]?.values[locale] ?? ''}</span>
        <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
        <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
        <SmartLink className="contact-button" href="/contact"><span>{section.texts[1]?.values[locale] ?? ''}</span></SmartLink>
      </div>
      <aside className="enquiry-panel" aria-label={section.texts[3]?.values[locale] ?? ''}>
        <div className="enquiry-index"><span>{section.texts[2]?.values[locale] ?? ''}</span></div>
        <h3><SectionCopy section={section} locale={locale} richIndex={2}/></h3>
        <HomeEnquiryForm locale={locale}/>
        <div className="enquiry-foot">
          <p><SectionCopy section={section} locale={locale} richIndex={3}/></p>
          <CompanyPhone phone={company.exportPhone}/>
        </div>
      </aside>
    </TwoColumns>
  </div>
</section>
)}
