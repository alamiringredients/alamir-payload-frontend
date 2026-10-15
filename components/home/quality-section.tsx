import {SectionCopy,type SectionContentProps} from './section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'

export function QualitySection({section,locale}:SectionContentProps){return (<section className="confidence" id="quality">
  <TwoColumns collapseAt={1050} as="div" columns="minmax(0,.9fr) minmax(0,1.1fr)" gap="100px" align="start" className="wrap confidence-grid">
    <div className="reveal">
      <div className="kicker">{section.text.kicker?.[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} field="heading"/></h2>
      <div className="confidence-cta"><SmartLink className="pill" href="/quality">{section.text.qualityLabel?.[locale] ?? ''}</SmartLink></div>
    </div>
    <div className="confidence-copy reveal">
      <p><SectionCopy section={section} locale={locale} field="body"/></p>
      <div className="proof-list">
        <div className="proof"><strong>{section.text.proofTitle?.[locale] ?? ''}</strong><span>{section.text.proofDescription?.[locale] ?? ''}</span></div>
        <div className="proof"><strong>{section.text.secondProofTitle?.[locale] ?? ''}</strong><span>{section.text.secondProofDescription?.[locale] ?? ''}</span></div>
      </div>
    </div>
  </TwoColumns>
  <div className="wrap">
    {section.image && <figure className="process-image reveal">
        <ContentImage src={section.image} alt={section.text.imageAlt?.[locale] ?? ''} />
      </figure>}
  </div>
</section>
)}
