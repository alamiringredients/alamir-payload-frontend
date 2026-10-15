import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'

export function QualitySection({section,locale}:SectionContentProps){return (<section className="confidence" id="quality">
  <TwoColumns collapseAt={1050} as="div" columns="minmax(0,.9fr) minmax(0,1.1fr)" gap="100px" align="start" className="wrap confidence-grid">
    <div className="reveal">
      <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
      <div className="confidence-cta"><SmartLink className="pill" href="/quality">{section.texts[2]?.values[locale] ?? ''}</SmartLink></div>
    </div>
    <div className="confidence-copy reveal">
      <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
      <div className="proof-list">
        <div className="proof"><strong>{section.texts[4]?.values[locale] ?? ''}</strong><span>{section.texts[5]?.values[locale] ?? ''}</span></div>
        <div className="proof"><strong>{section.texts[6]?.values[locale] ?? ''}</strong><span>{section.texts[7]?.values[locale] ?? ''}</span></div>
      </div>
    </div>
  </TwoColumns>
  <div className="wrap">
    {section.assets[0]?.value && <figure className="process-image reveal">
        <ContentImage src={section.assets[0].value} alt={section.texts[8]?.values[locale] ?? ''} />
      </figure>}
  </div>
</section>
)}
