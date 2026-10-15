import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'

export function SourcingSection({section,locale}:SectionContentProps){return (<TwoColumns collapseAt={1050} as="section" columns="58fr 42fr" gap="0" align="stretch" className="origin">
  {section.assets[0]?.value && <figure className="origin-media reveal">
        <ContentImage src={section.assets[0].value} alt={section.texts[5]?.values[locale] ?? ''} loading="lazy" decoding="async" />
      </figure>}
  <div className="origin-copy reveal">
    <div>
      <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
      <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
      <div className="origin-note"><span>{section.texts[3]?.values[locale] ?? ''}</span><span>{section.texts[4]?.values[locale] ?? ''}</span></div>
    </div>
  </div>
</TwoColumns>
)}
