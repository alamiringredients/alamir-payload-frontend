import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
import {SiteIcon} from '@/components/site/site-icon'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'

export function StorySection({section,locale}:SectionContentProps){return (<section className="intro" id="story">
  <div className="wrap">
    <div className="intro-head reveal">
      <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
    </div>
    <div className="collage reveal">
      {section.assets[0]?.value && <figure className="collage-main">
        <ContentImage src={section.assets[0].value} alt={section.texts[6]?.values[locale] ?? ''} />
      </figure>}
      <div className="collage-copy">
        <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
        <SmartLink href="/about">{section.texts[5]?.values[locale] ?? ''}<span className="arrow"><SiteIcon name="arrow-right"/></span></SmartLink>
      </div>
    </div>
  </div>
</section>
)}
