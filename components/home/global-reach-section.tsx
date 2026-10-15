import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {InteractiveGlobe} from '@/components/home/interactive-globe'

export function GlobalReachSection({globeLabel,section,locale}:SectionContentProps & {globeLabel:string}){return (<section className="reach" id="reach">
  <TwoColumns collapseAt={1050} as="div" columns="minmax(360px,.88fr) minmax(0,1.12fr)" gap="clamp(55px,7vw,110px)" align="center" className="wrap reach-layout reveal">
    <div className="globe-wrap">
      <InteractiveGlobe label={globeLabel}/>
      <div className="globe-cap">{section.texts[0]?.values[locale] ?? ''}</div>
    </div>
    <div className="globe-copy">
      <div className="kicker">{section.texts[1]?.values[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
      <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
      <div className="globe-note">{section.texts[5]?.values[locale] ?? ''}</div>
      <div className="regions">
        <article className="region"><div className="region-name">{section.texts[6]?.values[locale] ?? ''}</div><div className="region-detail">{section.texts[7]?.values[locale] ?? ''}</div></article>
        <article className="region"><div className="region-name">{section.texts[8]?.values[locale] ?? ''}</div><div className="region-detail">{section.texts[9]?.values[locale] ?? ''}</div></article>
        <article className="region"><div className="region-name">{section.texts[10]?.values[locale] ?? ''}</div><div className="region-detail">{section.texts[11]?.values[locale] ?? ''}</div></article>
        <article className="region"><div className="region-name">{section.texts[12]?.values[locale] ?? ''}</div><div className="region-detail">{section.texts[13]?.values[locale] ?? ''}</div></article>
      </div>
    </div>
  </TwoColumns>
</section>
)}
