import {SectionCopy,type SectionContentProps} from './section-copy'
import {TwoColumns} from '@/components/layout/two-columns'
import {HeroMedia} from './hero-media'
import {SmartLink} from '@/components/site/smart-link'

export function HomeHero({section,locale}: SectionContentProps){return (<section className="hero" id="top">
  <HeroMedia poster={section.image} clips={section.videos?.filter(Boolean)} />
  <div className="wrap hero-content">
    <h1 className="hero-title"><SectionCopy section={section} locale={locale} field="heading"/></h1>
    <TwoColumns collapseAt={1050} as="div" columns="minmax(0,1fr) minmax(300px,480px)" gap="60px" align="end" className="hero-foot">
      <div>
        <p><SectionCopy section={section} locale={locale} field="body"/></p>
        <div className="hero-ctas">
          <SmartLink className="hero-btn primary" href="/contact">{section.text.contactLabel?.[locale] ?? ''}</SmartLink>
          <SmartLink className="hero-btn ghost" href="/products">{section.text.productsLabel?.[locale] ?? ''}</SmartLink>
        </div>
      </div>
      <div className="hero-location">{section.text.location?.[locale] ?? ''}</div>
    </TwoColumns>
  </div>
</section>
)}
