import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {HeroMedia} from './hero-media'
import {SmartLink} from '@/components/site/smart-link'

export function HomeHero({section,locale}: SectionContentProps){return (<section className="hero" id="top">
  <HeroMedia poster={section.assets[0]?.value} clips={section.videos?.filter(Boolean)} />
  <div className="wrap hero-content">
    <h1 className="hero-title"><SectionCopy section={section} locale={locale} richIndex={0}/></h1>
    <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1fr) minmax(300px,480px)" gap="60px" align="end" className="hero-foot">
      <div>
        <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
        <div className="hero-ctas">
          <SmartLink className="hero-btn primary" href="/contact">{section.texts[3]?.values[locale] ?? ''}</SmartLink>
          <SmartLink className="hero-btn ghost" href="/products">{section.texts[4]?.values[locale] ?? ''}</SmartLink>
        </div>
      </div>
      <div className="hero-location">{section.texts[5]?.values[locale] ?? ''}</div>
    </TwoColumns>
  </div>
</section>
)}
