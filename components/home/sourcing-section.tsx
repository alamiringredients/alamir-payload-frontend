import {TwoColumns} from '@/components/layout/two-columns'
import {ContentImage} from '@/components/site/content-image'

export function SourcingSection(){return (<TwoColumns collapseAt={1050} as="section" columns="58fr 42fr" gap="0" align="stretch" className="origin">
  <figure className="origin-media reveal">
    <ContentImage src="/assets/photos/origin-farmer-a.webp" alt="An Egyptian grower standing among the tomato plants at sunrise, holding a crate of freshly picked fruit" loading="lazy" decoding="async" />
  </figure>
  <div className="origin-copy reveal">
    <div>
      <div className="kicker">Close to the crop</div>
      <h2>Freshness begins before the factory.</h2>
      <p>Proximity to Egypt's productive growing regions helps us protect the qualities that matter: colour, flavour, texture and crop character. That field-first discipline continues through every stage of processing.</p>
      <div className="origin-note"><span>Egyptian agriculture</span><span>Controlled sourcing</span></div>
    </div>
  </div>
</TwoColumns>
)}
