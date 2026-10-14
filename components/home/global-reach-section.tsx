import {InteractiveGlobe} from '@/components/home/interactive-globe'

export function GlobalReachSection({globeLabel}:{globeLabel:string}){return (<section className="reach" id="reach">
  <div className="wrap reach-layout reveal">
    <div className="globe-wrap">
      <InteractiveGlobe label={globeLabel}/>
      <div className="globe-cap">Sadat City · Egypt</div>
    </div>
    <div className="globe-copy">
      <div className="kicker">Global presence</div>
      <h2>Sixty markets, <em>four regions.</em></h2>
      <p>Serving food manufacturers, beverage producers, dairy companies, confectionery makers, sauce producers and industrial processors across domestic and export markets.</p>
      <div className="globe-note">Hover to pause · Drag to explore</div>
      <div className="regions">
        <article className="region"><div className="region-name">Europe</div><div className="region-detail">Ingredient and beverage manufacturers</div></article>
        <article className="region"><div className="region-name">GCC</div><div className="region-detail">Food processing and retail supply</div></article>
        <article className="region"><div className="region-name">North Africa</div><div className="region-detail">Regional manufacturing</div></article>
        <article className="region"><div className="region-name">Far East</div><div className="region-detail">Bulk ingredient supply</div></article>
      </div>
    </div>
  </div>
</section>
)}
