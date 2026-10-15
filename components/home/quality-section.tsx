import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'

export function QualitySection(){return (<section className="confidence" id="quality">
  <TwoColumns collapseAt={1050} as="div" columns="minmax(0,.9fr) minmax(0,1.1fr)" gap="100px" align="start" className="wrap confidence-grid">
    <div className="reveal">
      <div className="kicker">Confidence at scale</div>
      <h2>Made for the demands of industry.</h2>
      <div className="confidence-cta"><SmartLink className="pill" href="/quality">Quality &amp; capability</SmartLink></div>
    </div>
    <div className="confidence-copy reveal">
      <p>Industrial buyers need more than a good harvest. They need specification-led output, repeatability, commercial responsiveness and a supply partner that understands international trade.</p>
      <div className="proof-list">
        <div className="proof"><strong>240 T</strong><span>Daily tropical fruit processing capacity.</span></div>
        <div className="proof"><strong>CFT</strong><span>Modern Italian processing architecture.</span></div>
      </div>
    </div>
  </TwoColumns>
  <div className="wrap">
    <figure className="process-image reveal">
      <ContentImage src="/assets/photos/magnific_interior-of-a-modern-food_swLaKaNl8e.webp" alt="Modern stainless steel food processing line" />
    </figure>
  </div>
</section>
)}
