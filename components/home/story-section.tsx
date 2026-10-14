import {SiteIcon} from '@/components/site/site-icon'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'

export function StorySection(){return (<section className="intro" id="story">
  <div className="wrap">
    <div className="intro-head reveal">
      <div className="kicker">Our story</div>
      <h2>Ingredients shaped by <em>origin.</em> Engineered by precision.</h2>
    </div>
    <div className="collage reveal">
      <figure className="collage-main">
        <ContentImage src="/assets/photos/magnific_exterior-of-a-large-moder_NZ917Pn6D9.webp" alt="Alamir Ingredients manufacturing facility in Sadat City" />
      </figure>
      <div className="collage-copy">
        <p>Alamir Ingredients brings Al Amir Group's agricultural experience into a purpose-built manufacturing platform. From raw crop selection to aseptic filling, every stage is designed around consistency, traceability and dependable export supply.</p>
        <SmartLink href="/about">More about us <span className="arrow"><SiteIcon name="arrow-right"/></span></SmartLink>
      </div>
    </div>
  </div>
</section>
)}
