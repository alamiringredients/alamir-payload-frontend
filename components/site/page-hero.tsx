import type {ReactNode} from 'react'
import {HeroMedia} from './hero-media'

const criticalCss=`
.page-hero{position:relative;padding:0;background:var(--navy);color:var(--white)}
.page-hero.page-hero-split{overflow:hidden;padding:0;isolation:isolate}
.page-hero.page-hero-split::before{content:"";position:absolute;z-index:1;inset:auto -8% -62% 26%;height:82%;background:radial-gradient(ellipse at center,rgba(242,177,157,.17),transparent 62%);pointer-events:none}
.page-hero .ph-media{position:absolute;z-index:0;top:0;right:0;bottom:0;width:50%;margin:0;overflow:hidden}
.page-hero .ph-media img{display:block;width:100%;height:100%;object-fit:cover;-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 24%);mask-image:linear-gradient(90deg,transparent 0%,#000 24%)}
.page-hero .ph-media::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--navy) 0%,rgba(19,40,64,.55) 22%,rgba(19,40,64,0) 48%),linear-gradient(0deg,rgba(19,40,64,.55),transparent 42%),linear-gradient(180deg,rgba(19,40,64,.62),rgba(19,40,64,.12) 18%,transparent 30%)}
.page-hero .ph-grid{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,.96fr);gap:clamp(28px,4.5vw,64px);align-items:center;min-height:clamp(250px,28vh,340px);padding:clamp(96px,9vh,118px) 0 clamp(30px,3.6vh,46px)}
.page-hero>.wrap:not(.ph-grid){position:relative;z-index:2;padding-top:clamp(142px,16vh,196px);padding-bottom:clamp(68px,8.5vh,108px)}
.page-hero .ph-crumb{display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.48);font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
.page-hero .ph-crumb a{transition:color .25s}.page-hero .ph-crumb a:hover,.page-hero .ph-crumb b{color:#f2b19d}.page-hero .ph-crumb b{font-weight:700}
.page-hero .kicker{color:#f2b19d}.page-hero-split .kicker{margin-top:20px}
.page-hero h1{max-width:none;margin:20px 0 0;font:500 clamp(46px,6.4vw,96px)/.9 var(--serif);letter-spacing:-.05em}
.page-hero-split h1{margin-top:16px;font-size:clamp(38px,4.3vw,64px);line-height:.92}.page-hero h1 em{color:#f2b19d;font-style:italic}
.page-hero :is(p,.hero-description){max-width:62ch;margin:24px 0 0;color:rgba(255,255,255,.76);font-size:17px}.page-hero-split :is(p,.hero-description){max-width:54ch;margin-top:22px;color:rgba(255,255,255,.78);font-size:16.5px}.page-hero .hero-ctas{margin-top:30px}
.page-hero .facts-label{margin-top:34px;color:rgba(255,255,255,.62)}
.page-hero .ph-facts{display:flex;flex-wrap:wrap;gap:22px clamp(24px,3vw,46px);margin-top:clamp(28px,3.4vh,40px);padding-top:26px;border-top:1px solid rgba(255,255,255,.2)}
.page-hero .ph-facts strong{display:block;color:#fff;font:700 clamp(19px,1.9vw,25px)/1 var(--sans);letter-spacing:-.035em}.page-hero .ph-facts strong small{font-size:.5em;font-weight:700;letter-spacing:0}
.page-hero .ph-facts span{display:block;margin-top:8px;color:rgba(255,255,255,.55);font-size:11px;font-weight:700;letter-spacing:.11em;text-transform:uppercase}
.page-hero .ph-facts.four{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 28px}
.page-hero .ph-tags{display:flex;flex-wrap:wrap;gap:8px;margin:clamp(26px,3.2vh,36px) 0 0;padding:0;list-style:none}.page-hero .ph-tags li{padding:8px 15px;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.86);font-size:12px;font-weight:600}
.page-hero .btn.ghost{color:var(--white);border-color:rgba(255,255,255,.42)}.page-hero .btn.ghost:hover{background:var(--white);color:var(--navy)}
.page-hero .status h1 em,.page-hero .status .big{color:#f2b19d}.page-hero .status p{color:rgba(255,255,255,.76)}.page-hero .status .mark{background:rgba(255,255,255,.1);color:#f2b19d}
.page-hero.page-hero-vortex{min-height:clamp(700px,96vh,1280px);display:flex;align-items:center;overflow:hidden;padding:clamp(150px,17vh,210px) 0 clamp(70px,9vh,110px);background:var(--navy-dark);text-align:center}
.page-hero-vortex .ph-vortex-media{position:absolute;z-index:0;top:50%;left:50%;transform:translate(-50%,-50%);height:min(82%,1240px);width:auto;max-width:min(100%,1240px);aspect-ratio:1;-webkit-mask-image:radial-gradient(closest-side,#000 98%,transparent 100%);mask-image:radial-gradient(closest-side,#000 98%,transparent 100%)}
.page-hero-vortex .ph-vortex-media canvas{display:block}
.page-hero.page-hero-vortex::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,var(--navy-dark) 0,var(--navy-dark) 94px,rgba(11,26,44,.72) 112px,rgba(11,26,44,0) 150px),linear-gradient(0deg,var(--navy-dark) 0,rgba(11,26,44,0) 70px),radial-gradient(40% 46% at 50% 53%,rgba(11,26,44,.95) 0%,rgba(11,26,44,.86) 44%,rgba(11,26,44,.46) 64%,rgba(11,26,44,0) 84%)}
.page-hero.page-hero-vortex>.wrap{position:absolute;z-index:2;top:50%;left:50%;width:var(--wrap);padding:0;transform:translate(-50%,-50%)}
.page-hero-vortex .ph-vortex-copy{max-width:min(880px,100%);margin-inline:auto}
.page-hero-vortex h1{margin:22px auto 0;max-width:none;font:500 clamp(50px,7vw,118px)/.86 var(--serif);letter-spacing:-.055em;text-wrap:balance}
.page-hero-vortex .ph-vortex-copy>h1:first-child{margin-top:0}
.page-hero-vortex :is(p,.hero-description){margin:26px auto 0;max-width:56ch;color:rgba(255,255,255,.78);font-size:clamp(16px,1.3vw,18px);line-height:1.68}
[dir="rtl"] .page-hero .ph-media{transform:scaleX(-1)}
@media(min-width:1051px){[dir="rtl"] .page-hero .ph-media{right:auto;left:0}.page-hero-vortex h1{font-size:clamp(50px,min(6.25vw,5.75vh),105px)}}
@media(min-width:1051px) and (max-height:1100px){.page-hero.page-hero-vortex{min-height:1000px}.page-hero-vortex .ph-vortex-media{height:min(80%,840px)}.page-hero-vortex :is(p,.hero-description){max-width:min(56ch,500px)}}
@media(max-width:1050px){.page-hero .ph-grid{grid-template-columns:1fr;gap:34px;min-height:0;padding:clamp(128px,15vh,168px) 0 clamp(40px,5vh,60px)}.page-hero-split :is(h1,p,.hero-description),.page-hero .ph-facts{max-width:none}.page-hero .ph-media{position:relative;z-index:2;right:auto;width:var(--wrap);height:clamp(190px,30vw,300px);margin:0 auto clamp(36px,5vh,56px);border-radius:20px}.page-hero .ph-media img{-webkit-mask-image:none;mask-image:none}.page-hero .ph-media::after{background:linear-gradient(0deg,rgba(19,40,64,.42),transparent 55%)}.page-hero.page-hero-split{display:flex;flex-direction:column-reverse}.page-hero.page-hero-vortex{display:block;padding:clamp(112px,15vh,148px) 0 clamp(52px,7vh,74px)}.page-hero.page-hero-vortex>.wrap{position:relative;top:auto;left:auto;width:var(--wrap);transform:none}.page-hero-vortex .ph-vortex-media{position:relative;top:auto;left:auto;transform:none;height:auto;width:min(100%,600px);max-width:none;margin:0 auto clamp(24px,3.4vh,38px)}.page-hero.page-hero-vortex::after{background:linear-gradient(180deg,var(--navy-dark) 0,rgba(11,26,44,.8) 64px,rgba(11,26,44,0) 140px),radial-gradient(58% 30% at 50% 22%,rgba(11,26,44,.9) 0%,rgba(11,26,44,.5) 55%,rgba(11,26,44,0) 82%)}}
@media(max-width:700px){.page-hero .ph-grid{padding-top:clamp(118px,14vh,150px)}.page-hero .ph-facts{gap:18px 26px}}
@media(min-width:901px){.page-hero[data-media-position=left] .ph-media{right:auto;left:0}.page-hero[data-media-position=left] .ph-copy{grid-column:2}.page-hero[data-media-position=left] .ph-media img{mask-image:linear-gradient(270deg,transparent 0%,#000 24%)}.page-hero[data-media-position=left] .ph-media::after{transform:scaleX(-1)}}
@media(max-width:700px){.page-hero.page-hero-vortex{min-height:0}}
@media(max-width:640px){.page-hero .ph-facts.four{grid-template-columns:1fr}}`

type PageHeroProps={
  as?:'header'|'section'
  className?:string
  image?:string|null
  imageAlt?:string
  media?:ReactNode
  layout?:'plain'|'split'|'vortex'
  mediaPosition?:'left'|'right'
  children:ReactNode
}

export function PageHero({as:Root='section',className,image,imageAlt='',media,layout='split',mediaPosition='right',children}:PageHeroProps){
  const split=layout==='split'
  const vortex=layout==='vortex'
  return <>
    <style data-page-hero-css>{criticalCss}</style>
    <Root data-media-position={mediaPosition} className={`page-hero${split?' page-hero-split':''}${vortex?' page-hero-vortex':''}${className?` ${className}`:''}`}>
      {image&&<HeroMedia src={image} alt={imageAlt} preload/>}
      {media}
      <div className={`wrap${split?' ph-grid':''}`}>
        {split?<div className="ph-copy">{children}</div>:vortex?<div className="ph-vortex-copy">{children}</div>:children}
      </div>
    </Root>
  </>
}
