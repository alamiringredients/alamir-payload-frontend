import {SectionCopy,type SectionContentProps} from './section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {InteractiveGlobe} from '@/components/home/interactive-globe'

export function GlobalReachSection({globeLabel,section,locale}:SectionContentProps & {globeLabel:string}){return (<section className="reach" id="reach">
  <TwoColumns collapseAt={1050} as="div" columns="minmax(360px,.88fr) minmax(0,1.12fr)" gap="clamp(55px,7vw,110px)" align="center" className="wrap reach-layout reveal">
    <div className="globe-wrap">
      <InteractiveGlobe label={globeLabel}/>
      <div className="globe-cap">{section.text.caption?.[locale] ?? ''}</div>
    </div>
    <div className="globe-copy">
      <div className="kicker">{section.text.kicker?.[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} field="heading"/></h2>
      <p><SectionCopy section={section} locale={locale} field="body"/></p>
      <div className="globe-note">{section.text.instructions?.[locale] ?? ''}</div>
      <div className="regions">
        <article className="region"><div className="region-name">{section.text.region?.[locale] ?? ''}</div><div className="region-detail">{section.text.regionDetail?.[locale] ?? ''}</div></article>
        <article className="region"><div className="region-name">{section.text.secondRegion?.[locale] ?? ''}</div><div className="region-detail">{section.text.secondRegionDetail?.[locale] ?? ''}</div></article>
        <article className="region"><div className="region-name">{section.text.thirdRegion?.[locale] ?? ''}</div><div className="region-detail">{section.text.thirdRegionDetail?.[locale] ?? ''}</div></article>
        <article className="region"><div className="region-name">{section.text.fourthRegion?.[locale] ?? ''}</div><div className="region-detail">{section.text.fourthRegionDetail?.[locale] ?? ''}</div></article>
      </div>
    </div>
  </TwoColumns>
</section>
)}
