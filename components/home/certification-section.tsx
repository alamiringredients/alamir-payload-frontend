import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {CertificationPanel} from '@/components/certifications/certification-panel'
import {certificationEntries, type CertificationData} from '@/lib/certifications/types'
import type {CertificationInterfaceLabels} from '@/lib/certifications/types'

export function CertificationSection({data, locale, labels,section}: SectionContentProps & {data: CertificationData; labels: CertificationInterfaceLabels}) {
  if (!certificationEntries(data, 'sadat-city').length) return null
  return <section className="creds" id="certifications">
    <div className="wrap">
      <div className="creds-head reveal">
        <div>
          <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
          <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
        </div>
        <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
      </div>
      <CertificationPanel data={data} holder="sadat-city" locale={locale} labels={labels}/>
    </div>
  </section>
}
