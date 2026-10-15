import {SectionCopy,type SectionContentProps} from './section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'

export function SourcingSection({section,locale}:SectionContentProps){return (<TwoColumns collapseAt={1050} as="section" columns="58fr 42fr" gap="0" align="stretch" className="origin">
  {section.image && <figure className="origin-media reveal">
        <ContentImage src={section.image} alt={section.text.imageAlt?.[locale] ?? ''} loading="lazy" decoding="async" />
      </figure>}
  <div className="origin-copy reveal">
    <div>
      <div className="kicker">{section.text.kicker?.[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} field="heading"/></h2>
      <p><SectionCopy section={section} locale={locale} field="body"/></p>
      <div className="origin-note"><span>{section.text.note?.[locale] ?? ''}</span><span>{section.text.detail?.[locale] ?? ''}</span></div>
    </div>
  </div>
</TwoColumns>
)}
