import {CertificationPanel} from '@/components/certifications/certification-panel'
import {certificationEntries, type CertificationData} from '@/lib/certifications/types'
import type {SiteLocale} from '@/i18n/navigation'
import type {CertificationInterfaceLabels} from '@/lib/certifications/types'

export function CertificationSection({data, locale, labels}: {data: CertificationData; locale: SiteLocale; labels: CertificationInterfaceLabels}) {
  if (!certificationEntries(data, 'sadat-city').length) return null
  return <section className="creds" id="certifications">
    <div className="wrap">
      <div className="creds-head reveal">
        <div>
          <div className="kicker">Quality &amp; certifications</div>
          <h2>A new facility doesn't inherit certificates.</h2>
        </div>
        <p>The certification programme Alamir Ingredients is running for its own facility in Sadat City.</p>
      </div>
      <CertificationPanel data={data} holder="sadat-city" locale={locale} labels={labels}/>
    </div>
  </section>
}
