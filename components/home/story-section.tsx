import {SectionCopy,type SectionContentProps} from './section-copy'
import {SiteIcon} from '@/components/site/site-icon'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'

export function StorySection({section,locale}:SectionContentProps){return (<section className="intro" id="story">
  <div className="wrap">
    <div className="intro-head reveal">
      <div className="kicker">{section.text.kicker?.[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} field="heading"/></h2>
    </div>
    <div className="collage reveal">
      {section.image && <figure className="collage-main">
        <ContentImage src={section.image} alt={section.text.imageAlt?.[locale] ?? ''} />
      </figure>}
      <div className="collage-copy">
        <p><SectionCopy section={section} locale={locale} field="body"/></p>
        <SmartLink href="/about">{section.text.aboutLabel?.[locale] ?? ''}<span className="arrow"><SiteIcon name="arrow-right"/></span></SmartLink>
      </div>
    </div>
  </div>
</section>
)}
