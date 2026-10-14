import {HeroMedia} from './hero-media'
import {SmartLink} from '@/components/site/smart-link'

export function HomeHero({poster, videos}: {poster?: string; videos?: string[]} = {}){return (<section className="hero" id="top">
  <HeroMedia poster={poster} clips={videos} />
  <div className="wrap hero-content">
    <h1 className="hero-title">From our fields to <em>your formula.</em></h1>
    <div className="hero-foot">
      <div>
        <p>Tomato and fruit ingredients produced in a new-generation aseptic facility for food and beverage manufacturers around the world.</p>
        <div className="hero-ctas">
          <SmartLink className="hero-btn primary" href="/contact">Get in touch</SmartLink>
          <SmartLink className="hero-btn ghost" href="/products">Discover our products</SmartLink>
        </div>
      </div>
      <div className="hero-location">Sadat City, Egypt &nbsp; / &nbsp; CFT Italian technology</div>
    </div>
  </div>
</section>
)}
